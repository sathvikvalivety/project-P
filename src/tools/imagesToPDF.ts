import { PDFDocument } from 'pdf-lib';

export async function imagesToPDF(files: File[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const file of files) {
    let imgBytes = await file.arrayBuffer();
    let fileType = file.type;

    // Convert WebP to PNG transparently using a canvas
    if (fileType === 'image/webp') {
      const blobURL = URL.createObjectURL(file);
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = blobURL;
      });

      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Could not acquire canvas context");
      
      ctx.drawImage(image, 0, 0);
      const pngDataUrl = canvas.toDataURL('image/png');
      const res = await fetch(pngDataUrl);
      imgBytes = await res.arrayBuffer();
      fileType = 'image/png';
      URL.revokeObjectURL(blobURL);
    }

    let embeddedImage;
    if (fileType === 'image/png') {
      embeddedImage = await pdfDoc.embedPng(imgBytes);
    } else if (fileType === 'image/jpeg' || fileType === 'image/jpg') {
      embeddedImage = await pdfDoc.embedJpg(imgBytes);
    } else {
      throw new Error(`Unsupported image type: ${fileType}`);
    }

    const { width, height } = embeddedImage.scale(1.0);
    const page = pdfDoc.addPage([width, height]);
    
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width,
      height
    });
  }

  return await pdfDoc.save();
}
