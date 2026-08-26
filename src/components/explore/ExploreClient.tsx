"use client";

import { useMemo, useState } from "react";
import TopicCard from "@/components/explore/TopicCard";
import {
  COLLECTIONS,
  DOMAINS,
  type Collection,
  type Level,
  type TopicMeta,
} from "@/lib/topics";

type CollectionFilter = Collection | "all";
type LevelFilter = Level | "all";

const LEVEL_OPTIONS: { id: LevelFilter; label: string }[] = [
  { id: "all", label: "All levels" },
  { id: 1, label: "Foundation" },
  { id: 2, label: "Core" },
  { id: 3, label: "Advanced" },
];

export default function ExploreClient({ topics }: { topics: readonly TopicMeta[] }) {
  const [query, setQuery] = useState("");
  const [activeCollection, setActiveCollection] = useState<CollectionFilter>("all");
  const [activeLevel, setActiveLevel] = useState<LevelFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return topics.filter((topic) => {
      if (activeCollection !== "all" && !topic.collections.includes(activeCollection)) {
        return false;
      }
      if (activeLevel !== "all" && topic.level !== activeLevel) {
        return false;
      }
      if (q === "") return true;
      const haystack = [topic.title, topic.blurb, topic.tags.join(" ")]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [topics, query, activeCollection, activeLevel]);

  const grouped = useMemo(() => {
    return DOMAINS.map((domain) => ({
      domain,
      items: filtered.filter((topic) => topic.domain === domain.id),
    })).filter((group) => group.items.length > 0);
  }, [filtered]);

  const reset = (): void => {
    setQuery("");
    setActiveCollection("all");
    setActiveLevel("all");
  };

  const chip = (active: boolean): string =>
    `rounded-full border px-3 py-1 text-xs transition-colors ${
      active
        ? "border-accent/40 bg-accent/10 text-accent"
        : "border-line text-muted hover:border-accent/40 hover:text-fg"
    }`;

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search motion, waves, chaos…"
          aria-label="Search topics"
          className="focus-ring w-full rounded-xl border border-line bg-panel px-4 py-2.5 text-fg outline-none placeholder:text-muted/70 sm:max-w-md"
        />
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by collection">
          {(["all", ...COLLECTIONS] as const).map((option) => (
            <button
              key={option === "all" ? "all" : option.id}
              type="button"
              aria-pressed={option === "all" ? activeCollection === "all" : activeCollection === option.id}
              onClick={() =>
                setActiveCollection(option === "all" ? "all" : option.id)
              }
              className={chip(option === "all" ? activeCollection === "all" : activeCollection === option.id)}
            >
              {option === "all" ? "All collections" : option.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by level">
          {LEVEL_OPTIONS.map((option) => (
            <button
              key={String(option.id)}
              type="button"
              aria-pressed={activeLevel === option.id}
              onClick={() => setActiveLevel(option.id)}
              className={chip(activeLevel === option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {grouped.length > 0 ? (
        <div className="mt-12 flex flex-col gap-12">
          {grouped.map(({ domain, items }) => (
            <section key={domain.id} aria-labelledby={`domain-${domain.id}`}>
              <div className="flex items-baseline gap-3">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: domain.accent }}
                />
                <h2 id={`domain-${domain.id}`} className="text-lg font-semibold tracking-tight">
                  {domain.label}
                </h2>
                <span className="font-mono text-xs text-muted">{items.length}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{domain.blurb}</p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((topic) => (
                  <TopicCard key={topic.slug} topic={topic} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-line px-6 py-16 text-center">
          <p className="text-muted">Nothing matches “{query}”.</p>
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
