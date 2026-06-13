import Image from "next/image";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-foreground min-h-dvh w-dvw p-4 sm:p-6 lg:p-8">
      <div className="bg-foreground h-full min-h-[calc(100dvh-2rem)] sm:min-h-[calc(100dvh-3rem)] lg:min-h-[calc(100dvh-4rem)] w-full rounded-xl overflow-hidden grid gap-6 grid-cols-1 md:grid-cols-5">
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
        <section className="col-span-1 md:col-span-3 px-6 py-10 sm:px-10 sm:py-12 lg:px-16 lg:py-14 flex flex-col justify-center bg-background relative">
          <Image
            src="/image/logo.svg"
            alt="logo"
            width={92}
            height={35}
            className="object-contain absolute top-6 right-6 sm:top-8 sm:right-8"
          />
          {children}
        </section>
      </div>
    </main>
  );
}
