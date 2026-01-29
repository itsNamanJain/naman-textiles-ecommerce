import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SignInForm } from "./signin-form";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
          <Skeleton className="h-[500px] w-full max-w-md rounded-2xl" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
