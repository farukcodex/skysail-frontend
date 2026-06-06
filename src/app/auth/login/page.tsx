import Image from "next/image";

import Form from "./form";

export default function Page() {
  return (
    <div className="w-full mx-auto md:mx-0">
      <h1 className="text-3xl sm:text-4xl font-semibold mb-6 sm:mb-8">
        Welcome , login to <br /> your account
      </h1>
      <Form />
    </div>
  );
}
