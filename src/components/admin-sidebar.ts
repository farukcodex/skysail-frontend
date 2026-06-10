import {
  LayoutDashboard,
  FolderKanban,
  Users2,
  Store,
  Upload,
  Rss,
  FileText,
  Milestone,
  Wallet,
  CheckCircle,
  Triangle,
  Calendar,
  Users,
  Settings,
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

export const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "All projects", href: "/admin/projects", icon: FolderKanban },
      { label: "Client management", href: "/admin/clients", icon: Users2 },
      { label: "Vendor management", href: "/admin/vendors", icon: Store },
      { label: "Vendor Upload", href: "/admin/vendor-upload", icon: Upload },
      { label: "Post updates", href: "/admin/updates", icon: Rss },
      { label: "Documents", href: "/admin/documents", icon: FileText },
      { label: "Milestones", href: "/admin/milestones", icon: Milestone },
      { label: "Budget", href: "/admin/budget", icon: Wallet },
      { label: "Decisions", href: "/admin/decisions", icon: CheckCircle },
      { label: "Risk", href: "/admin/risks", icon: Triangle },
      { label: "Calendar", href: "/admin/calendar", icon: Calendar },
      { label: "Team members", href: "/admin/team", icon: Users },
      { label: "Setting", href: "/admin/settings", icon: Settings },
    ],
  },
];
