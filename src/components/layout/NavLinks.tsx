"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/explore", label: "Explore" },
  { href: "/equations", label: "Equations" },
  { href: "/glossary", label: "Glossary" },
  { href: "/about", label: "About" },
];

export default function NavLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClass = (active: boolean) =>
    `focus-ring rounded-sm text-sm transition-colors ${
      active
        ? "text-accent underline underline-offset-[7px] decoration-2"
        : "text-muted hover:text-fg"
    }`;

  return (
    <>
      <nav aria-label="Primary" className="hidden items-center gap-6 sm:flex">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={
              pathname === item.href || pathname.startsWith(`${item.href}/`)
                ? "page"
                : undefined
            }
            className={linkClass(
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <button
        type="button"
        className="focus-ring -mr-1 rounded-lg p-2 text-muted transition-colors hover:text-fg sm:hidden"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(!open)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="h-5 w-5">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full border-b border-line bg-bg/95 backdrop-blur sm:hidden">
          <nav aria-label="Primary mobile" className="mx-auto flex max-w-6xl flex-col px-4 py-3">
            {NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`focus-ring rounded-lg px-3 py-2.5 text-base transition-colors ${
                    active ? "bg-accent/10 text-accent" : "text-muted hover:bg-fg/5 hover:text-fg"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
