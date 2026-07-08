import {
  LayoutDashboard,
  Rss,
  Milestone,
  Wallet,
  CheckCircle,
  Triangle,
  Calendar,
  FileText,
  Users,
  MessageSquare,
} from "lucide-react";
type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
};
type NavSection = {
  label?: string;
  items: NavItem[];
};
export const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/client", icon: LayoutDashboard },
      // { label: "News Feed", href: "/client/feed", icon: Rss, badge: 4 },
      { label: "News Feed", href: "/client/feed", icon: Rss },
    ],
  },
  {
    label: "The Project",
    items: [
      { label: "Milestones", href: "/client/milestones", icon: Milestone },
      { label: "Budget", href: "/client/budget", icon: Wallet },
      { label: "Decisions", href: "/client/decisions", icon: CheckCircle },
      { label: "Risks", href: "/client/risks", icon: Triangle },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Calendar", href: "/client/calendar", icon: Calendar },
      { label: "Documents", href: "/client/documents", icon: FileText },
      { label: "Messages", href: "/client/messages", icon: MessageSquare },
      { label: "Team", href: "/client/team", icon: Users },
    ],
  },
];
