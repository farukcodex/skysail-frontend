"use client";

import { Editor } from "primereact/editor";
import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const TABS = [
  {
    id: "privacy",
    label: "Privacy Policy",
    title: "Privacy Policy",
    date: "Dec 4, 2019 21:42",
  },
  {
    id: "terms",
    label: "Terms and Conditions",
    title: "Terms and Conditions",
    date: "Dec 4, 2019 21:42",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("privacy");
  const [privacyText, setPrivacyText] = useState<string>("");
  const [termsText, setTermsText] = useState<string>("");

  const tab = TABS.find((t) => t.id === activeTab) ?? TABS[0];
  const text = activeTab === "privacy" ? privacyText : termsText;
  const setText = activeTab === "privacy" ? setPrivacyText : setTermsText;

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage Privacy Policy and Terms and Conditions
          </p>
        </div>

        {/* Animated tabs */}
        <div className="relative flex gap-0 border-b border-border w-full">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className="relative px-4 pb-3 text-sm font-medium transition-colors z-10"
              style={{
                color:
                  activeTab === t.id
                    ? "var(--foreground)"
                    : "var(--muted-foreground)",
              }}
            >
              {t.label}
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300 origin-left"
                style={{
                  backgroundColor: "var(--foreground)",
                  transform: activeTab === t.id ? "scaleX(1)" : "scaleX(0)",
                }}
              />
            </button>
          ))}
        </div>

        {/* Editor card */}
        <div
          key={activeTab}
          className="rounded-2xl border border-border overflow-hidden flex flex-col animate-in fade-in duration-200"
        >
          {/* Card header */}
          <div className="px-5 py-4 border-b border-border flex flex-col gap-0.5">
            <p className="text-base font-bold">{tab.title}</p>
            <p className="text-xs text-muted-foreground">{tab.date}</p>
          </div>

          {/* PrimeReact Editor */}
          <div className="p-0 [&_.ql-toolbar]:border-0 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-border [&_.ql-container]:border-0 [&_.ql-editor]:min-h-64 [&_.ql-editor]:text-sm">
            <Editor
              value={text}
              onTextChange={(e) => setText(e.htmlValue ?? "")}
              style={{ border: "none", borderRadius: 0 }}
            />
          </div>

          {/* Save button */}
          <div className="px-5 py-4 border-t border-border">
            <button
              type="button"
              className="w-full flex items-center justify-center py-4 rounded-2xl bg-foreground text-background text-sm font-bold tracking-wide hover:opacity-90 transition-opacity"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
