"use client";

import { Camera, ChevronDown, Edit2, Send, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const GOLD = "#C49A3C";

const UPDATE_TYPES = [
  "Video update",
  "Photo update",
  "Framing photos",
  "Status update",
  "Milestone update",
];

const CLIENT_PROJECTS = [
  "Bob Henderson — The Henderson Residence",
  "Alice Mercer — The Mercer Custom Build",
  "Tom Larsen — The Larsen Pool & Addition",
];

interface FeedItem {
  id: number;
  type: "media" | "status";
  updateType?: string;
  title: string;
  body: string;
  thumb?: string;
  isVideo?: boolean;
  date?: string;
}

const FEED: FeedItem[] = [
  {
    id: 1,
    type: "media",
    updateType: "Framing photos",
    title: "Framing photos — week 8 progress",
    body: "Main structure completed for west wing. Inspection scheduled for Monday. Timber",
    thumb: "https://placehold.co/88x72/8B6914/ffffff?text=Frame",
    isVideo: false,
  },
  {
    id: 2,
    type: "media",
    updateType: "Video update",
    title: "Framing photos — week 8 progress",
    body: "Main structure completed for west wing. Inspection scheduled for Monday. Timber",
    isVideo: true,
  },
  {
    id: 3,
    type: "media",
    updateType: "Video update",
    title: "Framing photos — week 8 progress",
    body: "Main structure completed for west wing. Inspection scheduled for Monday. Timber",
    isVideo: true,
  },
  {
    id: 4,
    type: "media",
    updateType: "Video update",
    title: "Framing photos — week 8 progress",
    body: "Main structure completed for west wing. Inspection scheduled for Monday. Timber",
    isVideo: true,
  },
  {
    id: 5,
    type: "status",
    title: "Weekly summary — May 16, 2025",
    body: "Framing on schedule, lumber delivery pending resolution. The site remains active with 12 crew members. Electrical rough-in scheduled to begin as soon as the roof decking is secured.",
    date: "May 16, 2025",
  },
];

// ─── Edit Modal ───────────────────────────────────────────────────────────────

const EDIT_IMAGES = [
  "https://placehold.co/140x110/1a2332/ffffff?text=1",
  "https://placehold.co/140x110/8B6914/ffffff?text=2",
  "https://placehold.co/140x110/2d4a2d/ffffff?text=3",
  "https://placehold.co/140x110/3a2d1c/ffffff?text=4",
  "https://placehold.co/140x110/1c2b3a/ffffff?text=5",
];

function EditModal({
  item,
  onClose,
}: {
  item: FeedItem;
  onClose: () => void;
}) {
  const [notify, setNotify] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
        className="bg-background w-full sm:max-w-lg sm:rounded-3xl shadow-2xl relative z-10 max-h-[95dvh] overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 id="edit-modal-title" className="text-lg font-bold">
            Edit
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="size-9 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-5">
          {/* UPDATE TYPE */}
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
              UPDATE TYPE
            </p>
            <p className="text-base font-bold border-b border-border pb-3">
              {item.updateType ?? "Framing photos"}
            </p>
          </div>

          {/* Title */}
          <div className="border-b border-border pb-3">
            <p className="text-base font-bold">week 8 progress</p>
          </div>

          {/* Body */}
          <div className="border-b border-border pb-3 min-h-[80px]">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.body}
            </p>
          </div>

          {/* Media grid */}
          <div className="flex gap-3">
            {/* Existing images grid */}
            <div className="grid grid-cols-2 gap-1.5 w-[160px] shrink-0">
              {EDIT_IMAGES.slice(0, 4).map((src, i) => (
                <div
                  key={src}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                >
                  <Image
                    src={src}
                    alt={`media ${i + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {i === 3 && (
                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        +8 more
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Attach media zone */}
            <div className="flex-1 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 p-4 min-h-[120px]">
              <div
                className="size-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${GOLD}22` }}
              >
                <Camera size={16} style={{ color: GOLD }} />
              </div>
              <p className="text-xs font-semibold text-center leading-snug">
                Attach media (photos / video)
              </p>
              <p className="text-[10px] text-muted-foreground text-center leading-snug">
                High-fidelity RAW or 4K files preferred for client portals
              </p>
            </div>
          </div>

          {/* Push notification toggle */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Send push notification?</p>
            <button
              type="button"
              role="switch"
              aria-checked={notify}
              onClick={() => setNotify((v) => !v)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{ backgroundColor: notify ? "#1a1a1a" : "#e5e7eb" }}
            >
              <span
                className="inline-block size-5 rounded-full bg-white shadow transition-transform"
                style={{ transform: notify ? "translateX(22px)" : "translateX(2px)" }}
              />
            </button>
          </div>

          {/* Publish button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity"
          >
            PUBLISH UPDATE
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Feed Items ───────────────────────────────────────────────────────────────

function MediaFeedItem({
  item,
  onEdit,
}: {
  item: FeedItem;
  onEdit: (i: FeedItem) => void;
}) {
  return (
    <div className="flex gap-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors">
      {/* Thumbnail */}
      <div className="shrink-0 w-[88px] h-[72px] rounded-lg overflow-hidden bg-muted relative">
        {item.isVideo ? (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] border-l-white ml-0.5" />
            </div>
          </div>
        ) : (
          item.thumb && (
            <Image
              src={item.thumb}
              alt={item.title}
              fill
              className="object-cover"
              unoptimized
            />
          )
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-sm font-semibold leading-snug line-clamp-1">
          {item.title}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {item.body}
        </p>
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="flex items-center gap-1.5 text-xs font-semibold w-fit mt-0.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
        >
          <Edit2 size={11} />
          Edit
        </button>
      </div>
    </div>
  );
}

function StatusFeedItem({ item }: { item: FeedItem }) {
  return (
    <div className="flex flex-col gap-1.5 px-3 py-3">
      <div className="flex items-center gap-2">
        <span className="text-base">📅</span>
        <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
          Status Update
        </p>
      </div>
      <p className="text-sm font-bold">{item.title}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PostUpdatesPage() {
  const [client, setClient] = useState(CLIENT_PROJECTS[0]);
  const [updateType, setUpdateType] = useState(UPDATE_TYPES[0]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [notify, setNotify] = useState(false);
  const [editItem, setEditItem] = useState<FeedItem | null>(null);

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {editItem && (
        <EditModal item={editItem} onClose={() => setEditItem(null)} />
      )}

      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="font-bold">Post </span>
            <span className="text-muted-foreground font-normal">updates</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publish news feed content to client portals
          </p>
        </div>

        {/* Client / Project selector */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
            Client / Project
          </p>
          <div className="relative">
            <select
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition"
            >
              {CLIENT_PROJECTS.map((cp) => (
                <option key={cp} value={cp}>
                  {cp}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start">
          {/* LEFT — Project news feed */}
          <div className="rounded-2xl border border-border overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Project news feed</p>
            </div>
            <div className="flex flex-col divide-y divide-border">
              {FEED.map((item) =>
                item.type === "status" ? (
                  <StatusFeedItem key={item.id} item={item} />
                ) : (
                  <MediaFeedItem
                    key={item.id}
                    item={item}
                    onEdit={setEditItem}
                  />
                ),
              )}
            </div>
          </div>

          {/* RIGHT — New update form */}
          <div className="rounded-2xl border border-border overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">New update</p>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* Update type */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Update Type
                </p>
                <div className="relative">
                  <select
                    value={updateType}
                    onChange={(e) => setUpdateType(e.target.value)}
                    className="w-full appearance-none bg-transparent border-b border-border pb-3 pr-8 text-sm font-medium focus:outline-none"
                  >
                    {UPDATE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-1 top-1/2 -translate-y-3/4 text-muted-foreground pointer-events-none"
                  />
                </div>
              </div>

              {/* Update title */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Update Title
                </p>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Update Title"
                  className="w-full bg-transparent border-b border-border pb-3 text-sm focus:outline-none placeholder:text-muted-foreground/50"
                />
              </div>

              {/* Body */}
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your project update content here..."
                rows={5}
                className="w-full bg-transparent border-b border-border pb-3 text-sm resize-none focus:outline-none placeholder:text-muted-foreground/50"
              />

              {/* Attach media */}
              <button
                type="button"
                className="border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 py-8 hover:bg-secondary/30 transition-colors"
              >
                <div
                  className="size-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${GOLD}22` }}
                >
                  <Camera size={18} style={{ color: GOLD }} />
                </div>
                <p className="text-sm font-semibold">
                  Attach media (photos / video link)
                </p>
                <p className="text-xs text-muted-foreground">
                  High-fidelity RAW or 4K files preferred for client portals
                </p>
              </button>

              {/* Push notification toggle */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Send push notification?</p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notify}
                  onClick={() => setNotify((v) => !v)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  style={{ backgroundColor: notify ? "#1a1a1a" : "#e5e7eb" }}
                >
                  <span
                    className="inline-block size-5 rounded-full bg-white shadow transition-transform"
                    style={{
                      transform: notify
                        ? "translateX(22px)"
                        : "translateX(2px)",
                    }}
                  />
                </button>
              </div>

              {/* Publish button */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity"
              >
                PUBLISH UPDATE
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
