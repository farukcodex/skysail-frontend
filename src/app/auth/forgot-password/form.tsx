"use client";

import { useState, FormEvent } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function Form() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8007";

  const handleRequestOtp = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to request reset.");
      
      toast.success(data.message || "OTP sent successfully!");
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-5 w-full" onSubmit={handleRequestOtp}>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground mb-4">
          Enter your email address and we'll send you a verification code to reset your password.
        </p>
        <Label htmlFor="email" className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="h-12 rounded-full bg-muted/50 border-0 px-5 text-sm focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      </div>

      <div className="pt-2 flex items-center justify-between">
        <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Back to Login
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-6 w-fit bg-foreground text-background rounded-full pl-6 pr-1.5 py-1.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isLoading ? "Please wait..." : "Send OTP"}
          <span className="flex items-center justify-center bg-linear-to-b from-[#865B15] to-[#E1C283] rounded-full w-9 h-9">
            {isLoading ? <Loader2 size={16} className="text-white animate-spin" /> : <ArrowRight size={16} className="text-white" />}
          </span>
        </button>
      </div>
    </form>
  );
}
