import type { Metadata } from "next";
import VoteBoard from "@/components/vote/VoteBoard";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vote on what ships next",
  description:
    "Propose topics, vote for your favorites, and watch the community’s pick get built.",
};

export default function VotePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-20">
      <header className="max-w-2xl space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Vote on what ships next
        </h1>
        <p className="text-lg text-muted">
          Every month, the top-voted proposal gets built into a real
          interactive topic. Propose what you’d love to explore, vote for the
          ideas you can’t stop thinking about, and watch the winner ship.
        </p>
      </header>
      {isSupabaseConfigured() ? (
        <VoteBoard />
      ) : (
        <div className="mt-12 rounded-2xl border border-dashed border-line px-6 py-16 text-center">
          <p className="text-lg text-muted">
            Community features need configuration.
          </p>
          <p className="mt-2 text-sm text-muted">
            The voting booth will appear once community features are configured
            for this deployment.
          </p>
        </div>
      )}
    </div>
  );
}
