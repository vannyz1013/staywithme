// Shrinks a picked image before it goes anywhere.
//
// Two reasons, both hard limits rather than preferences: a phone photo is
// 3-6MB and localStorage holds about 5MB in total, and every image is
// re-sent to the model on later turns, so a big one is paid for repeatedly.
// 900px on the long edge is plenty for "look at this".

const MAX_EDGE = 900;
const QUALITY = 0.72;

export async function compressImage(file: File | Blob): Promise<string> {
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser would not give us a canvas.');
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // JPEG regardless of what came in: PNG screenshots of text are several
  // times larger for no gain once the model is the one reading them.
  return canvas.toDataURL('image/jpeg', QUALITY);
}
