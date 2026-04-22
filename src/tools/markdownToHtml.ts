import { marked } from 'marked';

const CSS = `
  body {
    font-family: Georgia, serif;
    line-height: 1.6;
    color: #333;
    max-width: 720px;
    margin: 0 auto;
    padding: 2rem;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }
  pre {
    background-color: #f6f8fa;
    padding: 16px;
    overflow: auto;
    border-radius: 6px;
  }
  code {
    font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
    background-color: #f6f8fa;
    padding: 0.2em 0.4em;
    border-radius: 3px;
  }
  pre code {
    background-color: transparent;
    padding: 0;
  }
  blockquote {
    border-left: 4px solid #dfe2e5;
    padding: 0 1em;
    color: #6a737d;
    margin-left: 0;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 1rem;
  }
  th, td {
    border: 1px solid #dfe2e5;
    padding: 6px 13px;
  }
  th { background-color: #f6f8fa; }
  img { max-width: 100%; }
`;

export async function markdownToHtml(file: File): Promise<Uint8Array> {
  const text = await file.text();
  const htmlContent = await marked.parse(text);

  const htmlStr = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>${CSS}</style>
</head>
<body>
${htmlContent}
</body>
</html>`;

  return new TextEncoder().encode(htmlStr);
}
