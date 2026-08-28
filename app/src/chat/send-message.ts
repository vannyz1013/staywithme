// One exchange, start to finish: store what they said, stream the reply,
// store that too, then decide whether anything here is worth remembering.

import { id } from '../core/ids';
import { loadMemory } from '../memory/load';
import { refreshMemory } from '../memory/refresh';
import { repo } from '../repo';
import type { StoredMessage } from '../repo/types';
import { streamReply } from './stream-reply';
import type { OnChunk } from './types';
import { windowFor } from './window';

export interface SendOptions {
  userId: string;
  displayName: string;
  characterId: string;
  text: string;
  /** Everything already on screen, oldest first. */
  history: StoredMessage[];
  onChunk: OnChunk;
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
  };

  // Stored before the reply is asked for: if the network dies mid-request,
  // what they typed is still there when they come back.
  await repo.addMessage(options.userId, options.characterId, question);

  const conversation = [...options.history, question];
  const memory = await loadMemory(options.userId, options.characterId);

  const text = await streamReply({
    characterId: options.characterId,
    messages: windowFor(conversation),
    memory,
    displayName: options.displayName,
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

  const full = [...conversation, answer];
  // Not awaited: the memory pass is a second API call and the person is
  // already reading the reply.
  void refreshMemory(options.userId, options.characterId, full);

  return { question, answer };
}
