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

// ---- Mobile tuning (all in px, change here if you want) ----
// Space kept around the page on mobile. The bottom space is for the floating "PAGE x / y" pill.
const MOBILE_SIDE_PAD = 4;
const MOBILE_TOP_PAD = 4;
const MOBILE_BOTTOM_PAD = 60;
// The page is drawn as big as the screen height allows. If the screen is taller than the page,
// the PDF's empty white side-margins are trimmed a little (equally on left & right) instead of
// leaving empty space above/below. This is the MAX trim per side (0.04 = 4% of page width).
// Text is never touched for normal PDFs (usual margins are 8-12%). Set 0 to turn trimming off.
const MOBILE_MAX_SIDE_CROP = 0.04;
// The moving shadow while a page turns is one of the heaviest things for a phone GPU.
// false = smoothest on mobile. true = same shadow as laptop (can be slower on weak phones).
const MOBILE_FLIP_SHADOW = false;

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

// Tells every BookPage which pages should be drawn WITHOUT changing the children passed to
// HTMLFlipBook. (If the children change, react-pageflip rebuilds all pages on every
// flip, and that was the main reason the flip animation was lagging.)
const RenderCenterContext = createContext(0);

// Elite 3D Book Page with Premium Borders & High Quality
const BookPage = forwardRef(({ pageNumber, width, height, contentWidth }, ref) => {
  const renderCenter = useContext(RenderCenterContext);
  const shouldRender = Math.abs(pageNumber - 1 - renderCenter) <= RENDER_WINDOW;

  // Real drawing width of the PDF page. On mobile it can be a little wider than the book
  // page itself (the extra is only the PDF's empty white margin, trimmed equally on both sides).
  const pageWidth = (contentWidth || width) - 2;

  // Lightweight placeholder, same size, so there's no layout jump. It gets swapped
  // for the real page just before it's needed, so you won't see a blank flash while flipping.
  const placeholder = (
    <div style={{ width: pageWidth, height: height || '100%', flexShrink: 0 }} className="bg-white" />
  );

  return (
    <div 
      ref={ref} 
      // inset glow only on laptop (blur is repainted on every frame of the flip = slow on phones)
      // will-change keeps each page on its own GPU layer while it turns
      className="bg-white overflow-hidden flex items-start justify-center md:shadow-[inset_0_0_15px_rgba(0,0,0,0.06)] border border-amber-600/30 box-border relative will-change-transform"
      style={{ 
        // Advanced Hardware Acceleration for Smooth Flipping
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* 3D Spine Shadow Effect (Left Side) */}
      <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-black/10 to-transparent z-10 pointer-events-none" />
      
      {shouldRender ? (
        <div style={{ width: pageWidth, flexShrink: 0 }}>
          <Page 
            pageNumber={pageNumber} 
            width={pageWidth} 
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
        </div>
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
  // Which page the "draw window" is centered on. It follows currentPage with a small delay,
  // so heavy page drawing never happens in the middle of a flip / rapid flipping.
  const [renderCenter, setRenderCenter] = useState(0);
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
    setRenderCenter(page);
    setNumPages(null);
    setIsInit(true);
  }, [pdfUrl]);

  // Move the draw window only after the user stops flipping for a moment
  useEffect(() => {
    const timer = setTimeout(() => setRenderCenter(currentPage), 200);
    return () => clearTimeout(timer);
  }, [currentPage]);

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
        // Ignore small height changes (mobile address bar hiding/showing) so the book
        // is not rebuilt in the middle of reading.
        if (Math.abs(prev.width - width) < 2 && Math.abs(prev.height - height) < 80) return prev;
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
    if (!areaWidth || !areaHeight) {
      return { width: 0, height: 0, contentWidth: 0, isMobile: false };
    }

    const isMobile = areaWidth < 768;

    if (isMobile) {
      // MOBILE: use the full screen. Page is drawn as big as the free height allows;
      // if that is wider than the screen, only the empty white margin is trimmed (max MOBILE_MAX_SIDE_CROP per side).
      const availWidth = Math.max(areaWidth - MOBILE_SIDE_PAD * 2, 120);
      const availHeight = Math.max(areaHeight - MOBILE_TOP_PAD - MOBILE_BOTTOM_PAD, 200);

      const widestAllowed = availWidth / (1 - 2 * MOBILE_MAX_SIDE_CROP);
      const drawWidth = Math.max(Math.min(availHeight / pageRatio, widestAllowed), 120);

      return {
        width: Math.floor(Math.min(availWidth, drawWidth)), // visible book page
        height: Math.floor(drawWidth * pageRatio),
        contentWidth: Math.floor(drawWidth), // PDF page drawing width (>= visible width)
        isMobile: true,
      };
    }

    // LAPTOP: 2 pages side by side, so each page gets half the width
    const maxWidth = Math.max((areaWidth / 2) - 64, 120);
    const maxHeight = Math.max(areaHeight - 120, 200);

    let calculatedWidth = maxWidth;
    let calculatedHeight = calculatedWidth * pageRatio;

    if (calculatedHeight > maxHeight) {
      calculatedHeight = maxHeight;
      calculatedWidth = calculatedHeight / pageRatio;
    }

    return {
      width: Math.floor(calculatedWidth),
      height: Math.floor(calculatedHeight),
      contentWidth: Math.floor(calculatedWidth),
      isMobile: false,
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
      setRenderCenter(0);
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
          contentWidth={dimensions.contentWidth}
        />
      );
    });
  }, [numPages, dimensions.width, dimensions.height, dimensions.contentWidth]);

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
            {/* Centering Wrapper (mobile uses tighter padding so the page gets the full screen) */}
            <div 
              className="min-w-full min-h-full flex items-center justify-center p-4 md:p-8"
              style={dimensions.isMobile ? { padding: `${MOBILE_TOP_PAD}px ${MOBILE_SIDE_PAD}px ${MOBILE_BOTTOM_PAD}px` } : undefined}
            >
              {/* shadow-2xl instead of drop-shadow-2xl: a CSS filter on the parent forces the
                  browser to redraw the whole book on every animation frame (big lag on mobile). */}
              <div 
                className="shadow-2xl"
                style={{ width: bookWidth, height: dimensions.height, flexShrink: 0 }}
              >
                <RenderCenterContext.Provider value={renderCenter}>
                  <HTMLFlipBook 
                    // New key = book is rebuilt at the new size on rotate / resize (keeps the same page)
                    key={`${getBookKey(pdfUrl)}_${dimensions.width}x${dimensions.height}_${dimensions.contentWidth}`}
                    width={dimensions.width} 
                    height={dimensions.height} 
                    size="fixed"
                    usePortrait={true}
                    showCover={true}
                    maxShadowOpacity={0.15}
                    drawShadow={!dimensions.isMobile || MOBILE_FLIP_SHADOW}
                    flippingTime={500} // Set to 500 for a perfectly soft, realistic & fast flip
                    swipeDistance={30}
                    // false = finger drag starts the page turn instantly and the browser never
                    // fights it with its own scrolling (this was the main cause of stuck flips on phones)
                    mobileScrollSupport={false}
                    startPage={startPage} 
                    onFlip={handlePageFlip} 
                    className="flipbook-wrapper mx-auto"
                  >
                    {pageList}
                  </HTMLFlipBook>
                </RenderCenterContext.Provider>
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
