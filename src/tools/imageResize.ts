export async function imageResize(file: File, options: Record<string, unknown>): Promise<Uint8Array> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });
  URL.revokeObjectURL(url);

  let targetWidth = options.width ? Number(options.width) : img.width;
  let targetHeight = options.height ? Number(options.height) : img.height;
  const maintainAspect = options.maintainAspectRatio as boolean !== false;

  if (maintainAspect) {
    if (options.width) {
      // Width takes priority
      targetHeight = (targetWidth / img.width) * img.height;
    } else if (options.height) {
      targetWidth = (targetHeight / img.height) * img.width;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;
  
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) return reject(new Error("Canvas toBlob failed"));
      blob.arrayBuffer().then(buf => resolve(new Uint8Array(buf))).catch(reject);
    }, file.type || 'image/png');
  });
}
