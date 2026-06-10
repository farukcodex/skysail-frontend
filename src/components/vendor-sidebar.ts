import {
  LayoutDashboard,
  FolderKanban,
  Upload,
  Milestone,
  CheckCircle,
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

export const VENDOR_NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard },
      { label: "All projects", href: "/vendor/projects", icon: FolderKanban },
      { label: "Upload documents", href: "/vendor/documents", icon: Upload },
      { label: "Milestones", href: "/vendor/milestones", icon: Milestone },
      { label: "Decisions", href: "/vendor/decisions", icon: CheckCircle },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      {
        label: "Messages — admin only",
        href: "/vendor/messages",
        icon: MessageSquare,
      },
    ],
  },
];
