"use client";
import React, { useState, useEffect, forwardRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';

// Fast background rendering worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// How many pages before/after the current one get fully rendered.
// Everything outside this window shows a lightweight placeholder instead of
// a real PDF canvas, which is the main thing that was causing the stutter
// (rendering every single page's canvas at once is very heavy on mobile).
const RENDER_WINDOW = 2;

// Elite 3D Book Page with Premium Borders & High Quality
const BookPage = forwardRef(({ pageNumber, width, height, shouldRender }, ref) => {
  return (
    <div 
      ref={ref} 
      className="bg-white overflow-hidden flex items-start justify-center shadow-[inset_0_0_15px_rgba(0,0,0,0.06)] border border-amber-600/30 box-border relative"
      style={{ 
        // Advanced Hardware Acceleration for Smooth Flipping
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* 3D Spine Shadow Effect (Left Side) */}
      <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-black/10 to-transparent z-10 pointer-events-none" />
      
      {shouldRender ? (
        <Page 
          pageNumber={pageNumber} 
          width={width - 2} 
          renderTextLayer={false} 
          renderAnnotationLayer={false}
          className="pointer-events-none select-none"
          // Full quality — not reduced on mobile
          devicePixelRatio={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 2} 
        />
      ) : (
        // Lightweight placeholder for off-screen pages, same size, so there's
        // no layout jump. It gets swapped for the real page just before it's
        // needed, so you won't see a blank flash while flipping.
        <div style={{ width: width - 2, height: height || '100%' }} className="bg-white" />
      )}
    </div>
  );
});
BookPage.displayName = 'BookPage';

export default function FlipbookReader({ pdfUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [initialPage, setInitialPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isInit, setIsInit] = useState(false);

  // Elite level responsive calculation & Progress Tracking Setup
  useEffect(() => {
    if (pdfUrl) {
      const bookKey = pdfUrl.split('?')[0].slice(-30);
      const storageKey = `vedoxa_progress_${bookKey}`;
      const savedPage = localStorage.getItem(storageKey);
      
      if (savedPage) {
        setInitialPage(parseInt(savedPage, 10));
        setCurrentPage(parseInt(savedPage, 10));
      }
    }
    setIsInit(true);

    const updateDimensions = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const isMobile = screenWidth < 768;
      
      // Calculate max available width
      const maxWidth = isMobile ? screenWidth - 32 : (screenWidth / 2) - 64; 
      const maxHeight = screenHeight - 140; 
      
      // Standard book aspect ratio (approx 1 : 1.414)
      let calculatedWidth = maxWidth;
      let calculatedHeight = calculatedWidth * 1.414;
      
      if (calculatedHeight > maxHeight) {
        calculatedHeight = maxHeight;
        calculatedWidth = calculatedHeight / 1.414;
      }

      setDimensions({ width: calculatedWidth, height: calculatedHeight });
    };

    updateDimensions(); 
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [pdfUrl]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const handlePageFlip = (e) => {
    const newPageIndex = e.data;
    setCurrentPage(newPageIndex);
    
    if (pdfUrl) {
      const bookKey = pdfUrl.split('?')[0].slice(-30);
      localStorage.setItem(`vedoxa_progress_${bookKey}`, newPageIndex.toString());
    }
  };

  if (!pdfUrl || !isInit) return null;

  return (
    <div 
      className="w-full h-full bg-[#07070d] overflow-hidden select-none relative flex flex-col" 
      onContextMenu={(e) => e.preventDefault()}
    >
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex flex-col items-center justify-center gap-3 w-full h-full">
            <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
            <div className="text-amber-500 font-bold animate-pulse text-sm">Loading Your Saved Progress...</div>
          </div>
        }
        error={<div className="text-red-500 font-bold p-4 bg-red-500/10 rounded-xl border border-red-500/20 m-auto mt-20">Failed to load secure document.</div>}
      >
        {numPages && dimensions.width > 0 && (
          // Main Scrollable Area
          <div className="flex-1 w-full h-full overflow-auto custom-scrollbar">
            {/* Centering Wrapper */}
            <div className="min-w-full min-h-full flex items-center justify-center p-4 md:p-8">
              <div className="drop-shadow-2xl">
                <HTMLFlipBook 
                  width={dimensions.width} 
                  height={dimensions.height} 
                  size="fixed"
                  usePortrait={true}
                  showCover={true}
                  maxShadowOpacity={0.15}
                  drawShadow={true}
                  flippingTime={500} // Set to 500 for a perfectly soft, realistic & fast flip
                  swipeDistance={30}
                  startPage={initialPage} 
                  onFlip={handlePageFlip} 
                  className="flipbook-wrapper mx-auto"
                >
                  {Array.from(new Array(numPages), (el, index) => {
                    const pageNumber = index + 1;
                    const shouldRender = Math.abs(index - currentPage) <= RENDER_WINDOW;
                    return (
                      <BookPage 
                        key={`page_${pageNumber}`} 
                        pageNumber={pageNumber} 
                        width={dimensions.width} 
                        height={dimensions.height}
                        shouldRender={shouldRender}
                      />
                    );
                  })}
                </HTMLFlipBook>
              </div>
            </div>
          </div>
        )}

        {/* Premium Floating Page Number Overlay */}
        {numPages && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl text-amber-400 px-5 py-2 rounded-full text-[10px] md:text-xs font-black tracking-widest border border-amber-500/20 z-50 shadow-[0_4px_24px_rgba(212,146,26,0.18)] flex items-center gap-2 pointer-events-none transition-all">
            <span className="opacity-60 font-semibold">PAGE</span> 
            <span className="text-amber-500 text-xs md:text-sm">{currentPage + 1}</span> 
            <span className="opacity-40">/</span> 
            <span className="opacity-80">{numPages}</span>
          </div>
        )}
      </Document>
    </div>
  );
}
