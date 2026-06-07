
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
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "News Feed", href: "/feed", icon: Rss, badge: 4 },
    ],
  },
  {
    label: "The Project",
    items: [
      { label: "Milestones", href: "/milestones", icon: Milestone },
      { label: "Budget", href: "/budget", icon: Wallet },
      { label: "Decisions", href: "/decisions", icon: CheckCircle },
      { label: "Risks", href: "/risks", icon: Triangle },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Calendar", href: "/calendar", icon: Calendar },
      { label: "Documents", href: "/documents", icon: FileText },
      { label: "Team", href: "/team", icon: Users },
    ],
  },
];