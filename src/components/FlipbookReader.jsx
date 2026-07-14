"use client";
import React, { useState, useEffect, forwardRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';

// Fast background rendering worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const BookPage = forwardRef(({ pageNumber, width }, ref) => {
  return (
    <div ref={ref} className="bg-white overflow-hidden flex items-start justify-center shadow-[inset_0_0_15px_rgba(0,0,0,0.05)] border-l border-r border-slate-200/40">
      <Page 
        pageNumber={pageNumber} 
        width={width} // Strictly sync PDF width with Flipbook container width
        renderTextLayer={false} 
        renderAnnotationLayer={false}
        className="pointer-events-none select-none"
        // Limits canvas resolution on ultra-HD phones to prevent lag
        devicePixelRatio={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1} 
      />
    </div>
  );
});
BookPage.displayName = 'BookPage';

export default function FlipbookReader({ pdfUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Elite level responsive calculation
  useEffect(() => {
    const updateDimensions = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      
      const isMobile = screenWidth < 768;
      
      // Calculate max available width (leaving margins)
      const maxWidth = isMobile ? screenWidth - 32 : (screenWidth / 2) - 64; 
      // Leave space for the "Web Reader" top bar (approx 120px)
      const maxHeight = screenHeight - 120; 
      
      // Standard book aspect ratio (approx 1 : 1.414)
      let calculatedWidth = maxWidth;
      let calculatedHeight = calculatedWidth * 1.414;
      
      // If calculated height overflows the screen, scale down by height instead
      if (calculatedHeight > maxHeight) {
        calculatedHeight = maxHeight;
        calculatedWidth = calculatedHeight / 1.414;
      }

      setDimensions({ width: calculatedWidth, height: calculatedHeight });
    };

    updateDimensions(); // Run on mount
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  if (!pdfUrl) return null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#07070d] overflow-hidden select-none" onContextMenu={(e) => e.preventDefault()}>
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
        {numPages && dimensions.width > 0 && (
          <div className="relative flex justify-center items-center w-full h-full p-2 md:p-6">
            <HTMLFlipBook 
              width={dimensions.width} 
              height={dimensions.height} 
              size="fixed" // Forces exact dimensions, completely eliminating the cropping bug
              usePortrait={true} // Automatically switches to single page on mobile
              showCover={true}
              maxShadowOpacity={0.15} // Reduced shadow drastically improves 3D animation speed
              drawShadow={true}
              flippingTime={700} // Slightly faster flip for snappier feel
              swipeDistance={30} // Makes mobile swiping more responsive
              className="flipbook-wrapper mx-auto drop-shadow-2xl"
            >
              {Array.from(new Array(numPages), (el, index) => (
                <BookPage 
                  key={`page_${index + 1}`} 
                  pageNumber={index + 1} 
                  width={dimensions.width} // Passing dynamic width to react-pdf
                />
              ))}
            </HTMLFlipBook>
          </div>
        )}
      </Document>
    </div>
  );
}
