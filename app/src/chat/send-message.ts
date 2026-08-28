// One exchange, start to finish: store what they said, stream the reply,
// store that too, then decide what was worth remembering.

import { id } from '../core/ids';
import type { ConversationState } from '../friendship/state';
import { refreshMemory } from '../memory/refresh';
import { repo } from '../repo';
import type { StoredMessage } from '../repo/types';
import { buildContext } from './context';
import { readState } from './read-state';
import { streamReply } from './stream-reply';
import type { OnChunk } from './types';
import { windowFor } from './window';

export interface SendOptions {
  userId: string;
  displayName: string;
  characterId: string;
  text: string;
  /** Photos or video frames going up with this message. */
  images?: string[];
  /** Everything already on screen, oldest first. */
  history: StoredMessage[];
  /** The last known reading, so this turn is shaped by it. */
  state?: ConversationState;
  onChunk: OnChunk;
  /** Fires when the fresh reading lands, which is usually after the reply. */
  onState?: (state: ConversationState) => void;
  signal?: AbortSignal;
}

export interface SendResult {
  question: StoredMessage;
  answer: StoredMessage;
}

export async function sendMessage(options: SendOptions): Promise<SendResult> {
  const question: StoredMessage = {
    id: id(),
    role: 'user',
    text: options.text,
    at: new Date().toISOString(),
    images: options.images?.length ? options.images : undefined,
  };

  // Stored before the reply is asked for: if the network dies mid-request,
  // what they typed is still there when they come back.
  await repo.addMessage(options.userId, options.characterId, question);

  const conversation = [...options.history, question];
  const context = await buildContext(options.userId, options.characterId, options.displayName);
  const wire = windowFor(conversation);

  // Started before the reply and never awaited with it: reading the mood is
  // a second call, and making the person wait for it would undo the point
  // of streaming.
  void readState(wire).then((state) => {
    if (state) options.onState?.(state);
  });

  const text = await streamReply({
    context: { ...context, state: options.state },
    messages: wire,
    onChunk: options.onChunk,
    signal: options.signal,
  });

  const answer: StoredMessage = {
    id: id(),
    role: 'assistant',
    text,
    at: new Date().toISOString(),
  };
  await repo.addMessage(options.userId, options.characterId, answer);

  // Also not awaited: the memory pass is another call and the person is
  // already reading the reply.
  void refreshMemory(options.userId, options.characterId, [...conversation, answer]);

  return { question, answer };
}
