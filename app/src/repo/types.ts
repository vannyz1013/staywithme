// The storage contract. Two implementations satisfy it -- Supabase when a
// project is configured, localStorage when one is not -- and nothing above
// this layer knows which one it got.

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  /** ISO timestamp. */
  at: string;
}

export interface Repo {
  messages(userId: string, characterId: string): Promise<StoredMessage[]>;
  addMessage(userId: string, characterId: string, message: StoredMessage): Promise<void>;
  memory(userId: string, characterId: string): Promise<string[]>;
  addMemory(userId: string, characterId: string, facts: string[]): Promise<void>;
  clear(userId: string, characterId: string): Promise<void>;
}
