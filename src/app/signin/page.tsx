import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/auth/AuthForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[]; message?: string | string[] }>;
}) {
  const { error, message } = await searchParams;
  const authFailed = error === "auth";
  const linkExpired = error === "expired";
  const bannerMessage =
    typeof message === "string" && message.length > 0 && message.length <= 300
      ? message
      : null;

  return (
    <main className="mx-auto w-full max-w-md px-6 py-20">
      <div className="rounded-2xl border border-line bg-panel p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Sign in to keep a library of the topics you are exploring.
        </p>
        {isSupabaseConfigured() ? (
          <div className="mt-6 space-y-4">
            {linkExpired ? (
              <div role="alert" className="rounded-xl border border-line bg-bg p-4">
                <h2 className="text-base font-semibold tracking-tight">
                  That link expired
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {bannerMessage ??
                    "Confirmation links are single-use and expire quickly. Send yourself a fresh one, or just sign in below."}
                </p>
                <Link
                  href="/signup"
                  className="focus-ring mt-3 inline-flex items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-medium text-[#04121a] transition-opacity hover:opacity-90"
                >
                  Send me a fresh link
                </Link>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  Already confirmed your email? Use the sign-in form below.
                </p>
              </div>
            ) : null}
            {authFailed ? (
              <p role="alert" className="text-sm text-rose-400">
                That sign-in link did not work. Please try again.
              </p>
            ) : null}
            <AuthForm mode="signin" />
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
          New here?{" "}
          <Link
            href="/signup"
            className="focus-ring rounded-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            Create an account
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
