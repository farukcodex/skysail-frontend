"use client";

import Form from "./form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  return (
    <div className="w-full mx-auto md:mx-0">
      <h1 className="text-3xl sm:text-4xl font-semibold mb-6 sm:mb-8 text-center">
        Email Sent!
      </h1>
      <p className="text-sm text-muted-foreground mb-6 sm:mb-8 text-center">
        A magic code to verify your request was sent to{" "}
        <span className="font-medium bg-linear-to-b from-[#865B15] to-[#E1C283] bg-clip-text text-transparent">
          {email}
        </span>
      </p>
      <Form email={email} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
