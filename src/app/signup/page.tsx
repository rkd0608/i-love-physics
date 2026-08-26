import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Sign up",
};

export default function SignUpPage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-20">
      <div className="rounded-2xl border border-line bg-panel p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Save topics, revisit simulations, and build collections of your own.
        </p>
        {isSupabaseConfigured() ? (
          <div className="mt-6">
            <AuthForm mode="signup" />
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-line bg-bg p-4">
            <p className="text-sm leading-relaxed text-fg/90">
              Community features need configuration — add Supabase keys to
              enable accounts.
            </p>
          </div>
        )}
        <p className="mt-6 text-sm text-muted">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="focus-ring rounded-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
      <p className="mt-8 text-center text-sm text-muted">
        <Link href="/" className="focus-ring rounded-sm hover:text-fg">
          ← Back home
        </Link>
      </p>
    </main>
  );
}
