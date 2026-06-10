const notifications = [
  {
    id: 1,
    title: "Upload approved — Framing inspection certificate",
    subtitle: "Approved by Remy · Shared with client · May 12",
  },
  {
    id: 2,
    title: "New message from admin",
    subtitle: 'Remy: "James, lumber delivery resolved?..." · May 21',
  },
  {
    id: 3,
    title: "Upload pending — Week 8 framing progress report",
    subtitle: "Submitted 2 hours ago · Awaiting Remy approval",
  },
  {
    id: 4,
    title: "Milestone confirmed — Foundation complete",
    subtitle: "Admin confirmed your submission · Apr 28",
  },
];

export default function VendorNotificationsPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Notification Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            All notifications
          </p>
        </div>

        {/* Today group */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Today
          </p>
          {notifications.map((n) => (
            <div
              key={n.id}
              className="rounded-2xl border border-border bg-background px-6 py-5"
            >
              <p className="text-base font-bold">{n.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{n.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
