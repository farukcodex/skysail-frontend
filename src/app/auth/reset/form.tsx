"use client";

import { useState, FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export default function Form() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordB, setShowPasswordB] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navig = useRouter();

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await apiFetch(`/api/auth/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password_reset_token: token,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password.");
      
      toast.success(data.message || "Password reset successful!");
      setTimeout(() => navig.push("/auth/login"), 2000);
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-5 w-full"
      onSubmit={handleReset}
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
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
            id="password_confirmation"
            type={showPasswordB ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            disabled={isLoading}
            required
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

      <div className="pt-1">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-12 w-fit bg-foreground text-background rounded-full pl-6 pr-1.5 py-1.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Changes"}
          <span className="flex items-center justify-center bg-linear-to-b from-[#865B15] to-[#E1C283] rounded-full w-9 h-9">
            {isLoading ? <Loader2 size={16} className="text-white animate-spin" /> : <ArrowRight size={16} className="text-white" />}
          </span>
        </button>
      </div>
    </form>
  );
}
