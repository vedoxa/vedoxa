"use client";
import React, { useState, useEffect, forwardRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';

// Fast background rendering worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Elite 3D Book Page with Premium Borders & High Quality
const BookPage = forwardRef(({ pageNumber, width }, ref) => {
  const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div 
      ref={ref} 
      className="bg-white overflow-hidden flex items-start justify-center shadow-[inset_0_0_15px_rgba(0,0,0,0.06)] border border-amber-600/30 box-border relative"
      style={{ 
        // Advanced Hardware Acceleration for Smooth Flipping
        transform: 'translateZ(0)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* 3D Spine Shadow Effect (Left Side) */}
      <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-black/10 to-transparent z-10 pointer-events-none" />
      
      <Page 
        pageNumber={pageNumber} 
        width={width - 2} 
        renderTextLayer={false} 
        renderAnnotationLayer={false}
        className="pointer-events-none select-none"
        // Lower pixel ratio on mobile to keep the flip animation smooth (avoids stutter)
        devicePixelRatio={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, isMobileDevice ? 1.5 : 2) : 2} 
      />
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
              {/* Cheaper box-shadow instead of a live filter drop-shadow, so it doesn't get recalculated every animation frame */}
              <div className="shadow-2xl">
                <HTMLFlipBook 
                  width={dimensions.width} 
                  height={dimensions.height} 
                  size="fixed"
                  usePortrait={true}
                  showCover={true}
                  drawShadow={false} 
                  flippingTime={500} // Set to 500 for a perfectly soft, realistic & fast flip
                  swipeDistance={30}
                  startPage={initialPage} 
                  onFlip={handlePageFlip} 
                  className="flipbook-wrapper mx-auto"
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <BookPage 
                      key={`page_${index + 1}`} 
                      pageNumber={index + 1} 
                      width={dimensions.width} 
                    />
                  ))}
                </HTMLFlipBook>
              </div>
            </div>
          </div>
        )}

        {/* Premium Floating Page Number Overlay */}
        {numPages && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-amber-400 px-5 py-2 rounded-full text-[10px] md:text-xs font-black tracking-widest border border-amber-500/20 z-50 shadow-[0_4px_24px_rgba(212,146,26,0.18)] flex items-center gap-2 pointer-events-none transition-all">
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
