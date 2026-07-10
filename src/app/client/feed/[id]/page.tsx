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
import { ImageViewer } from "@/components/shared/ImageViewer";

function PhotoGrid({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <>
        <div 
          className="mt-8 rounded-[24px] overflow-hidden aspect-video w-full relative border border-border/50 shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setCurrentIndex(0)}
        >
          <Image src={images[0]} alt="" fill className="object-cover" />
        </div>
        <ImageViewer 
          images={images}
          currentIndex={currentIndex}
          onClose={() => setCurrentIndex(null)}
          onNavigate={setCurrentIndex}
        />
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
      <ImageViewer 
        images={images}
        currentIndex={currentIndex}
        onClose={() => setCurrentIndex(null)}
        onNavigate={setCurrentIndex}
      />
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
        const res = await apiFetch(`/api/client/posts/${id}`);
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
