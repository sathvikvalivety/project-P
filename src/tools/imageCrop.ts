import type { AnchorPosition } from '../components/shared/AnchorPicker';

export async function imageCrop(file: File, options: Record<string, unknown>): Promise<Uint8Array> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });
  URL.revokeObjectURL(url);

  const cropWidth = options.width ? Number(options.width) : img.width;
  const cropHeight = options.height ? Number(options.height) : img.height;
  const anchor = (options.anchor as AnchorPosition) || 'center';

  let sx = 0;
  let sy = 0;

  if (anchor.includes('left')) sx = 0;
  else if (anchor.includes('right')) sx = img.width - cropWidth;
  else sx = (img.width - cropWidth) / 2;

  if (anchor.includes('top')) sy = 0;
  else if (anchor.includes('bottom')) sy = img.height - cropHeight;
  else sy = (img.height - cropHeight) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  const ctx = canvas.getContext('2d')!;
  
  ctx.drawImage(img, sx, sy, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) return reject(new Error("Canvas toBlob failed"));
      blob.arrayBuffer().then(buf => resolve(new Uint8Array(buf))).catch(reject);
    }, file.type || 'image/png');
  });
}
