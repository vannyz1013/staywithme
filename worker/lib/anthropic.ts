// One place that builds the Anthropic client, and one place that names the
// model -- so changing either is a one-line edit.

import Anthropic from '@anthropic-ai/sdk';
import type { Env } from '../types';

export const MODEL = 'claude-opus-5';

/**
 * `low` effort, deliberately. This is conversation, not a hard problem: the
 * quality difference in chat is small and the latency difference is not.
 * Raise it here if replies ever feel shallow.
 */
export const EFFORT = 'low' as const;

export function anthropic(env: Env): Anthropic {
  if (!env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set on this Worker.');
  }
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
}
