"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TeX from "@/components/math/TeX";
import { DOMAINS, domainLabel, getTopic } from "@/lib/topics";
import { getSupabaseBrowser } from "@/lib/supabase/client";

interface CollectionMeta {
  title: string;
  description: string | null;
  is_public: boolean;
}

interface ItemRow {
  id: string;
  topic_slug: string;
  position: number;
}

interface PublicCollectionRow {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function CollectionView({
  collectionId,
  readOnly,
}: {
  collectionId: string;
  readOnly: boolean;
}) {
  const [client] = useState(() => getSupabaseBrowser());
  const [meta, setMeta] = useState<CollectionMeta | null>(null);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [loading, setLoading] = useState(
    () => getSupabaseBrowser() !== null && collectionId !== ""
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!client || collectionId === "") return;
    let active = true;
    void Promise.all([
      client
        .from("collections")
        .select("title,description,is_public")
        .eq("id", collectionId)
        .maybeSingle(),
      client
        .from("collection_items")
        .select("id,topic_slug,position")
        .eq("collection_id", collectionId)
        .order("position", { ascending: true }),
    ]).then(([metaResult, itemResult]) => {
      if (!active) return;
      setMeta(metaResult.data ?? null);
      setItems(itemResult.data ?? []);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [client, collectionId]);

  const ordered = useMemo(
    () => [...items].sort((a, b) => a.position - b.position),
    [items]
  );

  const copyLink = async (): Promise<void> => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const scratch = document.createElement("textarea");
      scratch.value = url;
      scratch.setAttribute("readonly", "");
      scratch.style.position = "fixed";
      scratch.style.opacity = "0";
      document.body.appendChild(scratch);
      scratch.select();
      document.execCommand("copy");
      document.body.removeChild(scratch);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  if (loading) {
    return (
      <p className="font-mono text-xs text-muted">Laying out the shelf…</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight">
            {meta?.title ?? "Untitled collection"}
          </h2>
          {meta?.description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted">
              {meta.description}
            </p>
          ) : null}
          <p className="mt-2 font-mono text-xs text-muted">
            {ordered.length} {ordered.length === 1 ? "topic" : "topics"} ·{" "}
            {meta?.is_public === false ? "Private shelf" : "Public shelf"}
          </p>
        </div>
        {!readOnly ? (
          <button
            type="button"
            onClick={() => void copyLink()}
            className="focus-ring shrink-0 rounded-full border border-accent/40 px-4 py-1.5 text-xs text-accent transition-colors hover:bg-accent/10"
          >
            {copied ? "Copied ✓" : "Copy link"}
          </button>
        ) : null}
      </div>

      {ordered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line px-6 py-14 text-center">
          <p className="text-muted">This shelf is empty for now.</p>
        </div>
      ) : (
        <ol className="space-y-4">
          {ordered.map((item, index) => {
            const topic = getTopic(item.topic_slug);
            if (!topic) return null;
            const domain = DOMAINS.find((entry) => entry.id === topic.domain);
            return (
              <li key={item.id}>
                <Link
                  href={`/topics/${topic.slug}`}
                  className="group flex items-start gap-4 rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-accent/40 focus-ring"
                  style={{ borderLeft: `3px solid ${topic.accent}` }}
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line font-mono text-xs text-muted transition-colors group-hover:border-accent/40 group-hover:text-accent"
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="block text-xs uppercase tracking-widest"
                      style={{ color: domain?.accent }}
                    >
                      {domainLabel(topic.domain)}
                    </span>
                    <span className="mt-2 block text-lg font-semibold tracking-tight transition-colors group-hover:text-accent">
                      {topic.title}
                    </span>
                    <span className="mt-1 block line-clamp-2 text-sm text-muted">
                      {topic.tagline}
                    </span>
                    <span className="mt-3 block overflow-x-auto opacity-80">
                      <TeX tex={topic.equations[0]} />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export function CommunityCollections() {
  const [client] = useState(() => getSupabaseBrowser());
  const [rows, setRows] = useState<PublicCollectionRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(() => getSupabaseBrowser() !== null);

  useEffect(() => {
    if (!client) return;
    let active = true;
    void client
      .from("collections")
      .select("id,title,description,created_at")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(async ({ data }) => {
        const list: PublicCollectionRow[] = data ?? [];
        const tally: Record<string, number> = {};
        if (active && list.length > 0) {
          const { data: itemData } = await client
            .from("collection_items")
            .select("collection_id")
            .in(
              "collection_id",
              list.map((row) => row.id)
            );
          for (const row of itemData ?? []) {
            tally[row.collection_id] = (tally[row.collection_id] ?? 0) + 1;
          }
        }
        if (active) {
          setRows(list);
          setCounts(tally);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [client]);

  if (loading) {
    return (
      <p className="mt-10 font-mono text-xs text-muted">
        Gathering public shelves…
      </p>
    );
  }

  return (
    <div className="mt-10">
      <p className="max-w-2xl text-sm text-muted">
        Shelves published by fellow travelers, newest first.
      </p>
      {rows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line px-6 py-16 text-center">
          <p className="text-muted">
            No public collections yet — yours could be the first.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <Link
              key={row.id}
              href={`/collections/${row.id}`}
              className="focus-ring group block rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-accent/40"
            >
              <h3 className="font-semibold tracking-tight transition-colors group-hover:text-accent">
                {row.title}
              </h3>
              {row.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-muted">
                  {row.description}
                </p>
              ) : null}
              <p className="mt-3 font-mono text-xs text-muted">
                {counts[row.id] ?? 0}{" "}
                {(counts[row.id] ?? 0) === 1 ? "topic" : "topics"} ·{" "}
                {formatDate(row.created_at)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
