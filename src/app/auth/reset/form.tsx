"use client";

import { useState } from "react";

import { ArrowRight, Eye, EyeOff } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function Form() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordB, setShowPasswordB] = useState(false);
  const navig = useRouter();
  return (
    <form
      className="flex flex-col gap-5 w-full"
      onSubmit={(e) => {
        e.preventDefault();
        navig.push("/auth/login");
      }}
    >
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="text-xs font-semibold tracking-widest uppercase text-muted-foreground"
        >
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            className="h-12 rounded-full bg-muted/50 border-0 px-5 pr-12 text-sm focus-visible:ring-2 focus-visible:ring-ring/30"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="password"
          className="text-xs font-semibold tracking-widest uppercase text-muted-foreground"
        >
          Re-type Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPasswordB ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            className="h-12 rounded-full bg-muted/50 border-0 px-5 pr-12 text-sm focus-visible:ring-2 focus-visible:ring-ring/30"
          />
          <button
            type="button"
            onClick={() => setShowPasswordB((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none"
            aria-label={showPasswordB ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPasswordB ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Placeholder — replace with reusable SignInButton component */}
      <div className="pt-1">
        <button
          type="submit"
          className="flex items-center gap-12 w-fit bg-foreground text-background rounded-full pl-6 pr-1.5 py-1.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Save Changes
          <span className="flex items-center justify-center bg-linear-to-b from-[#865B15] to-[#E1C283] rounded-full w-9 h-9">
            <ArrowRight size={16} className="text-white" />
          </span>
        </button>
      </div>
    </form>
  );
}
