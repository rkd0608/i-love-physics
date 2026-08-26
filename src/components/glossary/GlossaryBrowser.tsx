"use client";

import { useMemo, useState } from "react";
import TeX from "@/components/math/TeX";
import type { GlossaryTerm } from "@/lib/glossary";
import { DOMAINS, domainLabel, getTopic } from "@/lib/topics";

export default function GlossaryBrowser({
  terms,
}: {
  terms: readonly GlossaryTerm[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === "") return terms;
    return terms.filter((entry) =>
      `${entry.term} ${entry.definition}`.toLowerCase().includes(q)
    );
  }, [terms, query]);

  const grouped = useMemo(() => {
    return DOMAINS.map((domain) => ({
      domain,
      items: filtered.filter((term) => term.domain === domain.id),
    })).filter((group) => group.items.length > 0);
  }, [filtered]);

  return (
    <div className="mt-10">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search the glossary…"
        aria-label="Search glossary terms"
        className="focus-ring w-full rounded-xl border border-line bg-panel px-4 py-2.5 text-fg outline-none placeholder:text-muted/70 sm:max-w-md"
      />

      {grouped.length > 0 ? (
        <div className="mt-12 flex flex-col gap-12">
          {grouped.map(({ domain, items }) => (
            <section key={domain.id} aria-labelledby={`glossary-${domain.id}`}>
              <div className="flex items-baseline gap-3">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: domain.accent }}
                />
                <h2
                  id={`glossary-${domain.id}`}
                  className="text-lg font-semibold tracking-tight"
                >
                  {domainLabel(domain.id)}
                </h2>
                <span className="font-mono text-xs text-muted">
                  {items.length}
                </span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((entry) => (
                  <article
                    key={entry.term}
                    className="flex flex-col rounded-2xl border border-line bg-panel p-5"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h3 className="text-base font-semibold tracking-tight">
                        {entry.term}
                      </h3>
                      {entry.math ? (
                        <TeX tex={entry.math} className="overflow-x-auto" />
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {entry.definition}
                    </p>
                    {entry.seeAlso && entry.seeAlso.length > 0 ? (
                      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                          See also
                        </span>
                        {entry.seeAlso.map((slug) => (
                          <a
                            key={slug}
                            href={`/topics/${slug}`}
                            className="focus-ring rounded-full border border-line px-2 py-0.5 text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent"
                          >
                            {getTopic(slug)?.title ?? slug}
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-line px-6 py-16 text-center">
          <p className="text-muted">No term matches “{query}”.</p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="focus-ring mt-4 rounded-full border border-accent/40 px-4 py-2 text-sm text-accent transition-colors hover:bg-accent/10"
          >
            Clear search
          </button>
        </div>
      )}

      <p className="mt-12 border-t border-line pt-5 text-center font-mono text-xs text-muted">
        {terms.length} terms · updated Wave 4
      </p>
    </div>
  );
}
