// Turning what the browser sent into something a model can read.
//
// Provider-neutral: this file decides which pictures travel and splits them
// out of their data URLs, and each provider file turns the result into its
// own wire format.
//
// Images only. There is no video input on any of these APIs, so the app pulls
// frames out of a clip and sends those instead
// (app/src/media/video-frames.ts). By the time anything reaches here it is a
// still.

import type { ModelMessage } from './model';
import type { WireMessage } from '../types';

/** Beyond this the older pictures are dropped: cost, not capability. */
const IMAGE_MESSAGE_WINDOW = 4;
const IMAGES_PER_MESSAGE = 3;

/** The four every provider here accepts. Anything else is not sent. */
const MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/** Splits `data:image/jpeg;base64,xxxx` into the two halves a model wants. */
function fromDataUrl(dataUrl: string) {
  const match = /^data:([a-z/+-]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) return null;

  const mediaType = match[1]!;
  if (!MEDIA_TYPES.includes(mediaType)) return null;

  return { mediaType, data: match[2]! };
}

export function prepare(messages: WireMessage[]): ModelMessage[] {
  // Pictures from early in a long conversation are rarely still relevant and
  // would be re-uploaded on every single turn, so only recent ones ride along.
  const imagesAllowedFrom = Math.max(0, messages.length - IMAGE_MESSAGE_WINDOW);

  return messages.map((message, index) => {
    const raw = index >= imagesAllowedFrom ? (message.images ?? []) : [];

    const images = raw
      .slice(0, IMAGES_PER_MESSAGE)
      .map(fromDataUrl)
      .filter((image): image is { mediaType: string; data: string } => image !== null);

    return { role: message.role, text: message.text, images };
  });
}
