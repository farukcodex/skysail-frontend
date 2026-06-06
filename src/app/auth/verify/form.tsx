"use client";

import { ArrowRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useEffect, useState } from "react";

export default function Form() {
  const [timer, setTimer] = useState(59);
  const navig = useRouter();
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);
  return (
    <form
      className="flex flex-col gap-5 w-full"
      onSubmit={(e) => {
        e.preventDefault();
        navig.push("/auth/reset");
      }}
    >
      <div className="flex flex-col gap-2 items-center">
        <InputOTP maxLength={6} className="gap-2">
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
      <p className="text-sm text-muted-foreground text-center">
        Send code again{" "}
        <span className="font-medium text-foreground">
          00:{timer.toString().padStart(2, "0")}
        </span>
      </p>
      {/* Placeholder — replace with reusable SignInButton component */}
      <div className="pt-1 w-full flex items-center justify-center">
        <button
          type="submit"
          className="flex items-center gap-12 w-fit bg-foreground text-background rounded-full pl-6 pr-1.5 py-1.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Verify
          <span className="flex items-center justify-center bg-linear-to-b from-[#865B15] to-[#E1C283] rounded-full w-9 h-9">
            <ArrowRight size={16} className="text-white" />
          </span>
        </button>
      </div>
    </form>
  );
}
