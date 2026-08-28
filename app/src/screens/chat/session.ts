// The state one open conversation shares.
//
// The chat screen is assembled from half a dozen small pieces -- the thread,
// the send flow, the silence timer, the mode bar -- and they all need the
// same handful of mutable things. Passing this one object around beats
// either a giant closure or six copies of the same three fields.

import type { User } from '../../auth/user';
import type { Character } from '../../characters/types';
import type { ConversationState } from '../../friendship/state';
import type { ModeId } from '../../modes/list';
import type { StoredMessage } from '../../repo/types';
import type { Composer } from '../../ui/composer';
import type { StatePanel } from '../../ui/state-panel';
import type { ThreadView } from './thread-view';

export interface ChatSession {
  user: User;
  character: Character;
  /** Aborted when the screen is left, so nothing writes into a dead DOM. */
  abort: AbortController;

  history: StoredMessage[];
  state?: ConversationState;
  mode: ModeId;
  /** True while a reply is streaming. The silence timer waits it out. */
  busy: boolean;

  view: ThreadView;
  input: Composer;
  panel: StatePanel;
}
