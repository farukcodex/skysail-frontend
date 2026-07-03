import { X } from "lucide-react";
import React from "react";

export function ModalShell({
  id,
  title,
  onClose,
  children,
}: {
  id: string;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className="bg-background rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative z-10 max-h-[90dvh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id={id} className="text-lg font-bold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="size-9 flex items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
