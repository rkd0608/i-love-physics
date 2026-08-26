"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { TopicSlug } from "@/lib/topics";
import type { TopicStatus } from "@/lib/supabase/database.types";

const SEGMENTS: readonly { value: TopicStatus; label: string }[] = [
  { value: "want", label: "Want" },
  { value: "learning", label: "Learning" },
  { value: "learned", label: "Learned" },
];

export default function ProgressToggle({ slug }: { slug: TopicSlug }) {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [status, setStatus] = useState<TopicStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async (): Promise<void> => {
      if (!isSupabaseConfigured()) return;
      const supabase = getSupabaseBrowser();
      if (!supabase) return;
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id ?? null;
      if (!userId || cancelled) return;
      userIdRef.current = userId;
      setSignedIn(true);
      const { data: row } = await supabase
        .from("topic_progress")
        .select("status")
        .eq("user_id", userId)
        .eq("topic_slug", slug)
        .maybeSingle();
      if (cancelled) return;
      if (row?.status) setStatus(row.status);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const locked = !isSupabaseConfigured() || !signedIn;

  const select = async (next: TopicStatus): Promise<void> => {
    setError(null);
    if (locked) {
      router.push("/signin");
      return;
    }
    if (busy) return;
    const supabase = getSupabaseBrowser();
    const userId = userIdRef.current;
    if (!supabase || !userId) {
      router.push("/signin");
      return;
    }
    const previous = status;
    const clearing = previous === next;
    setStatus(clearing ? null : next);
    setBusy(true);
    const { error: saveError } = clearing
      ? await supabase
          .from("topic_progress")
          .delete()
          .eq("user_id", userId)
          .eq("topic_slug", slug)
      : await supabase
          .from("topic_progress")
          .upsert({ user_id: userId, topic_slug: slug, status: next });
    setBusy(false);
    if (saveError) {
      setStatus(previous);
      setError("Couldn’t save that — try again.");
    }
  };

  return (
    <div className="inline-flex flex-col items-start">
      <div
        role="group"
        aria-label="Track your progress"
        title={locked ? "Sign in to track progress" : undefined}
        className="flex gap-0.5 rounded-full border border-line bg-panel p-0.5"
      >
        {SEGMENTS.map((segment) => {
          const active = status === segment.value;
          return (
            <button
              key={segment.value}
              type="button"
              aria-pressed={active}
              onClick={() => void select(segment.value)}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                active ? "bg-accent/15 text-accent" : "text-muted hover:text-fg"
              }`}
            >
              {segment.label}
            </button>
          );
        })}
      </div>
      {error ? (
        <p role="alert" className="mt-1 text-xs text-amber">
          {error}
        </p>
      ) : null}
    </div>
  );
}
