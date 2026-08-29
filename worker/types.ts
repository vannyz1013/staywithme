// Shapes shared across the Worker. Nothing here executes.

export interface Env {
  /**
   * Google Gemini, the default: free tier, no card, from
   * aistudio.google.com/apikey. Set with
   * `bunx wrangler secret put GEMINI_API_KEY`. Never in git.
   */
  GEMINI_API_KEY: string;

  /** Anthropic's Claude. Better replies, pay-as-you-go. Optional. */
  ANTHROPIC_API_KEY: string;
}

/** One line of the conversation, as the browser sends it up. */
export interface WireMessage {
  role: 'user' | 'assistant';
  text: string;
  /** `data:image/...;base64,...` -- photos, or frames pulled from a video. */
  images?: string[];
}

/** What the person has changed about this friend. Every field optional. */
export interface WireProfile {
  name?: string;
  gender?: string;
  age?: string;
  note?: string;
}

/** How the conversation is going, from the last /api/state read. */
export interface WireState {
  mood?: string;
  energy?: 'low' | 'medium' | 'high';
  wantsAdvice?: boolean;
  wantsCompany?: boolean;
}

/** Everything the prompt builder needs, on every model-facing route. */
export interface Context {
  characterId: string;
  memory?: string[];
  /** How the friend has changed by knowing this person. */
  traits?: string[];
  displayName?: string;
  profile?: WireProfile;
  /** 'talk' | 'vent' | 'advice' | 'listen' | 'stay'. Anything else is ignored. */
  mode?: string;
  /** 'auto' follows whatever they wrote in. See prompt/language.ts. */
  language?: string;
  state?: WireState;
}

/** POST /api/chat */
export interface ChatRequest extends Context {
  /** Trimmed history, oldest first, INCLUDING the new user message last. */
  messages: WireMessage[];
}

/** POST /api/nudge -- the friend speaking first, into a silence. */
export interface NudgeRequest extends Context {
  messages: WireMessage[];
  /** How long they have been quiet. Shapes what is worth saying. */
  quietMinutes: number;
  /** 'silence' while the chat is open, 'return' when they come back after days. */
  reason: 'silence' | 'return';
}

/** POST /api/state */
export interface StateRequest {
  messages: WireMessage[];
}

/** POST /api/remember */
export interface RememberRequest {
  characterId: string;
  messages: WireMessage[];
  /** Facts already stored, so the model does not repeat them. */
  memory: string[];
}
