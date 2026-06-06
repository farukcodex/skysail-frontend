"use client";

import AnimatedUnderlineTabsDemo from "@/components/ui/animated-tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Play } from "lucide-react";
import Image from "next/image";

// ---- types ----
type PhotoPost = {
  kind: "photo";
  id: number;
  author: string;
  avatar: string;
  time: string;
  title: string;
  images: string[];
  extraCount?: number;
};

type StatusPost = {
  kind: "status";
  id: number;
  date: string;
  title: string;
  body: string;
};

type Post = PhotoPost | StatusPost;

// ---- data ----
const POSTS: Post[] = [
  {
    kind: "photo",
    id: 1,
    author: "Remy",
    avatar: "https://api.dicebear.com/10.x/micah/svg?seed=Remy",
    time: "Today 9:14 AM",
    title: "Framing photos — week 8 progress",
    images: [
      "https://placehold.co/600x440/c49a3c/fff?text=Frame+1",
      "https://placehold.co/300x220/8B6914/fff?text=Frame+2",
      "https://placehold.co/300x220/5a4010/fff?text=Frame+3",
      "https://placehold.co/300x220/3d2b0a/fff?text=Frame+4",
    ],
    extraCount: 8,
  },
  {
    kind: "status",
    id: 2,
    date: "May 16, 2025",
    title: "Weekly summary — May 16, 2025",
    body: "Framing on schedule, lumber delivery pending resolution. The site remains active with 12 crew members. Electrical rough-in scheduled to begin as soon as the roof decking is secured.",
  },
  {
    kind: "photo",
    id: 3,
    author: "Remy",
    avatar: "https://api.dicebear.com/10.x/micah/svg?seed=Remy",
    time: "Today 9:14 AM",
    title: "Foundation pour — photo gallery",
    images: [
      "https://placehold.co/300x220/1a1a1a/fff?text=Foundation+1",
      "https://placehold.co/300x220/2a2a2a/fff?text=Foundation+2",
      "https://placehold.co/300x220/3a3a3a/fff?text=Foundation+3",
    ],
    extraCount: 15,
  },
  {
    kind: "status",
    id: 4,
    date: "May 9, 2025",
    title: "Weekly summary — May 9, 2025",
    body: "Foundation pour completed successfully. Curing period underway. Site secured and inspection booked for Monday. No safety incidents this week.",
  },
  {
    kind: "photo",
    id: 5,
    author: "Lisa",
    avatar: "https://api.dicebear.com/10.x/micah/svg?seed=Lisa",
    time: "May 8, 10:22 AM",
    title: "Site prep & excavation complete",
    images: [
      "https://placehold.co/400x280/4a3728/fff?text=Excavation+1",
      "https://placehold.co/400x280/6b4f3a/fff?text=Excavation+2",
    ],
  },
];

type VideoItem = {
  id: number;
  title: string;
  date: string;
  duration: string;
  thumb: string;
  featured?: boolean;
};

const VIDEOS: VideoItem[] = [
  {
    id: 0,
    title: "Second Floor Structure Complete",
    date: "Updated May 15, 2025",
    duration: "4:12",
    thumb: "https://placehold.co/1200x600/1a1a1a/fff?text=Latest+Walkthrough",
    featured: true,
  },
  {
    id: 1,
    title: "Foundation Pour Time-lapse",
    date: "Apr 22, 2025",
    duration: "2:30",
    thumb: "https://placehold.co/400x260/2a2a2a/fff?text=Foundation",
  },
  {
    id: 2,
    title: "Initial Site Survey",
    date: "Mar 10, 2025",
    duration: "6:11",
    thumb: "https://placehold.co/400x260/3a3a3a/fff?text=Site+Survey",
  },
  {
    id: 3,
    title: "Framing Commencement",
    date: "May 02, 2025",
    duration: "1:45",
    thumb: "https://placehold.co/400x260/4a3728/fff?text=Framing",
  },
  {
    id: 4,
    title: "Foundation Pour Time-lapse",
    date: "Apr 22, 2025",
    duration: "2:30",
    thumb: "https://placehold.co/400x260/2a2a2a/fff?text=Foundation",
  },
  {
    id: 5,
    title: "Initial Site Survey",
    date: "Mar 10, 2025",
    duration: "6:11",
    thumb: "https://placehold.co/400x260/3a3a3a/fff?text=Site+Survey",
  },
  {
    id: 6,
    title: "Framing Commencement",
    date: "May 02, 2025",
    duration: "1:45",
    thumb: "https://placehold.co/400x260/4a3728/fff?text=Framing",
  },
];

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
  extraCount,
}: {
  images: string[];
  extraCount?: number;
}) {
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

  // Bento: [main] spans 2 rows left, top-right row has 2 thumbs, bottom-right is wide
  // Grid: 3 cols × 2 rows — main occupies col 1 rows 1-2
  const [main, tr1, tr2, br] = images;
  const bottomSrc = br ?? tr2;
  const showOverlay = extraCount != null;

  // Outer wrapper uses aspect-video to set total height responsively.
  // Inner grid is absolute-inset so it fills that height exactly.
  return (
    <div className="mt-3 relative w-full h-[40dvh] sm:h-[50dvh] md:h-[55dvh] lg:h-[60dvh] rounded-xl overflow-hidden">
      <div
        className="absolute inset-0 grid gap-1"
        style={{
          gridTemplateColumns: "3fr 2fr",
          gridTemplateRows: "1fr 1fr",
        }}
      >
        {/* main — spans both rows */}
        <div className="relative" style={{ gridRow: "1 / 3" }}>
          <Image src={main} alt="" fill className="object-cover" unoptimized />
        </div>

        {/* top-right: 2 side-by-side */}
        <div className="grid grid-cols-2 gap-1">
          {tr1 && (
            <div className="relative">
              <Image
                src={tr1}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          {tr2 && (
            <div className="relative">
              <Image
                src={tr2}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
        </div>

        {/* bottom-right — full width of right col */}
        {bottomSrc && (
          <div className="relative">
            <Image
              src={bottomSrc}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
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

function PhotoPostCard({ post }: { post: PhotoPost }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <PostAuthor author={post.author} avatar={post.avatar} time={post.time} />
      <p className="text-base font-semibold">{post.title}</p>
      <PhotoGrid images={post.images} extraCount={post.extraCount} />
    </div>
  );
}

function StatusCard({ post }: { post: StatusPost }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <Calendar size={15} className="text-[#C49A3C]" />
        <Badge
          variant="outline"
          className="text-[10px] tracking-widest uppercase border-border text-muted-foreground"
        >
          Status Update
        </Badge>
      </div>
      <p className="text-base font-semibold mb-1">{post.title}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {post.body}
      </p>
    </div>
  );
}

function FeaturedVideo({ video }: { video: VideoItem }) {
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden cursor-pointer group">
      <Image
        src={video.thumb}
        alt={video.title}
        fill
        className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
        unoptimized
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="size-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
          <Play size={28} className="text-white fill-white ml-1" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold tracking-widest uppercase bg-[#C49A3C] text-black px-2 py-0.5 rounded">
            Latest Walkthrough
          </span>
          <span className="text-xs text-white/70">{video.duration}</span>
        </div>
        <p className="text-white text-xl font-bold leading-tight">
          {video.title}
        </p>
        <p className="text-white/60 text-xs mt-1">{video.date}</p>
      </div>
    </div>
  );
}

function ThumbVideoCard({ video }: { video: VideoItem }) {
  return (
    <div className="cursor-pointer group">
      <div className="relative aspect-video rounded-xl overflow-hidden">
        <Image
          src={video.thumb}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-[1.03] transition-transform duration-300"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
        <span className="absolute bottom-2 right-2 text-[11px] text-white bg-black/60 px-1.5 py-0.5 rounded font-medium">
          {video.duration}
        </span>
      </div>
      <div className="mt-2">
        <p className="text-sm font-semibold leading-tight line-clamp-2">
          {video.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{video.date}</p>
      </div>
    </div>
  );
}

// ---- tab content ----
const PostsContent = (
  <div className="flex flex-col gap-4 w-full">
    {POSTS.map((post) =>
      post.kind === "photo" ? (
        <PhotoPostCard key={post.id} post={post} />
      ) : (
        <StatusCard key={post.id} post={post} />
      ),
    )}
  </div>
);

const featured = VIDEOS.find((v) => v.featured);
const thumbs = VIDEOS.filter((v) => !v.featured);

const VideosContent = (
  <div className="flex flex-col gap-5">
    {featured && <FeaturedVideo video={featured} />}
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {thumbs.map((v) => (
        <ThumbVideoCard key={v.id} video={v} />
      ))}
    </div>
  </div>
);

const TABS = [
  { name: "POSTS", value: "posts", content: PostsContent },
  { name: "VIDEOS", value: "videos", content: VideosContent },
];

// ---- page ----
export default function NewsFeedPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold tracking-tight">News Feed</h1>
      <p className="text-sm text-muted-foreground mt-1">
        All project updates from your team
      </p>
      <div className="mt-4">
        <AnimatedUnderlineTabsDemo tabs={TABS} />
      </div>
    </div>
  );
}
