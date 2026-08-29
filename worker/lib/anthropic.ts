// Anthropic's Claude, behind the same interface as every other provider.
//
// Not the default any more -- it is pay-as-you-go and this project runs on a
// free tier -- but it stays wired up, because it gives the best replies and
// switching back is one environment variable.

import Anthropic from '@anthropic-ai/sdk';
import type { Env } from '../types';
import { DECLINED, type ChatOptions, type ModelMessage, type Provider } from './model';

export const MODEL = 'claude-opus-5';

/**
 * `low` effort, deliberately. This is conversation, not a hard problem: the
 * quality difference in chat is small and the latency difference is not.
 */
export const EFFORT = 'low' as const;

function client(env: Env): Anthropic {
  return new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
}

function toMessages(messages: ModelMessage[]) {
  return messages.map((message) => {
    const images = message.images ?? [];
    if (images.length === 0) {
      return { role: message.role, content: message.text };
    }

    return {
      role: message.role,
      content: [
        ...images.map((image) => ({
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: image.mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: image.data,
          },
        })),
        // Text after the picture: a caption reads better once the thing being
        // captioned has been seen.
        { type: 'text' as const, text: message.text || 'Look at this.' },
      ],
    };
  });
}

export const anthropicProvider: Provider = {
  name: 'claude',

  async *stream(env, options) {
    const stream = client(env).beta.messages.stream({
      model: MODEL,
      max_tokens: options.maxTokens,
      output_config: { effort: EFFORT },
      system: options.system,
      messages: toMessages(options.messages),
      // People bring their worst nights to an app called Stay With Me, and a
      // safety classifier declining one of those is the moment the app most
      // needs to still say something. This routes the turn to another model
      // instead of returning a refusal.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    });

    let said = false;
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        said = true;
        yield event.delta.text;
      }
      if (event.type === 'message_delta' && event.delta.stop_reason === 'refusal' && !said) {
        yield DECLINED;
      }
    }
  },

  async once(env, options) {
    const response = await client(env).messages.create({
      model: MODEL,
      max_tokens: options.maxTokens,
      output_config: { effort: EFFORT },
      system: options.system,
      messages: toMessages(options.messages),
    });

    return response.content
      .filter((block): block is Extract<typeof block, { type: 'text' }> => block.type === 'text')
      .map((block) => block.text)
      .join('');
  },
};
