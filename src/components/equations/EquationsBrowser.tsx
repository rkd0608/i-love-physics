"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import EquationAnatomy from "@/components/math/EquationAnatomy";
import TeX from "@/components/math/TeX";
import { ANATOMY } from "@/lib/anatomy";
import type { EquationGroup } from "@/lib/equations";
import type { Domain } from "@/lib/topics";
import { DOMAINS, domainLabel, getTopic } from "@/lib/topics";

type DomainFilter = Domain | "all";

const matchGroups = (
  candidates: readonly EquationGroup[],
  rawQuery: string,
  domain: DomainFilter,
): readonly EquationGroup[] => {
  const q = rawQuery.trim().toLowerCase();
  return candidates
    .filter(
      (group) => domain === "all" || getTopic(group.slug)?.domain === domain,
    )
    .flatMap((group) => {
      if (q === "") return [group];
      if (group.title.toLowerCase().includes(q)) return [group];
      const matched = group.entries.filter(
        (entry) =>
          entry.tex.toLowerCase().includes(q) ||
          entry.note.toLowerCase().includes(q),
      );
      return matched.length > 0 ? [{ ...group, entries: matched }] : [];
    });
};

export default function EquationsBrowser({
  groups,
}: {
  groups: readonly EquationGroup[];
}) {
  const [query, setQuery] = useState("");
  const [activeDomain, setActiveDomain] = useState<DomainFilter>("all");
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const [dissecting, setDissecting] = useState<ReadonlySet<string>>(new Set());

  const filtered = useMemo(
    () => matchGroups(groups, query, activeDomain),
    [groups, query, activeDomain],
  );

  const handleQuery = (nextQuery: string): void => {
    setQuery(nextQuery);
    if (nextQuery.trim() === "") return;
    const first = matchGroups(groups, nextQuery, activeDomain)[0];
    if (!first) return;
    setExpanded((prev) => {
      if (prev.has(first.slug)) return prev;
      const next = new Set(prev);
      next.add(first.slug);
      return next;
    });
  };

  const grouped = useMemo(() => {
    return DOMAINS.map((domain) => ({
      domain,
      items: filtered.filter(
        (group) => getTopic(group.slug)?.domain === domain.id,
      ),
    })).filter((section) => section.items.length > 0);
  }, [filtered]);

  const toggle = (slug: string): void => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const toggleDissect = (slug: string, index: number): void => {
    const key = `${slug}:${index}`;
    setDissecting((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const expandAll = (): void => {
    setExpanded(new Set(filtered.map((group) => group.slug)));
  };

  const collapseAll = (): void => {
    setExpanded(new Set());
  };

  const reset = (): void => {
    setQuery("");
    setActiveDomain("all");
  };

  const chip = (active: boolean): string =>
    `rounded-full border px-3 py-1 text-xs transition-colors ${
      active
        ? "border-accent/40 bg-accent/10 text-accent"
        : "border-line text-muted hover:border-accent/40 hover:text-fg"
    }`;

  return (
    <div className="mt-10">
      <input
        type="search"
        value={query}
        onChange={(e) => handleQuery(e.target.value)}
        placeholder="Search equations…"
        aria-label="Search equations"
        className="focus-ring w-full rounded-xl border border-line bg-panel px-4 py-2.5 text-fg outline-none placeholder:text-muted/70 sm:max-w-md"
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter by domain"
        >
          {(["all", ...DOMAINS] as const).map((option) => (
            <button
              key={option === "all" ? "all" : option.id}
              type="button"
              aria-pressed={
                option === "all"
                  ? activeDomain === "all"
                  : activeDomain === option.id
              }
              onClick={() =>
                setActiveDomain(option === "all" ? "all" : option.id)
              }
              className={chip(
                option === "all"
                  ? activeDomain === "all"
                  : activeDomain === option.id,
              )}
            >
              {option === "all" ? "All domains" : option.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={expandAll}
            className="focus-ring rounded-sm text-sm text-muted transition-colors hover:text-accent"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="focus-ring rounded-sm text-sm text-muted transition-colors hover:text-accent"
          >
            Collapse all
          </button>
        </div>
      </div>

      {grouped.length > 0 ? (
        <div className="mt-12 flex flex-col gap-12">
          {grouped.map(({ domain, items }) => (
            <section key={domain.id} aria-labelledby={`equations-${domain.id}`}>
              <div className="flex items-baseline gap-3">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: domain.accent }}
                />
                <h2
                  id={`equations-${domain.id}`}
                  className="text-lg font-semibold tracking-tight"
                >
                  {domainLabel(domain.id)}
                </h2>
                <span className="font-mono text-xs text-muted">
                  {items.length}
                </span>
              </div>
              <div className="mt-5 flex flex-col gap-4">
                {items.map((group) => {
                  const open = expanded.has(group.slug);
                  const topic = getTopic(group.slug);
                  return (
                    <article
                      key={group.slug}
                      className="overflow-hidden rounded-2xl border border-l-2 border-line bg-panel"
                      style={{ borderLeftColor: group.accent }}
                    >
                      <button
                        type="button"
                        onClick={() => toggle(group.slug)}
                        aria-expanded={open}
                        aria-controls={`equations-${group.slug}-panel`}
                        className="focus-ring flex w-full items-center justify-between gap-3 px-5 py-4 text-left sm:px-6"
                      >
                        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span
                            id={`equations-${group.slug}-title`}
                            className="text-base font-semibold tracking-tight"
                          >
                            {group.title}
                          </span>
                          <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted">
                            {group.entries.length}{" "}
                            {group.entries.length === 1
                              ? "expression"
                              : "expressions"}
                          </span>
                        </span>
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className={`h-4 w-4 shrink-0 text-muted transition-transform ${
                            open ? "rotate-180" : ""
                          }`}
                        >
                          <path
                            d="M4 6l4 4 4-4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      {open ? (
                        <div
                          id={`equations-${group.slug}-panel`}
                          role="region"
                          aria-labelledby={`equations-${group.slug}-title`}
                          className="px-5 pb-5 sm:px-6 sm:pb-6"
                        >
                          <ul className="flex flex-col gap-6">
                            {group.entries.map((entry, entryIndex) => {
                              const anatomyParts =
                                ANATOMY[group.slug]?.[entryIndex];
                              const dissectOpen = dissecting.has(
                                `${group.slug}:${entryIndex}`,
                              );
                              return (
                                <li
                                  key={entry.tex}
                                  className="grid gap-3 border-t border-line pt-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center sm:gap-8"
                                >
                                  <div className="overflow-x-auto">
                                    <TeX tex={entry.tex} block />
                                  </div>
                                  <div className="flex flex-col items-start gap-3">
                                    <p className="text-sm leading-relaxed text-muted">
                                      {entry.note}
                                    </p>
                                    {anatomyParts ? (
                                      <button
                                        type="button"
                                        aria-expanded={dissectOpen}
                                        aria-controls={`equations-${group.slug}-anatomy-${entryIndex}`}
                                        onClick={() =>
                                          toggleDissect(
                                            group.slug,
                                            entryIndex,
                                          )
                                        }
                                        className="focus-ring rounded-full border border-line px-2.5 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent"
                                      >
                                        Dissect
                                      </button>
                                    ) : null}
                                  </div>
                                  {anatomyParts && dissectOpen ? (
                                    <div
                                      id={`equations-${group.slug}-anatomy-${entryIndex}`}
                                      className="sm:col-span-2"
                                    >
                                      <EquationAnatomy
                                        parts={anatomyParts}
                                        label={`${group.title} · equation ${entryIndex + 1}`}
                                      />
                                    </div>
                                  ) : null}
                                </li>
                              );
                            })}
                          </ul>
                          {topic ? (
                            <div className="mt-6 border-t border-line pt-4">
                              <Link
                                href={`/topics/${topic.slug}`}
                                className="focus-ring rounded-sm text-sm text-muted transition-colors hover:text-accent"
                              >
                                Run the simulation →
                              </Link>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-line px-6 py-16 text-center">
          <p className="text-muted">No equations match “{query}”.</p>
          <button
            type="button"
            onClick={reset}
            className="focus-ring mt-4 rounded-full border border-accent/40 px-4 py-2 text-sm text-accent transition-colors hover:bg-accent/10"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
