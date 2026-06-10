import { Download } from "lucide-react";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Uploader {
  name: string;
  role: string;
  avatar: string;
}

interface DocFile {
  id: number;
  name: string;
  size: string;
  uploadedBy: Uploader;
}

interface DocGroup {
  label: string;
  files: DocFile[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const BOB: Uploader = {
  name: "Bob Henderson",
  role: "Owner's Representative",
  avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=BobHenderson&size=40&backgroundColor=b6e3f4",
};

const ANNA: Uploader = {
  name: "Bob Henderson",
  role: "Architecture",
  avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=AnnaKeller&size=40&backgroundColor=d1d4f9",
};

const DESIGNER: Uploader = {
  name: "Bob Henderson",
  role: "Interior designer",
  avatar: "https://api.dicebear.com/9.x/avataaars/png?seed=MarcoTorres&size=40&backgroundColor=ffd5dc",
};

const GROUPS: DocGroup[] = [
  {
    label: "Contracts",
    files: [
      { id: 1, name: "Construction contract — signed", size: "2.1 MB", uploadedBy: BOB },
      { id: 2, name: "Architectural plans v3.2", size: "2.1 MB", uploadedBy: ANNA },
    ],
  },
  {
    label: "Plans & drawings",
    files: [
      { id: 3, name: "Construction contract — signed", size: "2.1 MB", uploadedBy: DESIGNER },
      { id: 4, name: "Construction contract — signed", size: "2.1 MB", uploadedBy: DESIGNER },
    ],
  },
  {
    label: "Reports & summaries",
    files: [
      { id: 5, name: "Construction contract — signed", size: "2.1 MB", uploadedBy: BOB },
      { id: 6, name: "Architectural plans v3.2", size: "2.1 MB", uploadedBy: ANNA },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PdfIcon() {
  return (
    <div className="size-9 shrink-0 relative">
      <div className="absolute inset-0 bg-gray-100 dark:bg-muted rounded-sm border border-border" />
      <div
        className="absolute top-0 right-0 size-3 bg-background"
        style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
      />
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[7px] font-bold px-1 rounded-sm leading-tight py-px">
        PDF
      </div>
    </div>
  );
}

function FileRow({ file }: { file: DocFile }) {
  return (
    <div className="flex items-center gap-3 py-4 border-b border-border last:border-0">
      <PdfIcon />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {file.name}&nbsp;&nbsp;<span className="text-muted-foreground font-normal">{file.size}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1 mb-1.5">Uploaded by</p>
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full overflow-hidden bg-muted shrink-0">
            <Image
              src={file.uploadedBy.avatar}
              alt={file.uploadedBy.name}
              width={32}
              height={32}
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">{file.uploadedBy.name}</p>
            <p className="text-xs text-muted-foreground">{file.uploadedBy.role}</p>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="text-[#C49A3C] hover:opacity-70 transition-opacity p-1 shrink-0 self-start mt-1"
        aria-label="Download"
      >
        <Download size={18} />
      </button>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Documents &amp; files
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Contracts, plans, reports, and presentations
          </p>
        </div>

        {/* File groups */}
        <div className="flex flex-col gap-4">
          {GROUPS.map((group) => (
            <Card key={group.label} className="rounded-2xl">
              <CardContent className="pt-4 pb-1">
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  {group.label}
                </p>
                {group.files.map((f) => (
                  <FileRow key={f.id} file={f} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
