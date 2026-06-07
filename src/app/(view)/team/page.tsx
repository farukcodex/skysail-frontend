import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  seed: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const TEAM: TeamMember[] = [
  {
    id: 1,
    name: "Remy DiAngelo",
    role: "Owner's Representative",
    email: "remy@remyco.com",
    seed: "RemyDiAngelo",
  },
  {
    id: 2,
    name: "James Sullivan",
    role: "Lead Builder",
    email: "james@sullivanbuilds.com",
    seed: "JamesSullivan",
  },
  {
    id: 3,
    name: "Anna Keller",
    role: "Architect",
    email: "anna@kellerarch.com",
    seed: "AnnaKeller",
  },
  {
    id: 4,
    name: "Marco Torres",
    role: "Interior Designer",
    email: "marco@torresdesign.com",
    seed: "MarcoTorres",
  },
  {
    id: 5,
    name: "Priya Lam",
    role: "Structural Engineer",
    email: "priya@lameng.com",
    seed: "PriyaLam",
  },
  {
    id: 6,
    name: "Carlos Reyes",
    role: "MEP Consultant",
    email: "carlos@reyesmep.com",
    seed: "CarlosReyes",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function MemberCard({ member }: { member: TeamMember }) {
  const avatarUrl = `https://api.dicebear.com/9.x/avataaars/png?seed=${member.seed}&size=80&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center gap-4 py-4">
        <div className="size-12 rounded-full overflow-hidden shrink-0 bg-muted border border-border">
          <Image
            src={avatarUrl}
            alt={member.name}
            width={48}
            height={48}
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{member.name}</p>
          <p className="text-xs text-muted-foreground truncate">{member.role}</p>
          <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
            {member.email}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      <div className="flex-1 px-6 py-8 lg:px-8 flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your project team</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Everyone involved in your build
          </p>
        </div>

        {/* Team grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEAM.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    </div>
  );
}
