// Opens the file picker and turns whatever comes back into data URLs.
//
// Photos are compressed; videos become a few frames. Either way the chat
// screen gets the same thing: an array of images ready to send.

import { compressImage } from './compress-image';
import { videoFrames } from './video-frames';

export interface Picked {
  images: string[];
  /** True when these came out of a video, so the UI can say so. */
  fromVideo: boolean;
}

const ACCEPT = 'image/*,video/*';

export function pickFile(): Promise<Picked | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ACCEPT;

    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);

      try {
        if (file.type.startsWith('video/')) {
          resolve({ images: await videoFrames(file), fromVideo: true });
        } else {
          resolve({ images: [await compressImage(file)], fromVideo: false });
        }
      } catch {
        resolve(null);
      }
    });

    // No 'cancel' handling: the picker is not guaranteed to fire one, and a
    // promise that never settles is only ever holding a local variable.
    input.click();
  });
}
