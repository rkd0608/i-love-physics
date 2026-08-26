"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import VoteButton from "@/components/vote/VoteButton";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { DOMAINS, domainLabel, type Domain } from "@/lib/topics";

type ProposalRow = Database["public"]["Tables"]["content_proposals"]["Row"];

interface RankedProposal extends ProposalRow {
  votes: number;
}

export default function VoteBoard() {
  const [proposals, setProposals] = useState<RankedProposal[]>([]);
  const [votedIds, setVotedIds] = useState<ReadonlySet<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [domain, setDomain] = useState<string>(DOMAINS[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(() => {
    const supabase = getSupabaseBrowser();
    const idle: Promise<[null, null, null]> = Promise.resolve([null, null, null]);
    const request = supabase
      ? Promise.all([
          supabase.from("content_proposals").select("*"),
          supabase.from("votes").select("proposal_id,user_id"),
          supabase.auth.getUser(),
        ])
      : idle;
    return request.then(([proposalsRes, votesRes, authRes]) => {
      if (!supabase || !proposalsRes || !votesRes || !authRes) {
        setError("Community features need configuration.");
        setLoading(false);
        return;
      }
      if (proposalsRes.error || votesRes.error) {
        setError("Could not load the ballot. Try refreshing.");
        setLoading(false);
        return;
      }
      const uid = authRes.data.user?.id ?? null;
      const counts = new Map<string, number>();
      const mine = new Set<string>();
      for (const vote of votesRes.data) {
        counts.set(vote.proposal_id, (counts.get(vote.proposal_id) ?? 0) + 1);
        if (uid !== null && vote.user_id === uid) mine.add(vote.proposal_id);
      }
      setUserId(uid);
      setVotedIds(mine);
      setProposals(
        proposalsRes.data
          .map((proposal) => ({
            ...proposal,
            votes: counts.get(proposal.id) ?? 0,
          }))
          .sort(
            (a, b) =>
              b.votes - a.votes || a.created_at.localeCompare(b.created_at)
          )
      );
      setError(null);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totalVotes = useMemo(
    () => proposals.reduce((sum, proposal) => sum + proposal.votes, 0),
    [proposals]
  );

  async function submitProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowser();
    if (!supabase || !userId || submitting) return;
    setSubmitting(true);
    setFormError(null);
    const { error: insertError } = await supabase
      .from("content_proposals")
      .insert({
        title: title.trim(),
        summary: summary.trim(),
        domain,
        proposed_by: userId,
      });
    if (insertError) {
      setFormError(insertError.message);
    } else {
      setTitle("");
      setSummary("");
      setDomain(DOMAINS[0].id);
      setFormOpen(false);
      await load();
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <p className="mt-12 font-mono text-xs uppercase tracking-widest text-muted">
        Counting ballots…
      </p>
    );
  }

  if (error !== null) {
    return (
      <div className="mt-12 rounded-2xl border border-dashed border-line px-6 py-16 text-center">
        <p className="text-lg text-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      {userId ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setFormOpen((open) => !open)}
            className="focus-ring rounded-full border border-accent/40 px-4 py-2 text-sm text-accent transition-colors hover:bg-accent/10"
          >
            {formOpen ? "Close" : "Propose a topic"}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-dashed border-line px-5 py-4">
          <p className="text-sm text-muted">
            Sign in to vote and propose what gets built next.
          </p>
          <Link
            href="/signin"
            className="focus-ring shrink-0 rounded-full border border-accent/40 px-4 py-2 text-sm text-accent transition-colors hover:bg-accent/10"
          >
            Sign in
          </Link>
        </div>
      )}

      {formOpen && userId !== null ? (
        <form
          onSubmit={submitProposal}
          className="mt-6 space-y-3 rounded-2xl border border-line bg-panel p-5"
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title — e.g. Fluid Dynamics"
              aria-label="Proposal title"
              maxLength={120}
              className="focus-ring w-full rounded-xl border border-line bg-panel px-4 py-2.5 text-fg outline-none placeholder:text-muted/70"
            />
            <select
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
              aria-label="Domain"
              className="focus-ring rounded-xl border border-line bg-panel px-3 py-2.5 text-fg outline-none"
            >
              {DOMAINS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="What should we build, and why is it exciting?"
            aria-label="Proposal summary"
            rows={3}
            maxLength={500}
            className="focus-ring w-full resize-y rounded-xl border border-line bg-panel px-4 py-2.5 text-fg outline-none placeholder:text-muted/70"
          />
          {formError !== null ? (
            <p className="text-sm text-red-500" role="alert">
              {formError}
            </p>
          ) : null}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={
                submitting || title.trim() === "" || summary.trim() === ""
              }
              className="focus-ring rounded-full bg-accent px-5 py-2 text-sm font-semibold text-panel transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit proposal"}
            </button>
          </div>
        </form>
      ) : null}

      {proposals.length > 0 ? (
        <ol className="mt-8 flex flex-col gap-4">
          {proposals.map((proposal, index) => (
            <li key={proposal.id}>
              <article className="flex items-start gap-4 rounded-2xl border border-line bg-panel p-5">
                <span
                  aria-hidden="true"
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border font-mono text-xs ${
                    index === 0
                      ? "border-amber/50 bg-amber/15 text-amber"
                      : "border-line text-muted"
                  }`}
                >
                  #{index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-widest text-muted">
                    {domainLabel(proposal.domain as Domain)}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">
                    {proposal.title}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {proposal.summary}
                  </p>
                </div>
                <VoteButton
                  proposalId={proposal.id}
                  count={proposal.votes}
                  hasVoted={votedIds.has(proposal.id)}
                  onChange={() => void load()}
                />
              </article>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-line px-6 py-16 text-center">
          <p className="text-muted">
            No proposals yet. Be the first to pitch one.
          </p>
        </div>
      )}

      <p className="mt-12 border-t border-line pt-5 text-center font-mono text-xs text-muted">
        {totalVotes} {totalVotes === 1 ? "vote" : "votes"} cast ·{" "}
        {proposals.length} {proposals.length === 1 ? "proposal" : " proposals"}
      </p>
    </div>
  );
}
