import type { Metadata } from "next";
import Link from "next/link";
import TeX from "@/components/math/TeX";
import { EQUATION_INDEX } from "@/lib/equations";
import { getTopic } from "@/lib/topics";

export const metadata: Metadata = {
  title: "Equation Explorer",
  description: "Every equation in the collection, decoded in plain language.",
};

export default function EquationsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-20 pt-12">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          Reference
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Equation Explorer
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Every equation that powers these simulations, grouped by topic and
          decoded in plain language. Open any topic to watch these symbols move.
        </p>
      </header>

      <div className="mt-12 flex flex-col gap-10">
        {EQUATION_INDEX.map((group) => {
          const topic = getTopic(group.slug);
          return (
            <section
              key={group.slug}
              className="rounded-2xl border border-line bg-panel p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-3 text-xl font-semibold tracking-tight">
                  <span
                    aria-hidden="true"
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: group.accent }}
                  />
                  {group.title}
                </h2>
                {topic ? (
                  <Link
                    href={`/topics/${topic.slug}`}
                    className="focus-ring rounded-sm text-sm text-muted transition-colors hover:text-accent"
                  >
                    Run the simulation →
                  </Link>
                ) : null}
              </div>
              <ul className="mt-6 flex flex-col gap-6">
                {group.entries.map((entry) => (
                  <li
                    key={entry.tex}
                    className="grid gap-3 border-t border-line pt-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:gap-8"
                  >
                    <div className="overflow-x-auto">
                      <TeX tex={entry.tex} block />
                    </div>
                    <p className="text-sm leading-relaxed text-muted">
                      {entry.note}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
