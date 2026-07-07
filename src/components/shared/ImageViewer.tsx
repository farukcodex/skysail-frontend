import { useEffect, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from "lucide-react";

export function ImageViewer({ 
  images, 
  currentIndex, 
  onClose,
  onNavigate
}: { 
  images: string[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate?: (newIndex: number) => void;
}) {
  const [scale, setScale] = useState(1);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    if (currentIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (currentIndex < images.length - 1) {
          onNavigate?.(currentIndex + 1);
          setScale(1);
        }
      } else if (e.key === "ArrowLeft") {
        if (currentIndex > 0) {
          onNavigate?.(currentIndex - 1);
          setScale(1);
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, images.length, onNavigate, onClose]);
  
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex !== null && currentIndex < images.length - 1) {
      onNavigate?.(currentIndex + 1);
      setScale(1);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex !== null && currentIndex > 0) {
      onNavigate?.(currentIndex - 1);
      setScale(1);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      setScale(s => Math.min(4, s + 0.15));
    } else {
      setScale(s => Math.max(0.5, s - 0.15));
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentIndex !== null && currentIndex < images.length - 1) {
      onNavigate?.(currentIndex + 1);
      setScale(1);
    }
    if (isRightSwipe && currentIndex !== null && currentIndex > 0) {
      onNavigate?.(currentIndex - 1);
      setScale(1);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(s => s > 1 ? 1 : 2);
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
      setScale(1);
    }
  };

  if (currentIndex === null || !images[currentIndex]) return null;

  return (
    <Dialog 
      open={currentIndex !== null} 
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setScale(1);
        }
      }}
    >
      <DialogContent className="max-w-[100vw] sm:max-w-[100vw] h-[100dvh] p-0 bg-black/95 sm:bg-black/95 border-none shadow-none flex flex-col items-center justify-center [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-2 hover:[&>button]:bg-black/70 [&>button]:right-4 [&>button]:top-4 z-50 overflow-hidden">
        <DialogTitle className="sr-only">Image Viewer</DialogTitle>
        <DialogDescription className="sr-only">View full size image</DialogDescription>
        
        <div 
          className="relative w-full h-full flex flex-col items-center justify-center group"
          onWheel={handleWheel}
          onClick={handleBackgroundClick}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Download Button */}
          <a 
            href={images[currentIndex]} 
            download
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 right-16 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 z-[60] transition-colors opacity-0 group-hover:opacity-100"
            title="Download Image"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={20} />
          </a>

          {/* Top Toolbar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); setScale(s => Math.max(0.5, s - 0.25)) }}
              className="text-white hover:text-gray-300 transition-colors p-1"
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            <span className="text-white text-sm font-medium min-w-[50px] text-center select-none">
              {Math.round(scale * 100)}%
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); setScale(s => Math.min(4, s + 0.25)) }}
              className="text-white hover:text-gray-300 transition-colors p-1"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
          </div>

          {/* Navigation Buttons */}
          {images.length > 1 && currentIndex > 0 && (
            <button 
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={32} />
            </button>
          )}
          
          {images.length > 1 && currentIndex < images.length - 1 && (
            <button 
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition-colors opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={32} />
            </button>
          )}

          {/* Image Container */}
          <div 
            className="relative w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
            style={{ transform: `scale(${scale})` }}
            onClick={handleBackgroundClick}
            onDoubleClick={handleDoubleClick}
          >
            <Image 
              src={images[currentIndex]} 
              alt="Full size view" 
              fill 
              className="object-contain select-none pointer-events-none" 
              draggable={false}
              priority
              unoptimized
            />
          </div>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-sm font-medium select-none">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
