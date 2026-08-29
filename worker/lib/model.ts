// Which model answers, and the shape every route talks to.
//
// The routes do not know or care who is behind this. That is the whole point:
// Stay With Me started on Claude, runs on Gemini's free tier because a student
// should not have to pay to build something, and could move again without any
// route changing.
//
// Selection is by which key exists. Gemini first, because it is the one that
// costs nothing.

import type { Env } from '../types';
import { anthropicProvider } from './anthropic';
import { geminiProvider } from './gemini';

/** A picture, already split out of its data URL. */
export interface Image {
  mediaType: string;
  data: string;
}

export interface ModelMessage {
  role: 'user' | 'assistant';
  text: string;
  images?: Image[];
}

export interface ChatOptions {
  system: string;
  messages: ModelMessage[];
  maxTokens: number;
}

export interface Provider {
  /** For /api/health and error messages. */
  name: string;
  /** The reply, a piece at a time. */
  stream(env: Env, options: ChatOptions): AsyncGenerator<string>;
  /** The whole reply at once -- used where nothing is being read live. */
  once(env: Env, options: ChatOptions): Promise<string>;
}

/** What the companion says when a safety filter refuses the turn. */
export const DECLINED =
  "Sorry -- I can't go there with you. I'm still here though, if you want to talk about something else.";

/** Which provider is configured, or null. Used by /api/health. */
export function configuredProvider(env: Env): string | null {
  if (env.GEMINI_API_KEY) return geminiProvider.name;
  if (env.ANTHROPIC_API_KEY) return anthropicProvider.name;
  return null;
}

export function provider(env: Env): Provider {
  if (env.GEMINI_API_KEY) return geminiProvider;
  if (env.ANTHROPIC_API_KEY) return anthropicProvider;

  throw new Error(
    'No model key is set on this Worker. Add GEMINI_API_KEY (free, from aistudio.google.com/apikey) or ANTHROPIC_API_KEY. See SETUP.md.',
  );
}
