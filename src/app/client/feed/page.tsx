"use client";

import AnimatedUnderlineTabsDemo from "@/components/ui/animated-tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Play, Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { format } from "date-fns";

// ---- types ----
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

// ---- sub-components ----
function PostAuthor({
  author,
  avatar,
  time,
}: {
  author: string;
  avatar: string;
  time: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <Avatar className="size-9">
        <AvatarImage src={avatar} alt={author} />
        <AvatarFallback>{author[0]}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-semibold leading-tight">
          Posted by {author}
        </p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

function PhotoGrid({
  images,
}: {
  images: string[];
}) {
  if (images.length === 0) return null;
  
  if (images.length === 1) {
    return (
      <div className="mt-3 rounded-xl overflow-hidden aspect-video w-full min-h-60 relative ">
        <Image
          src={images[0]}
          alt=""
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-xl overflow-hidden">
        {images.map((src) => (
          <div key={src} className="relative aspect-video">
            <Image src={src} alt="" fill className="object-cover" unoptimized />
          </div>
        ))}
      </div>
    );
  }

  const [main, tr1, tr2, br] = images;
  const bottomSrc = br ?? tr2;
  const extraCount = images.length > 4 ? images.length - 4 : null;
  const showOverlay = extraCount != null;

  return (
    <div className="mt-3 relative w-full h-[40dvh] sm:h-[50dvh] md:h-[55dvh] lg:h-[60dvh] rounded-xl overflow-hidden">
      <div
        className="absolute inset-0 grid gap-1"
        style={{
          gridTemplateColumns: "3fr 2fr",
          gridTemplateRows: "1fr 1fr",
        }}
      >
        <div className="relative" style={{ gridRow: "1 / 3" }}>
          <Image src={main} alt="" fill className="object-cover" unoptimized />
        </div>

        <div className="grid grid-cols-2 gap-1">
          {tr1 && (
            <div className="relative">
              <Image src={tr1} alt="" fill className="object-cover" unoptimized />
            </div>
          )}
          {tr2 && (
            <div className="relative">
              <Image src={tr2} alt="" fill className="object-cover" unoptimized />
            </div>
          )}
        </div>

        {bottomSrc && (
          <div className="relative">
            <Image src={bottomSrc} alt="" fill className="object-cover" unoptimized />
            {showOverlay && (
              <div className="absolute inset-0 bg-black/55 flex items-center justify-center cursor-pointer hover:bg-black/65 transition-colors">
                <span className="text-white text-base font-semibold">
                  +{extraCount} more
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PhotoPostCard({ post }: { post: Post }) {
  const authorName = post.author?.name || "Unknown";
  const avatar = post.author?.profile_photo_path 
    ? (post.author.profile_photo_path.startsWith('http') ? post.author.profile_photo_path : `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${post.author.profile_photo_path}`)
    : `https://api.dicebear.com/10.x/micah/svg?seed=${authorName}`;
  const time = format(new Date(post.created_at), "MMM d, yyyy h:mm a");

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <PostAuthor author={authorName} avatar={avatar} time={time} />
      <p className="text-base font-semibold mb-1">{post.title}</p>
      {post.description && <p className="text-sm text-muted-foreground leading-relaxed mb-3">{post.description}</p>}
      <PhotoGrid images={post.images || []} />
    </div>
  );
}

function StatusCard({ post }: { post: Post }) {
  const time = format(new Date(post.created_at), "MMM d, yyyy");
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <Calendar size={15} className="text-[#C49A3C]" />
        <Badge
          variant="outline"
          className="text-[10px] tracking-widest uppercase border-border text-muted-foreground"
        >
          {post.update_type}
        </Badge>
        <span className="text-xs text-muted-foreground ml-auto">{time}</span>
      </div>
      <p className="text-base font-semibold mb-1">{post.title}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {post.description}
      </p>
    </div>
  );
}

function FeaturedVideo({ video }: { video: Post }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const time = format(new Date(video.created_at), "MMM d, yyyy");
  
  if (isPlaying && video.video_path) {
    return (
      <div className="w-full flex flex-col">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black flex flex-col shadow-lg border border-border">
          <video 
            src={video.video_path} 
            controls 
            autoPlay 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="mt-4 px-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold tracking-widest uppercase bg-[#C49A3C] text-black px-2 py-0.5 rounded">
              Latest Walkthrough
            </span>
          </div>
          <p className="text-xl font-bold leading-tight">{video.title}</p>
          <p className="text-muted-foreground text-sm mt-1">{time}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full aspect-video rounded-2xl overflow-hidden cursor-pointer group"
      onClick={() => setIsPlaying(true)}
    >
      {/* Video Thumbnail (using the first image if any, else generic placeholder) */}
      <Image
        src={video.images && video.images.length > 0 ? video.images[0] : "https://placehold.co/1200x600/1a1a1a/fff?text=Video+Thumbnail"}
        alt={video.title}
        fill
        className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="size-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/30 transition-colors">
          <Play size={28} className="text-white fill-white ml-1" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold tracking-widest uppercase bg-[#C49A3C] text-black px-2 py-0.5 rounded">
            Latest Walkthrough
          </span>
        </div>
        <p className="text-white text-xl font-bold leading-tight">
          {video.title}
        </p>
        <p className="text-white/60 text-xs mt-1">{time}</p>
      </div>
    </div>
  );
}

function ThumbVideoCard({ video }: { video: Post }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const time = format(new Date(video.created_at), "MMM d, yyyy");

  if (isPlaying && video.video_path) {
    return (
      <div className="w-full flex flex-col">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-border">
          <video 
            src={video.video_path} 
            controls 
            autoPlay 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="mt-2">
          <p className="text-sm font-semibold leading-tight line-clamp-2">
            {video.title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="cursor-pointer group"
      onClick={() => setIsPlaying(true)}
    >
      <div className="relative aspect-video rounded-xl overflow-hidden border border-border">
        <Image
          src={video.images && video.images.length > 0 ? video.images[0] : "https://placehold.co/400x260/2a2a2a/fff?text=Video"}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <Play size={14} className="text-white fill-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-sm font-semibold leading-tight line-clamp-2">
          {video.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
      </div>
    </div>
  );
}

// ---- page ----
export default function NewsFeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/posts");
      if (res.ok) {
        setPosts(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const imagePosts = posts.filter(p => !p.video_path);
  const videoPosts = posts.filter(p => !!p.video_path);

  const featuredVideo = videoPosts.length > 0 ? videoPosts[0] : null;
  const thumbVideos = videoPosts.slice(1);

  const PostsContent = (
    <div className="flex flex-col gap-4 w-full">
      {imagePosts.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4">No recent posts.</p>
      ) : (
        imagePosts.map((post) =>
          post.images && post.images.length > 0 ? (
            <PhotoPostCard key={post.id} post={post} />
          ) : (
            <StatusCard key={post.id} post={post} />
          )
        )
      )}
    </div>
  );

  const VideosContent = (
    <div className="flex flex-col gap-5">
      {videoPosts.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4">No recent videos.</p>
      ) : (
        <>
          {featuredVideo && <FeaturedVideo video={featuredVideo} />}
          {thumbVideos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {thumbVideos.map((v) => (
                <ThumbVideoCard key={v.id} video={v} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  const TABS = [
    { name: "POSTS", value: "posts", content: PostsContent },
    { name: "VIDEOS", value: "videos", content: VideosContent },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight">News Feed</h1>
      <p className="text-sm text-muted-foreground mt-1">
        All project updates from your team
      </p>
      
      {loading ? (
        <div className="mt-12 flex justify-center">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="mt-4">
          <AnimatedUnderlineTabsDemo tabs={TABS} />
        </div>
      )}
    </div>
  );
}
