import mammoth from 'mammoth';

export async function docxToHtml(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  
  const options = {
    styleMap: [
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh",
      "p[style-name='Heading 3'] => h3:fresh",
      "p[style-name='Heading 4'] => h4:fresh",
      "p[style-name='Heading 5'] => h5:fresh",
      "p[style-name='Heading 6'] => h6:fresh",
      "table => table:fresh"
    ]
  };

  const result = await mammoth.convertToHtml({ arrayBuffer }, options);
  
  // Wrap in basic HTML structure
  const htmlStr = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    font-family: system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  table { border-collapse: collapse; width: 100%; margin-bottom: 1rem; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  th { background-color: #f2f2f2; }
</style>
</head>
<body>
${result.value}
</body>
</html>`;

  return new TextEncoder().encode(htmlStr);
}
