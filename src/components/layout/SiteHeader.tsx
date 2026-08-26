import Link from "next/link";
import NavLinks from "./NavLinks";
import ThemeToggle from "./ThemeToggle";
import AccountMenu from "@/components/auth/AccountMenu";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/supabase/server";

export default async function SiteHeader() {
  const configured = isSupabaseConfigured();
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-6 px-4">
        <Link
          href="/"
          className="focus-ring flex items-center gap-2.5 rounded-sm text-fg"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
            className="h-6 w-6 text-accent"
          >
            <ellipse cx="12" cy="12" rx="9.5" ry="3.75" />
            <ellipse
              cx="12"
              cy="12"
              rx="9.5"
              ry="3.75"
              transform="rotate(60 12 12)"
            />
            <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
          </svg>
          <span className="text-lg font-semibold tracking-tight">i love physics</span>
        </Link>
        <NavLinks />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AccountMenu user={user} configured={configured} />
        </div>
      </div>
    </header>
  );
}
