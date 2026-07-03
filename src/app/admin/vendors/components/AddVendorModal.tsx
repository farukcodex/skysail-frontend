import { X, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { ModalShell } from "@/components/shared/ModalShell";
import { Field } from "@/components/shared/Field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

const DESIGNATIONS = ["Architect", "Designer", "Builder", "General Vendor"] as const;

export function AddVendorModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [designation, setDesignation] = useState<typeof DESIGNATIONS[number]>(DESIGNATIONS[0]);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!profilePhoto) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(profilePhoto);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profilePhoto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("name", `${firstName} ${lastName}`.trim());
      formData.append("email", email);
      formData.append("password", password);
      formData.append("designation", designation);
      if (phone) formData.append("phone", phone);
      if (profilePhoto) {
        formData.append("profile_photo", profilePhoto);
      }

      const res = await apiFetch(`/api/admin/vendors`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        let errMsg = data.message || "Failed to add vendor";
        if (data.errors) {
          const errorKeys = Object.keys(data.errors).filter(k => k !== 'code' && k !== 'trace');
          if (errorKeys.length > 0) {
            const firstError = data.errors[errorKeys[0]];
            errMsg = Array.isArray(firstError) ? firstError[0] : firstError;
          }
        }
        throw new Error(errMsg);
      }
      
      onSuccess();
      onClose();
      toast.success("Vendor added successfully!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalShell id="add-vendor-title" title="Add Vendor" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Field label="First Name" id="add-first-name" placeholder="Jonathan" value={firstName} onChange={e => setFirstName(e.target.value)} required />
          <Field label="Last Name" id="add-last-name" placeholder="Sterling" value={lastName} onChange={e => setLastName(e.target.value)} required />
          <Field label="Email Address" type="email" id="add-email" placeholder="vendor@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <Field label="Phone Number (Optional)" type="tel" id="add-phone" placeholder="0139000000" value={phone} onChange={e => setPhone(e.target.value)} />
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="vendor-designation" className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
              Designation
            </label>
            <select
              id="vendor-designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value as typeof DESIGNATIONS[number])}
              className="w-full rounded-xl bg-secondary/60 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition appearance-none"
            >
              {DESIGNATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          
          <Field label="Set Password" type="password" id="add-password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          
          <div className="sm:col-span-2">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                Profile Picture (Optional)
              </label>
              <div className="flex items-center gap-4 mt-1">
                <Avatar className="size-12 shrink-0">
                  <AvatarImage src={previewUrl || undefined} alt="Preview" />
                  <AvatarFallback className="text-sm bg-secondary text-secondary-foreground">
                    IMG
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setProfilePhoto(e.target.files?.[0] || null)}
                  className="flex-1 rounded-xl bg-secondary/60 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 transition file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-foreground file:text-background hover:file:bg-foreground/90 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50">
            <X size={14} /> Cancel
          </button>
          <button type="submit" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-foreground text-background text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50">
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Add Vendor"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
