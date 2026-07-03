import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

const GOLD = "#C49A3C";

export function Pagination({
  page,
  totalPages,
  setPage,
  totalItems,
  pageSize,
}: {
  page: number;
  totalPages: number;
  setPage: (p: number | ((prev: number) => number)) => void;
  totalItems: number;
  pageSize: number;
}) {
  function pageNumbers() {
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

  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-xs text-muted-foreground">
        Showing{" "}
        <span className="font-semibold text-foreground">
          {totalItems === 0 ? 0 : (page - 1) * pageSize + 1}–
          {Math.min(page * pageSize, totalItems)}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-foreground">
          {totalItems}
        </span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1 || totalPages === 0}
          onClick={() => setPage((p) => typeof p === 'number' ? p - 1 : p(page) - 1)}
          className="size-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>

        {pageNumbers().map((p, i) =>
          p === "..." ? (
            <span
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
              className="size-8 flex items-center justify-center rounded-lg text-xs font-semibold border transition-colors"
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
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage((p) => typeof p === 'number' ? p + 1 : p(page) + 1)}
          className="size-8 flex items-center justify-center rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
