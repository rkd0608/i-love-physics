"use client";

import { Fragment, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseBrowser } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { TopicStatus } from "@/lib/supabase/database.types";
import type { TopicSlug } from "@/lib/topics";

interface ProgressStatsRow {
  topic_slug: string;
  status: string;
  n: number;
}

export type ProgressStatsMap = Map<string, Record<TopicStatus, number>>;

const EMPTY_COUNTS: Record<TopicStatus, number> = {
  want: 0,
  learning: 0,
  learned: 0,
};

const STATUSES: readonly TopicStatus[] = ["want", "learning", "learned"];

const DOTS: Record<TopicStatus, string> = {
  want: "bg-muted",
  learning: "bg-accent",
  learned: "bg-green",
};

const LABELS: Record<TopicStatus, string> = {
  want: "want",
  learning: "learning",
  learned: "learned",
};

let statsPromise: Promise<ProgressStatsMap> | null = null;

export function fetchAllProgressStats(
  supabase: SupabaseClient
): Promise<ProgressStatsMap> {
  if (statsPromise !== null) return statsPromise;
  const request = Promise.resolve(
    supabase.rpc("topic_progress_stats") as PromiseLike<{ data: unknown }>
  )
    .then(({ data }) => {
      const map: ProgressStatsMap = new Map();
      if (Array.isArray(data)) {
        for (const raw of data as ProgressStatsRow[]) {
          if (!(STATUSES as readonly string[]).includes(raw.status)) continue;
          const status = raw.status as TopicStatus;
          const current = map.get(raw.topic_slug) ?? EMPTY_COUNTS;
          map.set(raw.topic_slug, { ...current, [status]: raw.n });
        }
      }
      return map;
    })
    .catch(() => new Map<string, Record<TopicStatus, number>>());
  statsPromise = request;
  return request;
}

export default function TopicMetrics({ slug }: { slug: TopicSlug }) {
  const [counts, setCounts] = useState<Record<TopicStatus, number> | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    void fetchAllProgressStats(supabase).then((map) => {
      if (cancelled) return;
      setCounts(map.get(slug) ?? EMPTY_COUNTS);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!isSupabaseConfigured()) return null;

  const visible =
    counts === null
      ? []
      : STATUSES.map((status) => ({ status, n: counts[status] })).filter(
          (entry) => entry.n > 0
        );

  if (loaded && visible.length === 0) return null;

  return (
    <div
      role="group"
      aria-label="community progress"
      className="inline-flex items-center gap-2 font-mono text-xs text-muted"
    >
      {loaded ? (
        visible.map((entry, index) => (
          <Fragment key={entry.status}>
            {index > 0 ? <span aria-hidden="true">·</span> : null}
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={`inline-block h-1.5 w-1.5 rounded-full ${DOTS[entry.status]}`}
              />
              <span>
                {entry.n} {LABELS[entry.status]}
              </span>
            </span>
          </Fragment>
        ))
      ) : (
        STATUSES.map((status) => (
          <span
            key={status}
            aria-hidden="true"
            className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-muted/50"
          />
        ))
      )}
    </div>
  );
}
