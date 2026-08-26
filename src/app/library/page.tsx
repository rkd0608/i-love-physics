import type { Metadata } from "next";
import Link from "next/link";
import LibraryBoard from "@/components/library/LibraryBoard";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your library",
};

export default async function LibraryPage() {
  const user = isSupabaseConfigured() ? await getSessionUser() : null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-12 px-6 py-14 sm:py-20">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Your library
        </h1>
        {!isSupabaseConfigured() ? (
          <p className="text-lg text-muted">
            Community features need configuration.
          </p>
        ) : null}
        {isSupabaseConfigured() && !user ? (
          <p className="text-lg text-muted">
            Sign in to build your library.{" "}
            <Link
              href="/signin"
              className="focus-ring rounded-sm text-accent underline-offset-4 transition-colors hover:underline"
            >
              Go to sign in
            </Link>
          </p>
        ) : null}
      </header>
      {user ? <LibraryBoard userId={user.id} /> : null}
    </div>
  );
}
