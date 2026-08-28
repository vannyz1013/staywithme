// Shapes shared across the Worker. Nothing here executes.

export interface Env {
  /** Set with `bunx wrangler secret put ANTHROPIC_API_KEY`. Never in git. */
  ANTHROPIC_API_KEY: string;
}

/** One line of the conversation, as the browser sends it up. */
export interface WireMessage {
  role: 'user' | 'assistant';
  text: string;
}

/** POST /api/chat */
export interface ChatRequest {
  characterId: string;
  /** Trimmed history, oldest first, INCLUDING the new user message last. */
  messages: WireMessage[];
  /** What the friend already knows about this person. May be empty. */
  memory: string[];
  /** What the person likes to be called. Optional. */
  displayName?: string;
}

/** POST /api/remember */
export interface RememberRequest {
  characterId: string;
  messages: WireMessage[];
  /** Facts already stored, so the model does not repeat them. */
  memory: string[];
}
