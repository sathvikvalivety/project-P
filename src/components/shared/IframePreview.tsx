import { useRef } from 'react';

interface IframePreviewProps {
  htmlContent: string;
}

export function IframePreview({ htmlContent }: IframePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  return (
    <div className="w-full h-full bg-white flex flex-col relative overflow-hidden">
      <iframe
        ref={iframeRef}
        srcDoc={htmlContent}
        sandbox="allow-same-origin"
        className="flex-grow w-full h-full border-none"
        title="Preview"
      />
    </div>
  );
}
