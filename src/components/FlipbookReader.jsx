"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  forwardRef,
  createContext,
  useContext,
} from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';

// Fast background rendering worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// How many pages before/after the current one get fully rendered.
// Everything outside this window shows a lightweight placeholder instead of
// a real PDF canvas (rendering every page's canvas at once is very heavy on mobile).
// 3 is used (instead of 2) because on laptop two pages are visible at once, so the
// NEXT spread needs pages up to current+3 to be ready before the flip starts.
const RENDER_WINDOW = 3;

// Standard book aspect ratio (approx 1 : 1.414). Replaced by the PDF's real ratio once loaded.
const DEFAULT_PAGE_RATIO = 1.414;

// IMPORTANT: this object must live OUTSIDE the component. If it is created inside,
// react-pdf thinks the options changed on every render and reloads the whole PDF.
const PDF_OPTIONS = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
  // Don't download the full PDF in the background — fetch only the pages that are needed.
  // This makes the first load much faster for big PDFs (needs server Range support, otherwise ignored).
  disableAutoFetch: true,
};

const getBookKey = (url) => url.split('?')[0].slice(-30);
const getStorageKey = (url) => `vedoxa_progress_${getBookKey(url)}`;

// Gives the current page to every BookPage WITHOUT changing the children passed to
// HTMLFlipBook. (If the children change, react-pageflip rebuilds all pages on every
// flip, and that was the main reason the flip animation was lagging.)
const CurrentPageContext = createContext(0);

// Elite 3D Book Page with Premium Borders & High Quality
const BookPage = forwardRef(({ pageNumber, width, height }, ref) => {
  const currentPage = useContext(CurrentPageContext);
  const shouldRender = Math.abs(pageNumber - 1 - currentPage) <= RENDER_WINDOW;

  // Lightweight placeholder, same size, so there's no layout jump. It gets swapped
  // for the real page just before it's needed, so you won't see a blank flash while flipping.
  const placeholder = (
    <div style={{ width: width - 2, height: height || '100%' }} className="bg-white" />
  );

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
          // Same-size white box while the page is drawing (instead of "Loading page…" text)
          loading={placeholder}
          error={placeholder}
          noData={placeholder}
          // Full quality — not reduced on mobile
          devicePixelRatio={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 2} 
        />
      ) : (
        placeholder
      )}
    </div>
  );
});
BookPage.displayName = 'BookPage';

export default function FlipbookReader({ pdfUrl }) {
  const [numPages, setNumPages] = useState(null);
  // Available area (measured from the real container, not just the window)
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const [pageRatio, setPageRatio] = useState(DEFAULT_PAGE_RATIO);
  const [initialPage, setInitialPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isInit, setIsInit] = useState(false);
  const containerRef = useRef(null);

  // Progress Tracking Setup (load saved page)
  useEffect(() => {
    let page = 0;
    if (pdfUrl) {
      try {
        const savedPage = localStorage.getItem(getStorageKey(pdfUrl));
        const parsed = savedPage !== null ? parseInt(savedPage, 10) : NaN;
        if (!Number.isNaN(parsed) && parsed > 0) page = parsed;
      } catch (err) {
        // localStorage can be blocked (private mode etc.) — just start from page 1
      }
    }
    setInitialPage(page);
    setCurrentPage(page);
    setNumPages(null);
    setIsInit(true);
  }, [pdfUrl]);

  // Elite level responsive measurement.
  // Runs again whenever the screen / container size changes (resize, rotate, sidebar toggle).
  useEffect(() => {
    if (!isInit || !pdfUrl) return undefined;

    let timer = null;

    const measure = () => {
      const el = containerRef.current;
      const width = el ? el.clientWidth : window.innerWidth;
      // Free height = screen height minus whatever is above the reader (header etc.)
      const top = el ? Math.max(el.getBoundingClientRect().top, 0) : 0;
      const height = Math.max(window.innerHeight - top, 0);

      setBounds((prev) => {
        // Ignore tiny changes (e.g. mobile address bar hiding) so the book doesn't rebuild for nothing
        if (Math.abs(prev.width - width) < 2 && Math.abs(prev.height - height) < 40) return prev;
        return { width, height };
      });
    };

    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(measure, 150);
    };

    measure();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);

    let observer = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      observer = new ResizeObserver(onResize);
      observer.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      if (observer) observer.disconnect();
    };
  }, [isInit, pdfUrl]);

  // Book size, calculated from the available area + the PDF's real page ratio
  const dimensions = useMemo(() => {
    const areaWidth = bounds.width;
    const areaHeight = bounds.height;
    if (!areaWidth || !areaHeight) return { width: 0, height: 0, isMobile: false };

    const isMobile = areaWidth < 768;

    // Calculate max available width (laptop shows 2 pages, so each page gets half)
    const maxWidth = Math.max(isMobile ? areaWidth - 32 : (areaWidth / 2) - 64, 120);
    const maxHeight = Math.max(areaHeight - (isMobile ? 112 : 120), 200);

    let calculatedWidth = maxWidth;
    let calculatedHeight = calculatedWidth * pageRatio;

    if (calculatedHeight > maxHeight) {
      calculatedHeight = maxHeight;
      calculatedWidth = calculatedHeight / pageRatio;
    }

    return {
      width: Math.floor(calculatedWidth),
      height: Math.floor(calculatedHeight),
      isMobile,
    };
  }, [bounds, pageRatio]);

  async function onDocumentLoadSuccess(pdf) {
    // Read the real page shape of the PDF so the book fits any PDF size correctly
    try {
      const firstPage = await pdf.getPage(1);
      const viewport = firstPage.getViewport({ scale: 1 });
      if (viewport.width > 0 && viewport.height > 0) {
        setPageRatio(viewport.height / viewport.width);
      }
    } catch (err) {
      // keep the default ratio
    }
    setNumPages(pdf.numPages);
  }

  // If the saved page doesn't exist in this PDF anymore, start from the beginning
  useEffect(() => {
    if (numPages && initialPage >= numPages) {
      setInitialPage(0);
      setCurrentPage(0);
    }
  }, [numPages, initialPage]);

  const handlePageFlip = useCallback((e) => {
    const newPageIndex = e.data;
    setCurrentPage(newPageIndex);
    
    if (pdfUrl) {
      try {
        localStorage.setItem(getStorageKey(pdfUrl), newPageIndex.toString());
      } catch (err) {
        // ignore storage errors
      }
    }
  }, [pdfUrl]);

  // The page list is memoized so HTMLFlipBook receives the SAME children on every
  // render. It only changes when the book size / page count changes.
  const pageList = useMemo(() => {
    if (!numPages || dimensions.width <= 0) return [];
    return Array.from(new Array(numPages), (el, index) => {
      const pageNumber = index + 1;
      return (
        <BookPage 
          key={`page_${pageNumber}`} 
          pageNumber={pageNumber} 
          width={dimensions.width} 
          height={dimensions.height}
        />
      );
    });
  }, [numPages, dimensions.width, dimensions.height]);

  if (!pdfUrl || !isInit) return null;

  const startPage = Math.max(0, Math.min(currentPage, (numPages || 1) - 1));
  // Laptop = 2 pages side by side, mobile = 1 page. The wrapper gets an exact width so the
  // flipbook always picks the right mode (without it, laptop was stuck in single-page mode).
  const bookWidth = dimensions.isMobile ? dimensions.width : dimensions.width * 2;

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-[#07070d] overflow-hidden select-none relative flex flex-col" 
      onContextMenu={(e) => e.preventDefault()}
    >
      <Document
        file={pdfUrl}
        options={PDF_OPTIONS}
        // Makes the Document fill the full screen so everything can be centered properly
        className="flex-1 w-full h-full min-h-0 flex flex-col"
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={(err) => console.error('PDF load error:', err)}
        onSourceError={(err) => console.error('PDF source error:', err)}
        loading={
          <div className="flex flex-col items-center justify-center gap-3 w-full h-full">
            <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
            <div className="text-amber-500 font-bold animate-pulse text-sm">Loading Your Saved Progress...</div>
          </div>
        }
        error={<div className="text-red-500 font-bold p-4 bg-red-500/10 rounded-xl border border-red-500/20 m-auto mt-20">Failed to load secure document.</div>}
      >
        {numPages > 0 && dimensions.width > 0 && (
          // Main Scrollable Area
          <div className="flex-1 w-full h-full overflow-auto custom-scrollbar">
            {/* Centering Wrapper */}
            <div className="min-w-full min-h-full flex items-center justify-center p-4 md:p-8">
              {/* shadow-2xl instead of drop-shadow-2xl: a CSS filter on the parent forces the
                  browser to redraw the whole book on every animation frame (big lag on mobile). */}
              <div 
                className="shadow-2xl"
                style={{ width: bookWidth, height: dimensions.height, flexShrink: 0 }}
              >
                <CurrentPageContext.Provider value={currentPage}>
                  <HTMLFlipBook 
                    // New key = book is rebuilt at the new size on rotate / resize (keeps the same page)
                    key={`${getBookKey(pdfUrl)}_${dimensions.width}x${dimensions.height}`}
                    width={dimensions.width} 
                    height={dimensions.height} 
                    size="fixed"
                    usePortrait={true}
                    showCover={true}
                    maxShadowOpacity={0.15}
                    drawShadow={true}
                    flippingTime={500} // Set to 500 for a perfectly soft, realistic & fast flip
                    swipeDistance={30}
                    startPage={startPage} 
                    onFlip={handlePageFlip} 
                    className="flipbook-wrapper mx-auto"
                  >
                    {pageList}
                  </HTMLFlipBook>
                </CurrentPageContext.Provider>
              </div>
            </div>
          </div>
        )}

        {/* Premium Floating Page Number Overlay */}
        {numPages > 0 && (
          // backdrop-blur removed: it is recalculated on every frame while the book animates behind it
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/75 text-amber-400 px-5 py-2 rounded-full text-[10px] md:text-xs font-black tracking-widest border border-amber-500/20 z-50 shadow-[0_4px_24px_rgba(212,146,26,0.18)] flex items-center gap-2 pointer-events-none transition-all">
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
