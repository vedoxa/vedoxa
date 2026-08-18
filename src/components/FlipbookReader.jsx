"use client";
import React, { useState, useEffect, forwardRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';

// Fast background rendering worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Elite 3D Book Page with Premium Borders & High Quality
const BookPage = forwardRef(({ pageNumber, width }, ref) => {
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
        // Restored High Quality Rendering (Up to 2x for Retina/HD displays)
        devicePixelRatio={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 2} 
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
  
  // New State for Advanced Zoom Functionality
  const [scale, setScale] = useState(1);

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

  // Zoom Controls Logic
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.3, 3)); // Max zoom 3x
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.3, 0.5)); // Min zoom 0.5x
  const handleZoomReset = () => setScale(1);

  if (!pdfUrl || !isInit) return null;

  return (
    <div 
      className="w-full h-full bg-[#07070d] overflow-hidden select-none relative flex flex-col" 
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Zoom Controls Overlay (Premium UI) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 bg-black/50 backdrop-blur-md p-2 rounded-2xl border border-amber-500/20 shadow-[0_0_20px_rgba(212,146,26,0.1)]">
        <button 
          onClick={handleZoomIn} 
          className="w-10 h-10 flex items-center justify-center text-amber-500 hover:bg-amber-500/20 hover:text-amber-400 rounded-xl transition-all font-bold text-2xl active:scale-95"
          aria-label="Zoom In"
        >
          +
        </button>
        <button 
          onClick={handleZoomReset} 
          className="w-10 h-10 flex items-center justify-center text-amber-500 hover:bg-amber-500/20 hover:text-amber-400 rounded-xl transition-all font-bold text-xs tracking-widest active:scale-95"
          aria-label="Reset Zoom"
        >
          FIT
        </button>
        <button 
          onClick={handleZoomOut} 
          className="w-10 h-10 flex items-center justify-center text-amber-500 hover:bg-amber-500/20 hover:text-amber-400 rounded-xl transition-all font-bold text-3xl active:scale-95 leading-none pb-1"
          aria-label="Zoom Out"
        >
          -
        </button>
      </div>

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
          // Main Scrollable Area for Pan & Zoom
          <div className="flex-1 w-full h-full overflow-auto custom-scrollbar">
            {/* Centering Wrapper */}
            <div className="min-w-full min-h-full flex items-center justify-center p-4 md:p-8">
              
              {/* Scale Spacer (Reserves space for the scaled book to allow scrolling) */}
              <div 
                style={{ 
                  width: dimensions.width * scale, 
                  height: dimensions.height * scale,
                  transition: 'width 0.3s ease-out, height 0.3s ease-out'
                }} 
                className="relative flex-shrink-0"
              >
                {/* Advanced CSS Scaled Container */}
                <div
                  style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: dimensions.width,
                    height: dimensions.height,
                    transition: 'transform 0.3s ease-out'
                  }}
                  className="drop-shadow-2xl"
                >
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


