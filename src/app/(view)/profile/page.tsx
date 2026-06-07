"use client";

import { useState } from "react";

import { Eye, EyeOff, UploadIcon } from "lucide-react";
import Image from "next/image";

// ─── Constants ───────────────────────────────────────────────────────────────

const AVATAR_URL =
  "https://api.dicebear.com/9.x/avataaars/png?seed=BobHenderson&size=96&backgroundColor=b6e3f4";

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldGroup({
  label,
  id,
  type = "text",
  defaultValue,
  showToggle = false,
}: {
  label: string;
  id: string;
  type?: string;
  defaultValue: string;
  showToggle?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const inputType = showToggle ? (visible ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          defaultValue={defaultValue}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition pr-11"
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

function EditProfileTab() {
  return (
    <form className="flex flex-col gap-5">
      <FieldGroup label="Full Name" id="name" defaultValue="Bob Henderson" />
      <FieldGroup
        label="Email Address"
        id="email"
        type="email"
        defaultValue="bob@henderson.com"
      />
      <FieldGroup
        label="Phone Number"
        id="phone"
        type="tel"
        defaultValue="0139000000"
      />
      <button
        type="submit"
        className="w-full mt-2 bg-foreground text-background rounded-full py-3.5 text-sm font-bold tracking-wide hover:opacity-80 transition-opacity"
      >
        Save changes
      </button>
    </form>
  );
}

function ChangePasswordTab() {
  return (
    <form className="flex flex-col gap-5">
      <FieldGroup
        label="Current Password"
        id="current-password"
        defaultValue=""
        showToggle
      />
      <FieldGroup
        label="New Password"
        id="new-password"
        defaultValue=""
        showToggle
      />
      <FieldGroup
        label="Confirm New Password"
        id="confirm-password"
        defaultValue=""
        showToggle
      />
      <button
        type="submit"
        className="w-full mt-2 bg-foreground text-background rounded-full py-3.5 text-sm font-bold tracking-wide hover:opacity-80 transition-opacity"
      >
        Update password
      </button>
    </form>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

type Tab = "edit" | "password";

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>("edit");

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile Manage</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your Profile
          </p>
        </div>

        {/* Avatar row */}
        <div className="flex items-center gap-5">
          <div className="size-16 rounded-full overflow-hidden border border-border shrink-0 bg-muted">
            <Image
              src={AVATAR_URL}
              alt="Bob Henderson"
              width={64}
              height={64}
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <p className="text-base font-bold">Bob Henderson</p>
            <p className="text-sm text-muted-foreground">bob@henderson.com</p>
          </div>
          <button
            type="button"
            className="ml-auto flex items-center gap-2 bg-foreground text-background text-xs font-bold tracking-wide px-4 py-2.5 rounded-full hover:opacity-80 transition-opacity shrink-0"
          >
            <UploadIcon size={13} />
            Upload Image
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-border">
          {(
            [
              { key: "edit", label: "Edit Profile" },
              { key: "password", label: "Change Password" },
            ] as { key: Tab; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`pb-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                tab === key
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "edit" ? <EditProfileTab /> : <ChangePasswordTab />}
      </div>
    </div>
  );
}
