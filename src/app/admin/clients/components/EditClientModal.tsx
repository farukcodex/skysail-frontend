import { X, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { ModalShell } from "@/components/shared/ModalShell";
import { Field } from "@/components/shared/Field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Client } from "../page"; // We'll export the interface from page.tsx

export function EditClientModal({ client, onClose, onSuccess }: { client: Client, onClose: () => void, onSuccess: () => void }) {
  const [firstName, setFirstName] = useState(client.firstName);
  const [lastName, setLastName] = useState(client.lastName);
  const [email, setEmail] = useState(client.email);
  const [phone, setPhone] = useState(client.phone || "");
  const [newPassword, setNewPassword] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
    setErrorMsg("");
    
    try {
      const token = (localStorage.getItem("token") || sessionStorage.getItem("token"));
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8007";
      
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", `${firstName} ${lastName}`.trim());
      formData.append("email", email);
      if (phone) formData.append("phone", phone);
      if (newPassword) {
        formData.append("password", newPassword);
      }
      if (profilePhoto) {
        formData.append("profile_photo", profilePhoto);
      }

      const res = await fetch(`${baseUrl}/api/admin/clients/${client.id}`, {
        method: "POST", // Laravel requires POST with _method=PUT for multipart/form-data
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update client");
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalShell id="edit-client-title" title="Edit Client" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Field label="First Name" id="edit-first-name" placeholder="Jonathan" value={firstName} onChange={e => setFirstName(e.target.value)} required />
          <Field label="Last Name" id="edit-last-name" placeholder="Sterling" value={lastName} onChange={e => setLastName(e.target.value)} required />
          <Field label="Email Address" type="email" id="edit-email" placeholder="client@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <Field label="Phone Number (Optional)" type="tel" id="edit-phone" placeholder="0139000000" value={phone} onChange={e => setPhone(e.target.value)} />
          <Field label="New Password" type="password" id="edit-password" placeholder="Leave blank to keep current" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <div className="sm:col-span-2">
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                Profile Picture (Optional)
              </label>
              <div className="flex items-center gap-4 mt-1">
                <Avatar className="size-12 shrink-0">
                  <AvatarImage src={previewUrl || client.avatar} alt={client.firstName} />
                  <AvatarFallback className="text-sm bg-secondary text-secondary-foreground">
                    {client.firstName?.[0]}
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

        {errorMsg && <p className="text-red-500 text-sm mb-4 font-medium">{errorMsg}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-border text-sm font-semibold hover:bg-secondary transition-colors disabled:opacity-50">
            <X size={14} /> Cancel
          </button>
          <button type="submit" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-foreground text-background text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50">
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Save Changes"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
