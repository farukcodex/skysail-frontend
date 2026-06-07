"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Send,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const GOLD = "#C49A3C";
const PAGE_SIZE = 10;

const CLIENT_PROJECTS = [
  "Bob Henderson — The Henderson Residence",
  "Alice Mercer — The Mercer Custom Build",
  "Tom Larsen — The Larsen Pool & Addition",
];

interface Member {
  id: number;
  name: string;
  designation: string;
  email: string;
  avatar: string;
  meetLink?: string;
}

const SEED_MEMBERS: Member[] = [
  {
    id: 1,
    name: "Remy DiAngelo",
    designation: "Owner's Representative",
    email: "remy@remyco.com",
    avatar:
      "https://api.dicebear.com/9.x/avataaars/png?seed=RemyDiAngelo&size=48&backgroundColor=b6e3f4",
  },
  {
    id: 2,
    name: "James Sullivan",
    designation: "Lead Builder",
    email: "james@sullivanbuilds.com",
    avatar:
      "https://api.dicebear.com/9.x/avataaars/png?seed=JamesSullivan&size=48&backgroundColor=c0aede",
  },
  {
    id: 3,
    name: "Anna Keller",
    designation: "Architect",
    email: "anna@kellerarch.com",
    avatar:
      "https://api.dicebear.com/9.x/avataaars/png?seed=AnnaKeller&size=48&backgroundColor=d1d4f9",
  },
  {
    id: 4,
    name: "Marco Torres",
    designation: "Interior Designer",
    email: "marco@torresdesign.com",
    avatar:
      "https://api.dicebear.com/9.x/avataaars/png?seed=MarcoTorres&size=48&backgroundColor=ffd5dc",
  },
  {
    id: 5,
    name: "Priya Lam",
    designation: "Structural Engineer",
    email: "priya@lameng.com",
    avatar:
      "https://api.dicebear.com/9.x/avataaars/png?seed=PriyaLam&size=48&backgroundColor=b6e3f4",
  },
  {
    id: 6,
    name: "Carlos Reyes",
    designation: "MEP Consultant",
    email: "carlos@reyesmep.com",
    avatar:
      "https://api.dicebear.com/9.x/avataaars/png?seed=CarlosReyes&size=48&backgroundColor=c0aede",
  },
];

const ALL_MEMBERS: Member[] = [
  ...SEED_MEMBERS,
  ...Array.from({ length: 26 }, (_, i) => ({
    ...SEED_MEMBERS[i % SEED_MEMBERS.length],
    id: i + 7,
    email: `member${i + 7}@example.com`,
  })),
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pageNumbers(page: number, totalPages: number): (number | "...")[] {
  const pages: (number | "...")[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }
  return pages;
}

// ─── Page ────────────────────────────────────────────────────────────────────

const PREVIEW_AVATAR =
  "https://api.dicebear.com/9.x/avataaars/png?seed=WadeWarren&size=64&backgroundColor=1a2332";

export default function TeamPage() {
  const [client, setClient] = useState(CLIENT_PROJECTS[0]);
  const [members, setMembers] = useState(ALL_MEMBERS);
  const [page, setPage] = useState(1);

  // form
  const [name, setName] = useState("Remy DiAngelo");
  const [designation, setDesignation] = useState("Owner's Representative");
  const [email, setEmail] = useState("james@sullivanbuilds.com");
  const [meetLink, setMeetLink] = useState("");
  const [previewAvatar, setPreviewAvatar] = useState(PREVIEW_AVATAR);
  const fileRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.ceil(members.length / PAGE_SIZE);
  const pageMembers = members.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreviewAvatar(URL.createObjectURL(file));
  }

  function handleAdd() {
    if (!name.trim()) return;
    setMembers((prev) => [
      {
        id: Date.now(),
        name,
        designation,
        email,
        avatar: previewAvatar,
        meetLink: meetLink || undefined,
      },
      ...prev,
    ]);
    setName("");
    setDesignation("");
    setEmail("");
    setMeetLink("");
    setPreviewAvatar(PREVIEW_AVATAR);
    setPage(1);
  }

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-1">All members</p>
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
          {/* LEFT — Member list */}
          <div className="rounded-2xl border border-border overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Member list</p>
            </div>

            <div className="flex flex-col divide-y divide-border">
              {pageMembers.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/30 transition-colors"
                >
                  <div className="size-11 rounded-full overflow-hidden bg-muted shrink-0">
                    <Image
                      src={m.avatar}
                      alt={m.name}
                      width={44}
                      height={44}
                      className="object-cover size-11"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.designation}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.email}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-border mt-auto">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, members.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {members.length}
                </span>
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="size-7 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={13} />
                </button>

                {pageNumbers(page, totalPages).map((p, i) =>
                  p === "..." ? (
                    <span
                      // biome-ignore lint/suspicious/noArrayIndexKey: ellipsis separator
                      key={`ellipsis-${i}`}
                      className="px-1 text-xs text-muted-foreground"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p as number)}
                      className="size-7 flex items-center justify-center rounded-lg text-xs font-semibold border transition-colors"
                      style={
                        page === p
                          ? {
                              backgroundColor: GOLD,
                              color: "#fff",
                              borderColor: GOLD,
                            }
                          : {}
                      }
                    >
                      {p}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="size-7 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT — Add member form */}
          <div className="rounded-2xl border border-border overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold">Add member</p>
            </div>

            <div className="p-5 flex flex-col gap-5">
              {/* Avatar preview + upload */}
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-full overflow-hidden bg-muted shrink-0">
                  <Image
                    src={previewAvatar}
                    alt="Preview"
                    width={64}
                    height={64}
                    className="object-cover size-16"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <p className="text-base font-bold truncate">
                    {name || "Wade Warren"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {email || "tan@gmail.com"}
                  </p>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-secondary transition-colors"
                >
                  <UploadCloud size={13} />
                  Upload Image
                </button>
              </div>

              {/* Member name */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Member Name
                </p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Remy DiAngelo"
                  className="w-full border-b border-border pb-3 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Member designation */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Member Designation
                </p>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Owner's Representative"
                  className="w-full border-b border-border pb-3 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Member mail */}
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Member Mail
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="james@sullivanbuilds.com"
                  className="w-full border-b border-border pb-3 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Meeting link */}
              {/* <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                  Meeting Link
                </p>
                <input
                  type="text"
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                  placeholder="Link"
                  className="w-full border-b border-border pb-3 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/40"
                />
              </div> */}

              {/* Add button */}
              <button
                type="button"
                onClick={handleAdd}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity"
              >
                ADD MEMBER
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
