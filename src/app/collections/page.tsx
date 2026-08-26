import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import CollectionEditor from "@/components/collections/CollectionEditor";
import { CommunityCollections } from "@/components/collections/CollectionView";
import {
  getSessionUser,
  getSupabaseServer,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Collections",
};

interface OwnedSummary {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
}

const tabChip = (active: boolean): string =>
  `rounded-full border px-4 py-1.5 text-sm transition-colors ${
    active
      ? "border-accent/40 bg-accent/10 text-accent"
      : "border-line text-muted hover:border-accent/40 hover:text-fg"
  }`;

function Shell({
  heading,
  prose,
  children,
}: {
  heading: string;
  prose: string;
  children?: ReactNode;
}) {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-line px-6 py-14 text-center">
      <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{prose}</p>
      {children}
    </div>
  );
}

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === "community" ? "community" : "yours";
  const configured = isSupabaseConfigured();
  const user = configured ? await getSessionUser() : null;

  let summaries: OwnedSummary[] = [];
  let shelvedTopics = 0;
  if (user) {
    const sb = await getSupabaseServer();
    if (sb) {
      const { data } = await sb
        .from("collections")
        .select("id,title,description,is_public")
        .eq("owner_id", user.id);
      summaries = data ?? [];
      if (summaries.length > 0) {
        const { data: itemRows } = await sb
          .from("collection_items")
          .select("collection_id")
          .in(
            "collection_id",
            summaries.map((entry) => entry.id)
          );
        shelvedTopics = itemRows?.length ?? 0;
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-20">
      <header className="max-w-2xl space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Collections
        </h1>
        <p className="text-lg text-muted">
          Curate the atlas your way — gather topics onto shelves, order the
          story you want to tell, and open it to the world when it’s ready.
        </p>
      </header>

      <nav className="mt-8 flex flex-wrap gap-2" aria-label="Collection views">
        <Link
          href="/collections"
          className={tabChip(activeTab === "yours")}
          aria-current={activeTab === "yours" ? "page" : undefined}
        >
          Yours
        </Link>
        <Link
          href="/collections?tab=community"
          className={tabChip(activeTab === "community")}
          aria-current={activeTab === "community" ? "page" : undefined}
        >
          Community
        </Link>
      </nav>

      {activeTab === "yours" ? (
        !configured ? (
          <Shell
            heading="The archive isn’t connected yet"
            prose="Collections need a configured Supabase backend before shelves can be built. Every equation and lab stays open in the meantime."
          >
            <Link
              href="/explore"
              className="focus-ring mt-5 inline-block rounded-full border border-accent/40 px-4 py-2 text-sm text-accent transition-colors hover:bg-accent/10"
            >
              Explore topics instead
            </Link>
          </Shell>
        ) : !user ? (
          <Shell
            heading="Sign in to build collections"
            prose="Your shelves live behind a sign-in — sequence topics, refine the running order, then publish them to the community tab."
          >
            <Link
              href="/collections?tab=community"
              className="focus-ring mt-5 inline-block rounded-full border border-accent/40 px-4 py-2 text-sm text-accent transition-colors hover:bg-accent/10"
            >
              Browse the community’s shelves
            </Link>
          </Shell>
        ) : (
          <div className="mt-10 space-y-6">
            <p className="font-mono text-xs text-muted">
              {summaries.length}{" "}
              {summaries.length === 1 ? "shelf" : "shelves"} · {shelvedTopics}{" "}
              {shelvedTopics === 1 ? "topic" : "topics"} shelved
            </p>
            <CollectionEditor ownerId={user.id} />
          </div>
        )
      ) : (
        <CommunityCollections />
      )}
    </div>
  );
}
