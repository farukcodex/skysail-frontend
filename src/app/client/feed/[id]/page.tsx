"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Post {
  id: number;
  update_type: string;
  title: string;
  description: string;
  images: string[] | null;
  video_path: string | null;
  created_at: string;
  author?: {
    name: string;
    profile_photo_path?: string;
  };
}

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

function PhotoGrid({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [scale, setScale] = useState(1);

  if (images.length === 0) return null;
  
  useEffect(() => {
    if (currentIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (currentIndex < images.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setScale(1);
        }
      } else if (e.key === "ArrowLeft") {
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
          setScale(1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, images.length]);
  
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex !== null && currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setScale(1);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex !== null && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
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

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

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
      setCurrentIndex(currentIndex + 1);
      setScale(1);
    }
    if (isRightSwipe && currentIndex !== null && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setScale(1);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(s => s > 1 ? 1 : 2);
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setCurrentIndex(null);
      setScale(1);
    }
  };

  const renderDialog = () => (
    <Dialog 
      open={currentIndex !== null} 
      onOpenChange={(open) => {
        if (!open) {
          setCurrentIndex(null);
          setScale(1);
        }
      }}
    >
      <DialogContent className="max-w-[100vw] sm:max-w-[100vw] h-[100dvh] p-0 bg-transparent sm:bg-transparent border-none shadow-none flex flex-col items-center justify-center [&>button]:text-white [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-2 hover:[&>button]:bg-black/70 [&>button]:right-4 [&>button]:top-4 z-50 overflow-hidden">
        <DialogTitle className="sr-only">Image Viewer</DialogTitle>
        <DialogDescription className="sr-only">View full size image</DialogDescription>
        
        {currentIndex !== null && (
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
            {currentIndex > 0 && (
              <button 
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white bg-black/50 hover:bg-black/80 rounded-full p-3 transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft size={32} />
              </button>
            )}
            
            {currentIndex < images.length - 1 && (
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
              onDoubleClick={handleDoubleClick}
              onClick={handleBackgroundClick}
            >
              <Image 
                src={images[currentIndex]} 
                alt="Full size" 
                fill 
                className="object-contain pointer-events-none" 
                
              />
            </div>
            
            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/90 text-sm font-medium bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity select-none">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  if (images.length === 1) {
    return (
      <>
        <div 
          className="mt-8 rounded-[24px] overflow-hidden aspect-video w-full relative border border-border/50 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setCurrentIndex(0)}
        >
          <Image src={images[0]} alt="" fill className="object-cover" />
        </div>
        {renderDialog()}
      </>
    );
  }

  // Display all images in a grid for the detail page
  return (
    <>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {images.map((src, idx) => (
          <div 
            key={idx} 
            className="relative aspect-video rounded-[24px] overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:opacity-90 transition-opacity group"
            onClick={() => setCurrentIndex(idx)}
          >
            <Image src={src} alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
               <span className="opacity-0 group-hover:opacity-100 bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm text-sm font-medium transition-opacity">View Full Size</span>
            </div>
          </div>
        ))}
      </div>
      {renderDialog()}
    </>
  );
}

export default function SinglePostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`/api/posts/${id}`);
        if (res.ok) {
          setPost(await res.json());
        } else {
          setError("Failed to load post.");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50dvh]">
        <Loader2 className="animate-spin size-8 text-muted-foreground" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
        <div className="p-8 text-center bg-card border border-border rounded-2xl text-muted-foreground">
          {error || "Post not found."}
        </div>
      </div>
    );
  }

  const authorName = post.author?.name || "Unknown";
  const avatar = post.author?.profile_photo_path 
    ? (post.author.profile_photo_path.startsWith('http') ? post.author.profile_photo_path : `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${post.author.profile_photo_path}`)
    : `https://api.dicebear.com/10.x/micah/svg?seed=${authorName}`;
  const time = format(new Date(post.created_at), "MMM d, yyyy h:mm a");
  const isVideo = !!post.video_path;
  const hasImage = post.images && post.images.length > 0;

  return (
    <div className="p-6">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Feed
      </button>

      <div className="bg-white border border-[#C4C7C7]/50 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6">
          <div className="flex flex-col gap-4">
            {/* Header */}
            {!(hasImage || isVideo) ? (
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[#C5A059]" />
                <span className="text-xs font-semibold uppercase tracking-[1.2px] text-black">
                  {post.update_type}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border border-border shadow-sm">
                  <AvatarImage src={avatar} alt={authorName} />
                  <AvatarFallback>{authorName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-base font-semibold leading-tight text-black">
                    Posted by {authorName}
                  </p>
                  <p className="text-xs text-[#5D5F5F] mt-1">{time}</p>
                </div>
              </div>
            )}

            {/* Title & Description */}
            <div className="flex flex-col gap-2">
              <h1 className="text-[24px] font-semibold text-[#1C1B1B] leading-[32px]">{post.title}</h1>
              
              {post.description && (
                <div 
                  className="text-sm text-[#5D5F5F] leading-[24px] space-y-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 mt-2"
                  dangerouslySetInnerHTML={{ __html: post.description }}
                />
              )}
            </div>
          </div>

          {isVideo ? (
            <div className="mt-8 w-full aspect-video rounded-[24px] overflow-hidden bg-black flex items-center justify-center border border-border shadow-md">
              <video 
                src={post.video_path!} 
                controls 
                autoPlay 
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <PhotoGrid images={post.images || []} />
          )}
        </div>
      </div>
    </div>
  );
}
