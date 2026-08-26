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
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-5 w-5 text-accent"
          >
            <path d="M12 21.2C7.2 16.9 2.8 12.6 2.8 8.4C2.8 5.4 5.2 3.2 8 3.2C9.8 3.2 11.3 4.1 12 5.6C12.7 4.1 14.2 3.2 16 3.2C18.8 3.2 21.2 5.4 21.2 8.4C21.2 12.6 16.8 16.9 12 21.2Z" />
            <circle cx="18.7" cy="4" r="1.6" fill="currentColor" stroke="none" />
            <circle cx="12" cy="6.8" r="1" fill="currentColor" stroke="none" />
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
