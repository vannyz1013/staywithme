// Sharing a video, as far as that is possible.
//
// Claude cannot watch video -- the API takes text, images and PDFs, and
// there is no video input to send one to. So a clip becomes a handful of
// stills taken across its length, which is enough for "look what happened"
// and honest about being less than the video itself. The chat screen says so
// when you attach one.

import { compressImage } from './compress-image';

const FRAME_COUNT = 3;

function seek(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    video.addEventListener('seeked', () => resolve(), { once: true });
    video.addEventListener('error', () => reject(new Error('That video could not be read.')), {
      once: true,
    });
    video.currentTime = time;
  });
}

function loaded(video: HTMLVideoElement): Promise<void> {
  return new Promise((resolve, reject) => {
    video.addEventListener('loadeddata', () => resolve(), { once: true });
    video.addEventListener('error', () => reject(new Error('That video could not be read.')), {
      once: true,
    });
  });
}

/** Returns FRAME_COUNT stills spread across the clip, as compressed data URLs. */
export async function videoFrames(file: File): Promise<string[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = url;

  try {
    await loaded(video);
    const duration = Number.isFinite(video.duration) ? video.duration : 0;

    const canvas = document.createElement('canvas');
    const frames: string[] = [];

    for (let index = 0; index < FRAME_COUNT; index += 1) {
      // Spread across the middle rather than the ends: the first and last
      // frames of a phone clip are usually a blur or a lens cap.
      await seek(video, duration * ((index + 1) / (FRAME_COUNT + 1)));

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) break;
      context.drawImage(video, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.8),
      );
      if (blob) frames.push(await compressImage(blob));
    }

    return frames;
  } finally {
    URL.revokeObjectURL(url);
    video.removeAttribute('src');
  }
}
