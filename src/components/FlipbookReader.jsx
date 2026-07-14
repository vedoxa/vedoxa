"use client";
import React, { useState, forwardRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';

// Worker setup for fast background rendering (does not freeze the website)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// ForwardRef is strictly required by react-pageflip for page wrapping
const BookPage = forwardRef(({ pageNumber }, ref) => {
  return (
    <div 
      ref={ref} 
      className="bg-white shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] overflow-hidden flex items-center justify-center border-l border-r border-slate-200/50"
    >
      <Page 
        pageNumber={pageNumber} 
        width={400} // Base width, scales automatically
        renderTextLayer={false} 
        renderAnnotationLayer={false}
        className="pointer-events-none select-none" // Hard security against dragging/copying
      />
    </div>
  );
});
BookPage.displayName = 'BookPage';

export default function FlipbookReader({ pdfUrl }) {
  const [numPages, setNumPages] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  if (!pdfUrl) return null;

  return (
    <div className="w-full h-[85vh] flex flex-col items-center justify-center bg-[#07070d] overflow-hidden select-none" onContextMenu={(e) => e.preventDefault()}>
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
            <div className="text-amber-500 font-bold animate-pulse text-sm">Decrypting Premium Book...</div>
          </div>
        }
        error={<div className="text-red-500 font-bold p-4 bg-red-500/10 rounded-xl border border-red-500/20">Failed to load secure document.</div>}
      >
        {numPages && (
          <div className="relative flex justify-center items-center h-full w-full max-w-5xl p-4 md:p-10">
            <HTMLFlipBook 
              width={400} 
              height={600} 
              size="stretch"
              minWidth={250}
              maxWidth={500}
              minHeight={350}
              maxHeight={750}
              maxShadowOpacity={0.4}
              showCover={true}
              mobileScrollSupport={true}
              className="flipbook-wrapper mx-auto drop-shadow-2xl"
            >
              {Array.from(new Array(numPages), (el, index) => (
                <BookPage key={`page_${index + 1}`} pageNumber={index + 1} />
              ))}
            </HTMLFlipBook>
          </div>
        )}
      </Document>
    </div>
  );
}

