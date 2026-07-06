"use client";

import AnimatedUnderlineTabsDemo from "@/components/ui/animated-tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Play, Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

import Link from "next/link";

function FeedPostCard({ post }: { post: Post }) {
  const authorName = post.author?.name || "Unknown";
  const avatar = post.author?.profile_photo_path 
    ? (post.author.profile_photo_path.startsWith('http') ? post.author.profile_photo_path : `${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${post.author.profile_photo_path}`)
    : `https://api.dicebear.com/10.x/micah/svg?seed=${authorName}`;
  const time = format(new Date(post.created_at), "MMM d, yyyy");

  const hasImage = post.images && post.images.length > 0;
  const isVideo = !!post.video_path;
  const isMedia = hasImage || isVideo;

  return (
    <Link href={`/client/feed/${post.id}`} className="block group w-full">
      <div className="bg-white border border-[#C4C7C7]/50 rounded-[32px] p-6 hover:border-primary/50 transition-colors flex flex-col gap-4">
        {/* Header */}
        {!isMedia ? (
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-[#C5A059]" />
            <span className="text-xs font-semibold uppercase tracking-[1.2px] text-black">
              {post.update_type}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border border-border">
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

        {/* Title and Description */}
        <div className="flex flex-col gap-2">
          <h3 className="text-[20px] font-semibold text-[#1C1B1B] leading-[28px] line-clamp-2">
            {post.title}
          </h3>
          {!isMedia && post.description && (
            <div 
              className="text-sm text-[#5D5F5F] leading-[23px] line-clamp-3 [&>p]:inline [&_ul]:hidden [&_ol]:hidden"
              dangerouslySetInnerHTML={{ __html: post.description }}
            />
          )}
        </div>

        {/* Media Grid */}
        {hasImage && !isVideo && (
          <CompactPhotoGrid images={post.images || []} />
        )}
        {isVideo && (
          <div className="w-full h-[250px] sm:h-[350px] bg-black rounded-2xl relative overflow-hidden flex items-center justify-center mt-2">
            {post.images && post.images.length > 0 && (
               <Image src={post.images[0]} alt="video" fill className="object-cover opacity-50" />
            )}
            <div className="size-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm z-10">
               <Play size={24} className="text-white fill-white ml-1" />
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end mt-2">
           <span className="inline-flex items-center justify-center rounded-full text-sm font-medium border border-input bg-background h-10 px-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm cursor-pointer">
             View Full Post
           </span>
        </div>
      </div>
    </Link>
  );
}

function CompactPhotoGrid({ images }: { images: string[] }) {
  if (images.length === 0) return null;
  
  if (images.length === 1) {
    return (
      <div className="w-full h-[300px] sm:h-[400px] relative rounded-[16px] overflow-hidden mt-2">
        <Image src={images[0]} alt="" fill className="object-cover" />
      </div>
    );
  }

  if (images.length === 2) {
    return (
      <div className="w-full h-[250px] sm:h-[300px] grid grid-cols-2 gap-2 mt-2">
        <div className="relative rounded-[16px] overflow-hidden">
          <Image src={images[0]} alt="" fill className="object-cover" />
        </div>
        <div className="relative rounded-[16px] overflow-hidden">
          <Image src={images[1]} alt="" fill className="object-cover" />
        </div>
      </div>
    );
  }

  // 3 or more images: layout from the Figma first post
  const extraCount = images.length > 3 ? images.length - 3 : null;

  return (
    <div className="w-full h-[300px] sm:h-[400px] rounded-[16px] overflow-hidden mt-2">
      <div className="w-full h-full grid grid-cols-[1fr_0.6fr] gap-2">
        <div className="relative h-full">
          <Image src={images[0]} alt="" fill className="object-cover" />
        </div>
        <div className="grid grid-rows-2 gap-2 h-full">
          <div className="relative h-full">
            <Image src={images[1]} alt="" fill className="object-cover" />
          </div>
          <div className="relative h-full">
            <Image src={images[2]} alt="" fill className="object-cover" />
            {extraCount !== null && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-lg font-semibold">+{extraCount} more</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturedVideo({ video, playingVideoId, onPlay }: { video: Post; playingVideoId: number | null; onPlay: (id: number) => void }) {
  const isPlaying = playingVideoId === video.id;
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
      className="relative w-full aspect-video rounded-2xl overflow-hidden cursor-pointer group bg-black"
      onClick={() => onPlay(video.id)}
    >
      <video
        src={video.video_path ? `${video.video_path}#t=0.001` : ""}
        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
        preload="metadata"
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="size-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center group-hover:bg-white/30 transition-colors">
          <Play size={28} className="text-white fill-white ml-1" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 p-3 sm:p-5 lg:p-6 w-full bg-gradient-to-t from-black/90 via-black/40 to-transparent">
        <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
          <span className="text-[10px] font-bold tracking-widest uppercase bg-[#C49A3C] text-black px-2 py-0.5 rounded">
            Latest Walkthrough
          </span>
        </div>
        <p className="text-white text-base sm:text-xl lg:text-2xl font-bold leading-tight line-clamp-2">
          {video.title}
        </p>
        <p className="text-white/70 text-[10px] sm:text-xs mt-1 sm:mt-1.5">{time}</p>
      </div>
    </div>
  );
}

function ThumbVideoCard({ video, playingVideoId, onPlay }: { video: Post; playingVideoId: number | null; onPlay: (id: number) => void }) {
  const isPlaying = playingVideoId === video.id;
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
      onClick={() => onPlay(video.id)}
    >
      <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-black">
        <video
          src={video.video_path ? `${video.video_path}#t=0.001` : ""}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          preload="metadata"
          muted
          playsInline
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

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
}

export default function NewsFeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState(""); 
  const [type, setType] = useState("all");
  const [mediaType, setMediaType] = useState("posts");
  const [page, setPage] = useState(1);
  const [playingVideoId, setPlayingVideoId] = useState<number | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== searchInput) {
        setSearch(searchInput);
        setPage(1);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput, search]);

  useEffect(() => {
    fetchPosts();
  }, [search, type, page, mediaType]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setPlayingVideoId(null);
      const res = await apiFetch(`/api/posts?page=${page}&search=${search}&type=${type}&media_type=${mediaType}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.data || []);
        setPagination({
          current_page: data.current_page,
          last_page: data.last_page,
          total: data.total
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (val: string) => {
    setPage(1);
    setType(val);
  };

  const renderPageNumbers = () => {
    if (!pagination || pagination.last_page <= 1) return null;
    const pages = [];
    let startPage = Math.max(1, pagination.current_page - 2);
    let endPage = Math.min(pagination.last_page, pagination.current_page + 2);

    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(pagination.last_page, 5);
      } else if (endPage === pagination.last_page) {
        startPage = Math.max(1, pagination.last_page - 4);
      }
    }

    if (startPage > 1) {
      pages.push(
        <Button key="first" variant="ghost" size="sm" onClick={() => { setPage(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>1</Button>
      );
      if (startPage > 2) pages.push(<span key="ellipsis1" className="px-2 text-muted-foreground">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button 
          key={i} 
          variant={pagination.current_page === i ? "outline" : "ghost"} 
          size="sm" 
          onClick={() => { setPage(i); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          {i}
        </Button>
      );
    }

    if (endPage < pagination.last_page) {
      if (endPage < pagination.last_page - 1) pages.push(<span key="ellipsis2" className="px-2 text-muted-foreground">...</span>);
      pages.push(
        <Button key="last" variant="ghost" size="sm" onClick={() => { setPage(pagination.last_page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{pagination.last_page}</Button>
      );
    }

    return pages;
  };

  const featuredVideo = posts.length > 0 ? posts[0] : null;
  const thumbVideos = posts.slice(1);

  const PostsContent = (
    <div className="flex flex-col gap-4 w-full">
      {posts.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center border border-dashed rounded-xl bg-muted/20">
          <Search className="text-muted-foreground mb-4 opacity-50" size={48} />
          <p className="text-lg font-medium">
            {search ? `No posts found matching "${search}"` : "No recent posts."}
          </p>
          {search && (
            <Button variant="link" onClick={() => setSearchInput("")} className="mt-2 text-muted-foreground">
              Clear search
            </Button>
          )}
        </div>
      ) : (
        posts.map((post) => (
          <FeedPostCard key={post.id} post={post} />
        ))
      )}
    </div>
  );

  const VideosContent = (
    <div className="flex flex-col gap-5">
      {posts.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center border border-dashed rounded-xl bg-muted/20">
          <Search className="text-muted-foreground mb-4 opacity-50" size={48} />
          <p className="text-lg font-medium">
            {search ? `No videos found matching "${search}"` : "No recent videos."}
          </p>
          {search && (
            <Button variant="link" onClick={() => setSearchInput("")} className="mt-2 text-muted-foreground">
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <>
          {featuredVideo && <FeaturedVideo video={featuredVideo} playingVideoId={playingVideoId} onPlay={setPlayingVideoId} />}
          {thumbVideos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mt-2">
              {thumbVideos.map((v) => (
                <ThumbVideoCard key={v.id} video={v} playingVideoId={playingVideoId} onPlay={setPlayingVideoId} />
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
      <p className="text-sm text-muted-foreground mt-1 mb-6">
        All project updates from your team
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={(e) => e.preventDefault()} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            type="text" 
            placeholder="Search updates..." 
            className="pl-10 pr-10 w-full bg-background"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button 
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </form>
        {mediaType !== "videos" && (
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full sm:w-[200px] bg-background">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Updates</SelectItem>
              <SelectItem value="Photo update">Photo update</SelectItem>
              <SelectItem value="Farming photos">Farming photos</SelectItem>
              <SelectItem value="Status update">Status update</SelectItem>
              <SelectItem value="Milestone update">Milestone update</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      
      {loading ? (
        <div className="mt-12 flex justify-center">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="mt-4">
          <AnimatedUnderlineTabsDemo 
            tabs={TABS} 
            activeTab={mediaType} 
            onTabChange={(val) => {
              setPage(1);
              setMediaType(val);
            }} 
          />
          
          {pagination && pagination.last_page > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between border-t border-border pt-4 gap-4">
              <p className="text-sm text-muted-foreground">
                Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} total updates)
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={pagination.current_page === 1}
                  onClick={() => {
                    setPage(p => p - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <ChevronLeft size={16} className="mr-1" /> Prev
                </Button>
                
                <div className="hidden sm:flex items-center gap-1 mx-2">
                  {renderPageNumbers()}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={pagination.current_page === pagination.last_page}
                  onClick={() => {
                    setPage(p => p + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Next <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
