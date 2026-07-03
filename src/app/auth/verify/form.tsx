"use client";

import { ArrowRight, Loader2 } from "lucide-react";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useEffect, useState, FormEvent } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export default function Form({ email }: { email: string }) {
  const [timer, setTimer] = useState(59);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navig = useRouter();
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      const res = await apiFetch(`/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend OTP.");
      toast.success("OTP sent successfully!");
      setTimer(59);
    } catch (err: any) {
      toast.error(err.message || "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await apiFetch(`/api/auth/forgot-password/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to verify OTP.");
      
      toast.success(data.message || "OTP Verified Successfully!");
      navig.push(`/auth/reset?email=${encodeURIComponent(email)}&token=${data.data.password_reset_token}`);
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-5 w-full"
      onSubmit={handleVerify}
    >
      <div className="flex flex-col gap-2 items-center">
        <InputOTP maxLength={6} className="gap-2" value={otp} onChange={setOtp} disabled={isLoading}>
          <InputOTPGroup>
            <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
            <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
            <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
            <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
            <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
          </InputOTPGroup>
        </InputOTP>
      </div>
      {timer === 0 ? (
        <p className="text-sm text-center text-muted-foreground">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="font-semibold text-foreground hover:underline disabled:opacity-50"
          >
            {isResending ? "Sending..." : "Resend it"}
          </button>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground text-center">
          Send code again{" "}
          <span className="font-medium text-foreground">
            00:{timer.toString().padStart(2, "0")}
          </span>
        </p>
      )}
      
      <div className="pt-2 flex flex-col items-center gap-6 w-full">
        <button
          type="submit"
          disabled={isLoading || otp.length < 6}
          className="flex items-center gap-12 w-fit bg-foreground text-background rounded-full pl-6 pr-1.5 py-1.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isLoading ? "Verifying..." : "Verify"}
          <span className="flex items-center justify-center bg-linear-to-b from-[#865B15] to-[#E1C283] rounded-full w-9 h-9">
            {isLoading ? <Loader2 size={16} className="text-white animate-spin" /> : <ArrowRight size={16} className="text-white" />}
          </span>
        </button>
        <Link href="/auth/forgot-password" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Back to previous
        </Link>
      </div>
    </form>
  );
}
