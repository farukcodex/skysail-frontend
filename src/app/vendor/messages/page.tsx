"use client";

import Image from "next/image";
import { useState } from "react";
import { Paperclip, Smile, Send, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const MESSAGES = [
  {
    id: 1,
    from: "admin" as const,
    text: "Hi Anna, can you please update the window rough openings on the second floor plans? Builder flagged a mismatch.",
    time: "Remy · 9:00 AM",
  },
  {
    id: 2,
    from: "user" as const,
    text: "On it — will upload revised plans by end of today.",
    time: "9:15 AM ✓",
  },
  {
    id: 3,
    from: "admin" as const,
    text: "Perfect. Also please include the updated roof framing section in the same upload.",
    time: "Remy · 9:20 AM",
  },
];

export default function VendorMessagesPage() {
  const [input, setInput] = useState("");

  return (
    <div className="flex flex-col h-[calc(100dvh-73px)] bg-background">
      {/* Admin info card */}
      <div className="px-6 pt-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-background px-5 py-4">
          <div className="flex items-center gap-3">
            <Image
              src="https://api.dicebear.com/9.x/avataaars/png?seed=RemyAdmin&size=40&backgroundColor=b6e3f4"
              alt="Remy Admin"
              width={40}
              height={40}
              className="rounded-full"
              unoptimized
            />
            <div>
              <p className="text-sm font-bold">Remy (Admin)</p>
              <p className="text-xs text-muted-foreground">
                SkySail Operations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div className="px-6 pt-3 lg:px-8">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-red-800 dark:text-red-200">
          <AlertCircle size={16} className="shrink-0" />
          <span>
            You can only communicate with the SkySail admin team — no direct
            client contact
          </span>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 lg:px-8 flex flex-col gap-4">
        {/* Date pill */}
        <div className="flex justify-center">
          <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
            Today
          </span>
        </div>

        {MESSAGES.map((msg) =>
          msg.from === "admin" ? (
            <div key={msg.id} className="flex items-end gap-2 max-w-[75%]">
              <Image
                src="https://api.dicebear.com/9.x/avataaars/png?seed=RemyAdmin&size=32&backgroundColor=b6e3f4"
                alt="Remy"
                width={32}
                height={32}
                className="rounded-full shrink-0"
                unoptimized
              />
              <div>
                <div className="rounded-2xl rounded-tl-sm bg-background border border-border px-4 py-3 text-sm">
                  {msg.text}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 ml-1">
                  {msg.time}
                </p>
              </div>
            </div>
          ) : (
            <div
              key={msg.id}
              className="flex items-end gap-2 max-w-[75%] self-end flex-row-reverse"
            >
              <div>
                <div className="rounded-2xl rounded-tr-sm bg-foreground text-background px-4 py-3 text-sm">
                  {msg.text}
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 text-right mr-1">
                  {msg.time}
                </p>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Input area */}
      <div className="px-6 pb-4 lg:px-8">
        <div className="rounded-2xl border border-border bg-background px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message to SkySail Admin..."
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Smile size={18} />
          </button>
          <button
            type="button"
            className="flex items-center justify-center size-9 rounded-xl bg-foreground text-background hover:opacity-80 transition-opacity shrink-0"
          >
            <Send size={14} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-[10px] text-muted-foreground">
            Secure channel encrypted for SkySail internal use.
          </p>
          <p className="text-[10px] text-amber-500 flex items-center gap-1">
            <span className="inline-block size-1.5 rounded-full bg-amber-500" />
            Remy is typing...
          </p>
        </div>
      </div>
    </div>
  );
}
