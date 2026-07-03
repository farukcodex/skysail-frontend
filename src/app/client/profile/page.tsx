"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, UploadIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { getToken, setAuth, getUser } from "@/lib/auth";

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldGroup({
  label,
  id,
  type = "text",
  value,
  onChange,
  showToggle = false,
  disabled = false,
  readOnly = false,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showToggle?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
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
          value={value}
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
          className={`w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition pr-11 ${
            readOnly || disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
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

// ─── Page ────────────────────────────────────────────────────────────────────

type Tab = "edit" | "password";

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>("edit");
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8007";

  const fetchProfile = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${baseUrl}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUserProfile(data.data);
        setName(data.data.name || "");
        setEmail(data.data.email || "");
        setPhone(data.data.phone || "");
        setPhotoPreview(data.data.profile_photo_url || "");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleEditProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("_method", "PATCH"); // Laravel multipart spoofing
      formData.append("name", name);
      if (phone) formData.append("phone", phone);
      if (photoFile) formData.append("profile_photo", photoFile);

      const res = await fetch(`${baseUrl}/api/profile`, {
        method: "POST", // Must be POST with _method=PATCH for FormData
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile.");
      
      toast.success(data.message || "Profile updated successfully.");
      
      // Refresh context user if needed
      const currentUser = getUser();
      if (currentUser) {
        setAuth(token as string, { ...currentUser, ...data.data.user }, !!localStorage.getItem("token"));
      }
      setUserProfile((prev: any) => ({ ...prev, ...data.data.user }));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = getToken();
      const res = await fetch(`${baseUrl}/api/profile/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update password.");
      
      toast.success(data.message || "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-dvh bg-background items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  const defaultAvatar = `https://api.dicebear.com/9.x/initials/svg?seed=${name || "User"}`;

  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6 max-w-3xl w-full mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile Manage</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your Profile
          </p>
        </div>

        {/* Avatar row */}
        <div className="flex items-center gap-5">
          <div className="size-16 rounded-full overflow-hidden border border-border shrink-0 bg-muted relative">
            <Image
              src={photoPreview || defaultAvatar}
              alt={name || "User avatar"}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <p className="text-base font-bold">{name}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handlePhotoChange} 
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
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
        {tab === "edit" ? (
          <form className="flex flex-col gap-5" onSubmit={handleEditProfileSubmit}>
            <FieldGroup label="Full Name" id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving} />
            <FieldGroup
              label="Email Address (Cannot be changed)"
              id="email"
              type="email"
              value={email}
              readOnly
            />
            <FieldGroup
              label="Phone Number"
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSaving}
            />
            <button
              type="submit"
              disabled={isSaving}
              className="w-full mt-2 bg-foreground text-background rounded-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold tracking-wide hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              {isSaving ? "Saving..." : "Save changes"}
            </button>
          </form>
        ) : (
          <form className="flex flex-col gap-5" onSubmit={handleChangePasswordSubmit}>
            <FieldGroup
              label="Current Password"
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              showToggle
              disabled={isSaving}
            />
            <FieldGroup
              label="New Password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              showToggle
              disabled={isSaving}
            />
            <FieldGroup
              label="Confirm New Password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              showToggle
              disabled={isSaving}
            />
            <button
              type="submit"
              disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
              className="w-full mt-2 bg-foreground text-background rounded-full flex justify-center items-center gap-2 py-3.5 text-sm font-bold tracking-wide hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {isSaving && <Loader2 size={16} className="animate-spin" />}
              {isSaving ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
