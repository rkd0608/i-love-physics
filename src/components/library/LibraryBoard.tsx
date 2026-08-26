"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ProgressToggle from "@/components/library/ProgressToggle";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { TOPICS, domainLabel } from "@/lib/topics";
import type { TopicStatus } from "@/lib/supabase/database.types";

const SHELVES: readonly { id: TopicStatus; label: string }[] = [
  { id: "learned", label: "Learned" },
  { id: "learning", label: "Learning" },
  { id: "want", label: "Want to learn" },
];

export default function LibraryBoard({ userId }: { userId: string }) {
  const [progress, setProgress] = useState<Record<string, TopicStatus>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<void> => {
      const supabase = getSupabaseBrowser();
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("topic_progress")
        .select("topic_slug,status")
        .eq("user_id", userId);
      if (cancelled) return;
      if (error) {
        setLoadError(true);
      } else {
        const next: Record<string, TopicStatus> = {};
        for (const row of data ?? []) next[row.topic_slug] = row.status;
        setProgress(next);
      }
      setLoading(false);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const grouped = useMemo(
    () =>
      SHELVES.map((shelf) => ({
        shelf,
        items: TOPICS.filter((topic) => progress[topic.slug] === shelf.id),
      })),
    [progress],
  );

  if (loading) {
    return (
      <div className="space-y-10" aria-hidden="true">
        {SHELVES.map((shelf) => (
          <section key={shelf.id} className="space-y-3">
            <div className="h-6 w-32 animate-pulse rounded-full bg-panel" />
            <div className="h-[4.5rem] animate-pulse rounded-xl border border-line bg-panel" />
            <div className="h-[4.5rem] animate-pulse rounded-xl border border-line bg-panel" />
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {loadError ? (
        <p role="alert" className="text-sm text-amber">
          Couldn’t load your shelves — try refreshing.
        </p>
      ) : null}
      {grouped.map(({ shelf, items }) => (
        <section key={shelf.id} aria-labelledby={`shelf-${shelf.id}`} className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id={`shelf-${shelf.id}`} className="text-lg font-semibold tracking-tight">
              {shelf.label}
            </h2>
            <span className="rounded-full border border-line px-2 py-0.5 font-mono text-xs text-muted">
              {items.length}
            </span>
          </div>
          {items.length > 0 ? (
            <ul className="space-y-3">
              {items.map((topic) => (
                <li key={topic.slug}>
                  <div
                    className="rounded-xl border border-line bg-panel p-4 transition-colors hover:border-accent/40"
                    style={{ borderLeft: `3px solid ${topic.accent}` }}
                  >
                    <p
                      className="text-xs uppercase tracking-widest"
                      style={{ color: topic.accent }}
                    >
                      {domainLabel(topic.domain)}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/topics/${topic.slug}`}
                          className="focus-ring rounded-sm font-medium transition-colors hover:text-accent"
                        >
                          {topic.title}
                        </Link>
                        <p className="mt-0.5 line-clamp-1 text-sm text-muted">
                          {topic.tagline}
                        </p>
                      </div>
                      <ProgressToggle slug={topic.slug} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
              Nothing here yet — explore topics to fill this shelf
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
