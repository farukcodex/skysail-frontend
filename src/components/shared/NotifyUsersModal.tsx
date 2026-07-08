"use client";

import { useState } from "react";
import { ModalShell } from "./ModalShell";
import { apiFetch } from "@/lib/api";
import { Loader2 } from "lucide-react";

export type NotifyUserTarget = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

type NotifyUsersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  users: NotifyUserTarget[];
  userType: "client" | "vendor";
};

export function NotifyUsersModal({
  isOpen,
  onClose,
  users,
  userType,
}: NotifyUsersModalProps) {
  const [notifyAll, setNotifyAll] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleUserSelection = (id: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyAll && selectedUserIds.length === 0) {
      setError("Please select at least one " + userType + ".");
      return;
    }
    if (!subject.trim()) {
      setError("Subject is required.");
      return;
    }
    if (!message.trim()) {
      setError("Message is required.");
      return;
    }
    if (!sendEmail && !sendNotification) {
      setError("Please select at least one delivery method (Email or Notification).");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const endpoint =
        userType === "client" ? "/api/admin/clients/notify" : "/api/admin/vendors/notify";
      const idKey = userType === "client" ? "client_ids" : "vendor_ids";

      const res = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [idKey]: notifyAll ? "all" : selectedUserIds,
          subject,
          message,
          send_email: sendEmail,
          send_notification: sendNotification,
        }),
      });

      if (res.ok) {
        setSubject("");
        setMessage("");
        setNotifyAll(true);
        setSelectedUserIds([]);
        setSendEmail(false);
        setSendNotification(true);
        onClose();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to send notifications.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const title = userType === "client" ? "Notify Clients" : "Notify Vendors";

  if (!isOpen) return null;

  return (
    <ModalShell id="notify-users-modal" onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">
            Target Audience
          </label>
          <div className="flex items-center gap-2 mt-1">
            <input
              type="checkbox"
              id="notifyAll"
              checked={notifyAll}
              onChange={(e) => {
                setNotifyAll(e.target.checked);
                if (e.target.checked) setSelectedUserIds([]);
              }}
              className="rounded border-border accent-black"
            />
            <label htmlFor="notifyAll" className="text-sm text-foreground">
              All {userType === "client" ? "Clients" : "Vendors"}
            </label>
          </div>
        </div>

        {!notifyAll && (
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto border border-border rounded-lg p-2 bg-secondary/20">
            {users.length === 0 ? (
              <p className="text-xs text-muted-foreground p-2">
                No {userType}s available to select.
              </p>
            ) : (
              users.map((u) => (
                <div key={u.id} className="flex items-center gap-2 p-1">
                  <input
                    type="checkbox"
                    id={`user-${u.id}`}
                    checked={selectedUserIds.includes(u.id)}
                    onChange={() => toggleUserSelection(u.id)}
                    className="rounded border-border accent-black"
                  />
                  <label
                    htmlFor={`user-${u.id}`}
                    className="text-sm text-foreground cursor-pointer"
                  >
                    {u.firstName} {u.lastName} ({u.email})
                  </label>
                </div>
              ))
            )}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40"
            placeholder="Notification subject..."
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-foreground">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C49A3C]/40 resize-none"
            placeholder="Write your message here..."
          />
        </div>

        <div className="flex flex-col gap-1.5 border-t border-border pt-4">
          <label className="text-sm font-semibold text-foreground">
            Delivery Methods
          </label>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sendPush"
                checked={sendNotification}
                onChange={(e) => setSendNotification(e.target.checked)}
                className="rounded border-border accent-black"
              />
              <label htmlFor="sendPush" className="text-sm text-foreground cursor-pointer">
                System Notification
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sendEmail"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="rounded border-border accent-black"
              />
              <label htmlFor="sendEmail" className="text-sm text-foreground cursor-pointer">
                Email
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-foreground border border-border rounded-full hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-background bg-linear-to-b from-[#865B15] to-[#E1C283] rounded-full hover:opacity-90 transition-opacity flex items-center justify-center min-w-[100px]"
          >
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Send"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
