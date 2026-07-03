import { Suspense } from "react";
import Form from "./form";

export default function Page() {
  return (
    <div className="w-full mx-auto md:mx-0">
      <h1 className="text-3xl sm:text-4xl font-semibold mb-6 sm:mb-8">
        Reset Password
      </h1>
      <Suspense fallback={<div>Loading...</div>}>
        <Form />
      </Suspense>
    </div>
  );
}
