import Image from "next/image";

import Form from "./form";

export default function Page() {
  return (
    <div className="w-full mx-auto md:mx-0">
      <h1 className="text-3xl sm:text-4xl font-semibold mb-6 sm:mb-8 text-center">
        Email Sent!
      </h1>
      <p className="text-sm text-muted-foreground mb-6 sm:mb-8 text-center">
        We A magic code to sign in was sent to{" "}
        <span className="font-medium bg-linear-to-b from-[#865B15] to-[#E1C283] bg-clip-text text-transparent">
          tan@gmail.com
        </span>
      </p>
      <Form />
    </div>
  );
}
