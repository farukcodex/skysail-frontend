import { ModalShell } from "./ModalShell";
import { format, parseISO } from "date-fns";
import { CheckCircle2 } from "lucide-react";

export type ViewNotificationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  notification: any;
  onMarkAsRead?: (id: string) => void;
};

export function ViewNotificationModal({
  isOpen,
  onClose,
  notification,
  onMarkAsRead,
}: ViewNotificationModalProps) {
  if (!isOpen || !notification) return null;

  const isUnread = !notification.read_at;
  const type = notification.data?.type || "general";

  return (
    <ModalShell id="view-notification-modal" onClose={onClose} title="Notification Details">
      <div className="flex flex-col gap-6 mt-4">
        {/* Header */}
        <div className="flex flex-col gap-2 border-b border-border pb-4">
          <div className="flex items-center justify-between">
            {notification.data?.badge && (
              <span className="text-[10px] font-bold tracking-widest uppercase border px-2 py-0.5 rounded text-[#C49A3C] border-[#C49A3C]">
                {notification.data.badge}
              </span>
            )}
            <span className="text-xs text-muted-foreground ml-auto">
              {format(parseISO(notification.created_at), "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
          <h2 className="text-lg font-bold text-foreground leading-tight">
            {notification.data?.title}
          </h2>
        </div>

        {/* Body */}
        <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed pr-2">
          {notification.data?.body || notification.data?.message}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center border-t border-border pt-4">
          <div>
            {isUnread && onMarkAsRead && (
              <button
                onClick={() => {
                  onMarkAsRead(notification.id);
                }}
                className="flex items-center gap-2 text-sm text-foreground font-medium hover:opacity-70 transition-opacity"
              >
                <CheckCircle2 size={16} />
                Mark as read
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-foreground border border-border rounded-full hover:bg-secondary transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
