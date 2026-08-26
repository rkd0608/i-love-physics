import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import CollectionEditor from "@/components/collections/CollectionEditor";
import CollectionView from "@/components/collections/CollectionView";
import {
  getSessionUser,
  getSupabaseServer,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface CollectionRecord {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
}

function NoticeCard({
  heading,
  prose,
  children,
}: {
  heading: string;
  prose: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-16 text-center">
      <h2 className="text-xl font-semibold tracking-tight">{heading}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{prose}</p>
      {children}
    </div>
  );
}

const backLink = (
  <Link
    href="/collections"
    className="focus-ring mt-5 inline-block rounded-full border border-accent/40 px-4 py-2 text-sm text-accent transition-colors hover:bg-accent/10"
  >
    Back to collections
  </Link>
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  let title = "Collection";
  if (isSupabaseConfigured()) {
    const sb = await getSupabaseServer();
    if (sb) {
      const { data } = await sb
        .from("collections")
        .select("title")
        .eq("id", id)
        .maybeSingle();
      if (data?.title) title = String(data.title);
    }
  }
  return { title };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const configured = isSupabaseConfigured();

  let record: CollectionRecord | null = null;
  let viewerId: string | null = null;

  if (configured) {
    const user = await getSessionUser();
    viewerId = user?.id ?? null;
    const sb = await getSupabaseServer();
    if (sb) {
      const { data } = await sb
        .from("collections")
        .select("id,owner_id,title,description,is_public")
        .eq("id", id)
        .maybeSingle();
      record = data ?? null;
    }
  }

  const isOwner = record !== null && record.owner_id === viewerId;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-14 sm:py-20">
      {!configured ? (
        <NoticeCard
          heading="The archive isn’t connected yet"
          prose="This collection can’t be shown until Supabase is configured for the atlas."
        >
          {backLink}
        </NoticeCard>
      ) : record === null ? (
        <NoticeCard
          heading="No collection at this address"
          prose="We searched the archive and found nothing answering to this link. It may have been renamed or removed."
        >
          {backLink}
        </NoticeCard>
      ) : !isOwner && !record.is_public ? (
        <NoticeCard
          heading="This collection is private."
          prose="Its keeper hasn’t opened it to the world yet. Ask them directly, or wander the public shelves instead."
        >
          {backLink}
        </NoticeCard>
      ) : isOwner ? (
        <div className="space-y-12">
          <header className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {record.title}
              </h1>
              <span className="rounded-full border border-line px-3 py-1 text-xs uppercase tracking-wide text-muted">
                {record.is_public ? "Public" : "Private"}
              </span>
            </div>
            <p className="font-mono text-xs text-muted">Editing as owner</p>
          </header>
          <CollectionEditor ownerId={record.owner_id} />
          <section aria-labelledby="preview-heading" className="space-y-5">
            <h2
              id="preview-heading"
              className="text-lg font-semibold tracking-tight"
            >
              Visitor preview
            </h2>
            <CollectionView collectionId={id} readOnly={false} />
          </section>
        </div>
      ) : (
        <CollectionView collectionId={id} readOnly={true} />
      )}
    </div>
  );
}
