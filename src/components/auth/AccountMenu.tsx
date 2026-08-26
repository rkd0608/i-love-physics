"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type AccountMenuUser = { id: string; email?: string };

export default function AccountMenu({
  user,
  configured = true,
}: {
  user: AccountMenuUser | null;
  configured?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!configured) return null;

  if (!user) {
    return (
      <Link
        href="/signin"
        className="focus-ring rounded-full border border-line bg-panel px-4 py-1.5 text-sm font-medium text-fg transition-colors hover:border-accent/60"
      >
        Sign in
      </Link>
    );
  }

  const initial = (user.email?.[0] ?? user.id[0] ?? "?").toUpperCase();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-accent-2 text-sm font-semibold text-white"
      >
        {initial}
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-line bg-panel p-2 shadow-lg"
        >
          <p className="truncate px-3 pb-2 pt-1.5 text-xs text-muted">
            {user.email ?? user.id}
          </p>
          <Link
            role="menuitem"
            href="/library"
            onClick={() => setOpen(false)}
            className="focus-ring block rounded-lg px-3 py-2 text-sm text-fg transition-colors hover:bg-bg"
          >
            Library
          </Link>
          <Link
            role="menuitem"
            href="/collections"
            onClick={() => setOpen(false)}
            className="focus-ring block rounded-lg px-3 py-2 text-sm text-fg transition-colors hover:bg-bg"
          >
            Collections
          </Link>
          <form
            action="/auth/signout"
            method="post"
            className="mt-2 border-t border-line pt-2"
          >
            <button
              role="menuitem"
              type="submit"
              className="focus-ring block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-400 transition-colors hover:bg-bg"
            >
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
