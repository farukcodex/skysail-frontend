import { Download } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DocFile {
  id: number;
  name: string;
  size: string;
}

interface DocGroup {
  label: string;
  files: DocFile[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const GROUPS: DocGroup[] = [
  {
    label: "Contracts",
    files: [
      { id: 1, name: "Construction contract — signed", size: "2.1 MB" },
      { id: 2, name: "Architectural plans v3.2", size: "2.1 MB" },
      { id: 3, name: "Architectural plans v3.2", size: "2.1 MB" },
    ],
  },
  {
    label: "Plans & drawings",
    files: [
      { id: 4, name: "Construction contract — signed", size: "2.1 MB" },
      { id: 5, name: "Architectural plans v3.2", size: "2.1 MB" },
      { id: 6, name: "Architectural plans v3.2", size: "2.1 MB" },
    ],
  },
  {
    label: "Reports & summaries",
    files: [
      { id: 7, name: "Construction contract — signed", size: "2.1 MB" },
      { id: 8, name: "Architectural plans v3.2", size: "2.1 MB" },
      { id: 9, name: "Architectural plans v3.2", size: "2.1 MB" },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PdfIcon() {
  return (
    <div className="size-9 shrink-0 relative">
      {/* Page shape */}
      <div className="absolute inset-0 bg-gray-100 dark:bg-muted rounded-sm border border-border" />
      {/* Folded corner */}
      <div
        className="absolute top-0 right-0 size-3 bg-background"
        style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
      />
      {/* PDF label */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[7px] font-bold px-1 rounded-sm leading-tight py-px">
        PDF
      </div>
    </div>
  );
}

function FileRow({ file }: { file: DocFile }) {
  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-border last:border-0">
      <PdfIcon />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">{file.size}</p>
      </div>
      <button
        type="button"
        className="text-[#C49A3C] hover:opacity-70 transition-opacity p-1 shrink-0"
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
