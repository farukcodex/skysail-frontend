"use client";

import { ArrowRight, Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function Form() {
  const navig = useRouter();
  return (
    <form
      className="flex flex-col gap-5 w-full"
      onSubmit={(e) => {
        e.preventDefault();
        navig.push("/auth/verify");
      }}
    >
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-xs font-semibold tracking-widest uppercase text-muted-foreground"
        >
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          className="h-12 rounded-full bg-muted/50 border-0 px-5 text-sm focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      </div>
      {/* Placeholder — replace with reusable SignInButton component */}
      <div className="pt-1">
        <button
          type="submit"
          className="flex items-center gap-12 w-fit bg-foreground text-background rounded-full pl-6 pr-1.5 py-1.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Send Code
          <span className="flex items-center justify-center bg-linear-to-b from-[#865B15] to-[#E1C283] rounded-full w-9 h-9">
            <ArrowRight size={16} className="text-white" />
          </span>
        </button>
      </div>
    </form>
  );
}
