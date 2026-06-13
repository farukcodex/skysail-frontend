import { ArrowRight } from "lucide-react";
import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {
  return (
    <main className="bg-foreground min-h-dvh w-dvw p-4 sm:p-6 lg:p-8">
      <div className="bg-foreground h-full min-h-[calc(100dvh-2rem)] gap-6 sm:min-h-[calc(100dvh-3rem)] lg:min-h-[calc(100dvh-4rem)] w-full rounded-xl overflow-hidden grid gap-0 grid-cols-1 md:grid-cols-5">
        {/* Left panel */}
        <div className="relative hidden md:block md:col-span-2 h-full min-h-75">
          <Image
            src="/image/auth.webp"
            alt="Auth_sidecover"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute bottom-8 left-6 right-6">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border flex flex-col items-center border-white/20 p-6 text-white">
              <Image
                src="/image/logo.svg"
                alt="logo"
                width={110}
                height={42}
                className="object-contain mb-4 invert"
              />
              <p className="text-lg font-semibold leading-snug mb-3 w-full text-center">
                Managing the evolution of your residential estate.
              </p>
              <p className="text-xs tracking-widest uppercase text-white/70 text-center">
                Secure access to your comprehensive project management and
                estate oversight system
              </p>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <section className="col-span-1 md:col-span-3 bg-background flex flex-col min-h-screen md:min-h-0">
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-5 sm:px-10 sm:py-6 border-b border-border">
            <div className="flex flex-col gap-0.5">
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-medium">
                Private Portal
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Welcome, <span className="text-[#C49A3C]">Bob</span>
              </h1>
              <div className="mt-1.5 h-0.5 w-10 bg-[#C49A3C] rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-tight">
                  Bob Henderson
                </p>
                <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
                  Client
                </p>
              </div>
              <Avatar size="lg" className="size-11">
                <AvatarImage
                  src="https://placehold.co/44x44/1a1a1a/ffffff?text=BH"
                  alt="Bob Henderson"
                />
                <AvatarFallback>BH</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 py-8 sm:px-10 sm:py-10 flex flex-col gap-6">
            {/* Project card */}
            <div className="rounded-2xl border border-border overflow-hidden shadow-sm">
              {/* Project image */}
              <div className="relative w-full h-56 sm:h-72 lg:h-80">
                <Image
                  src="https://placehold.co/900x400/1c2b3a/ffffff?text=The+Henderson+Residence"
                  alt="The Henderson Residence"
                  fill
                  className="object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] tracking-widest uppercase font-semibold bg-linear-to-b from-[#C49A3C] to-[#A17A2C] text-white px-3 py-1.5 rounded-full">
                    Active Project
                  </span>
                </div>
                {/* Project name */}
                <div className="absolute bottom-5 left-5">
                  <h2 className="text-white text-2xl sm:text-3xl font-semibold leading-tight">
                    The Henderson Residence
                  </h2>
                </div>
              </div>

              {/* Project status row */}
              <div className="px-5 py-5 sm:px-6 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-background">
                <div className="flex flex-col gap-2 flex-1">
                  <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-medium">
                    Current Status
                  </p>
                  <p className="text-lg sm:text-xl font-semibold leading-tight">
                    Phase 3: Framing
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      Overall Progress
                    </span>
                    <Progress value={42} className="flex-1 h-1.5 " />
                    <span className="text-xs font-medium tabular-nums">
                      42%
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0 flex justify-end">
                <Button
                  type="button"
                  className="flex items-center gap-3 h-10 pr-4! bg-foreground text-background rounded-full pl-5 py-1.5 text-xs font-semibold tracking-widest uppercase hover:opacity-90 active:scale-[0.98] transition-all w-fit whitespace-nowrap"
                  asChild
                >
                  <Link href="/">
                    Go to Dashboard
                    <ArrowRight size={14} />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 sm:px-10 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground">
              © 2026 Skysail Coastal Estates
            </p>
            <div className="flex items-center gap-4">
              <a
                href="/privacy"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
              >
                Terms and Condition
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
