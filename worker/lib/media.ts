// Turning what the browser sent into content blocks the model can read.
//
// Images only. The API takes text, images and PDFs -- there is no video
// input -- so the app pulls frames out of a clip and sends those instead
// (app/src/media/video-frames.ts). By the time anything reaches here it is
// a still.

import type { WireMessage } from '../types';

/** Beyond this the older pictures are dropped: cost, not capability. */
const IMAGE_MESSAGE_WINDOW = 4;
const IMAGES_PER_MESSAGE = 3;

/** The four the API accepts. Anything else is not sent. */
const MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;
type MediaType = (typeof MEDIA_TYPES)[number];

type Block =
  | { type: 'text'; text: string }
  | { type: 'image'; source: { type: 'base64'; media_type: MediaType; data: string } };

function isMediaType(value: string): value is MediaType {
  return (MEDIA_TYPES as readonly string[]).includes(value);
}

/** Splits `data:image/jpeg;base64,xxxx` into the two halves the API wants. */
function fromDataUrl(dataUrl: string): Block | null {
  const match = /^data:([a-z/+-]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!match) return null;

  const mediaType = match[1]!;
  if (!isMediaType(mediaType)) return null;

  return { type: 'image', source: { type: 'base64', media_type: mediaType, data: match[2]! } };
}

export function toApiMessages(messages: WireMessage[]) {
  // Pictures from early in a long conversation are rarely still relevant and
  // would be re-uploaded on every single turn, so only recent ones ride along.
  const imagesAllowedFrom = Math.max(0, messages.length - IMAGE_MESSAGE_WINDOW);

  return messages.map((message, index) => {
    const images = index >= imagesAllowedFrom ? (message.images ?? []) : [];

    const blocks: Block[] = [];
    for (const dataUrl of images.slice(0, IMAGES_PER_MESSAGE)) {
      const block = fromDataUrl(dataUrl);
      if (block) blocks.push(block);
    }

    if (blocks.length === 0) {
      return { role: message.role, content: message.text };
    }

    // Text after the picture: the model reads a caption better once it has
    // seen what is being captioned.
    blocks.push({ type: 'text', text: message.text || 'Look at this.' });
    return { role: message.role, content: blocks };
  });
}
