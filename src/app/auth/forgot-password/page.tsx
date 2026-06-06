import Image from "next/image";

import Form from "./form";

export default function Page() {
  return (
    <div className="w-full mx-auto md:mx-0">
      <h1 className="text-3xl sm:text-4xl font-semibold mb-6 sm:mb-8">
        Forgot Your Password?
      </h1>
      <p className="text-sm text-muted-foreground mb-6 sm:mb-8">
        We will send the OTP code to your phone number for <br /> security in
        forgetting your password
      </p>
      <Form />
    </div>
  );
}
