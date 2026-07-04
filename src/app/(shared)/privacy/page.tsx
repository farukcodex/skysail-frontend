"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

import { Editor } from "primereact/editor";

export default function PrivacyPage() {
  const [content, setContent] = useState<string>("Loading...");
  const [title, setTitle] = useState<string>("Privacy Policy");

  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        const res = await apiFetch("/api/privacy");
        if (res.ok) {
          const data = await res.json();
          setContent(data.data.content || "No content available.");
          if (data.data.title) setTitle(data.data.title);
        } else {
          setContent("Failed to load privacy policy.");
        }
      } catch (err) {
        setContent("An error occurred while loading the privacy policy.");
      }
    };
    fetchPrivacy();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <div className="mt-4 [&_.ql-editor]:px-0 [&_.ql-editor]:text-sm sm:[&_.ql-editor]:text-base [&_.ql-container]:border-0 [&_.ql-editor]:pb-10">
          {content === "Loading..." || content.startsWith("Failed") || content.startsWith("An error") ? (
            <p className="text-sm text-muted-foreground">{content}</p>
          ) : (
            <Editor value={content} readOnly showHeader={false} />
          )}
        </div>
      </div>
    </div>
  );
}
