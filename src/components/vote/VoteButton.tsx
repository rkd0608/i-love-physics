"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function VoteButton({
  proposalId,
  count,
  hasVoted,
  onChange,
}: {
  proposalId: string;
  count: number;
  hasVoted: boolean;
  onChange: () => void;
}) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState<{
    base: number;
    delta: number;
  } | null>(null);
  const [pending, setPending] = useState(false);

  const shownCount =
    optimistic && optimistic.base === count ? count + optimistic.delta : count;

  async function toggle() {
    if (pending) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      router.push("/signin");
      return;
    }
    setPending(true);
    setOptimistic({ base: count, delta: hasVoted ? -1 : 1 });
    try {
      const { data } = await supabase.auth.getUser();
      const user = data.user ?? null;
      if (!user) {
        setOptimistic(null);
        router.push("/signin");
        return;
      }
      const { error } = hasVoted
        ? await supabase
            .from("votes")
            .delete()
            .eq("proposal_id", proposalId)
            .eq("user_id", user.id)
        : await supabase
            .from("votes")
            .upsert(
              { proposal_id: proposalId, user_id: user.id },
              { onConflict: "proposal_id,user_id", ignoreDuplicates: true }
            );
      if (error) throw error;
      onChange();
    } catch {
      setOptimistic(null);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={hasVoted}
      aria-label={hasVoted ? "Remove vote" : "Vote for this proposal"}
      className={`focus-ring inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${
        hasVoted
          ? "bg-accent text-panel"
          : "border border-line bg-panel text-fg hover:border-accent/40 hover:text-accent"
      }`}
    >
      {pending ? (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        <span aria-hidden="true">▲</span>
      )}
      <span className="font-mono tabular-nums">{shownCount}</span>
    </button>
  );
}
