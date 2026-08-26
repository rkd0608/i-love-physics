"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TOPICS, getTopic } from "@/lib/topics";
import { getSupabaseBrowser } from "@/lib/supabase/client";

interface CollectionRow {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
}

interface ItemRow {
  id: string;
  collection_id: string;
  topic_slug: string;
  position: number;
}

const sortItems = (items: ItemRow[]): ItemRow[] =>
  [...items].sort((a, b) => a.position - b.position);

type SupabaseBrowserClient = NonNullable<
  ReturnType<typeof getSupabaseBrowser>
>;

async function fetchShelves(
  client: SupabaseBrowserClient,
  ownerId: string
): Promise<{ collections: CollectionRow[]; items: Record<string, ItemRow[]> }> {
  const { data } = await client
    .from("collections")
    .select("id,title,description,is_public")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true });
  const rows: CollectionRow[] = data ?? [];
  const grouped: Record<string, ItemRow[]> = {};
  if (rows.length > 0) {
    const { data: itemData } = await client
      .from("collection_items")
      .select("id,collection_id,topic_slug,position")
      .in(
        "collection_id",
        rows.map((row) => row.id)
      )
      .order("position", { ascending: true });
    for (const item of itemData ?? []) {
      const bucket = grouped[item.collection_id];
      if (bucket) bucket.push(item);
      else grouped[item.collection_id] = [item];
    }
  }
  return { collections: rows, items: grouped };
}

export default function CollectionEditor({ ownerId }: { ownerId: string }) {
  const [client] = useState(() => getSupabaseBrowser());
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [itemsByCollection, setItemsByCollection] = useState<
    Record<string, ItemRow[]>
  >({});
  const [loading, setLoading] = useState(() => getSupabaseBrowser() !== null);
  const [notice, setNotice] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [armedDeleteId, setArmedDeleteId] = useState<string | null>(null);
  const [pickerValues, setPickerValues] = useState<Record<string, string>>({});

  const collectionsRef = useRef<CollectionRow[]>([]);
  const itemsRef = useRef<Record<string, ItemRow[]>>({});
  const noticeTimer = useRef<number | null>(null);
  const renameTimer = useRef<number | null>(null);
  const renameOrigin = useRef<{ id: string; title: string } | null>(null);

  useEffect(() => {
    collectionsRef.current = collections;
  }, [collections]);

  useEffect(() => {
    itemsRef.current = itemsByCollection;
  }, [itemsByCollection]);

  useEffect(() => {
    return () => {
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
      if (renameTimer.current) window.clearTimeout(renameTimer.current);
    };
  }, []);

  const flash = useCallback((message: string) => {
    setNotice(message);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 3200);
  }, []);

  useEffect(() => {
    if (!client) return;
    let active = true;
    void fetchShelves(client, ownerId).then((result) => {
      if (!active) return;
      setCollections(result.collections);
      setItemsByCollection(result.items);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [client, ownerId]);

  const createCollection = async (): Promise<void> => {
    const title = newTitle.trim();
    if (!client || creating || title === "") return;
    setCreating(true);
    const optimisticId = `pending-${Date.now()}`;
    const trimmedDescription = newDescription.trim();
    const optimistic: CollectionRow = {
      id: optimisticId,
      title,
      description: trimmedDescription === "" ? null : trimmedDescription,
      is_public: newIsPublic,
    };
    setCollections((prev) => [...prev, optimistic]);
    setNewTitle("");
    setNewDescription("");
    setNewIsPublic(false);
    const { data, error } = await client
      .from("collections")
      .insert({
        owner_id: ownerId,
        title: optimistic.title,
        description: optimistic.description,
        is_public: optimistic.is_public,
      })
      .select("id,title,description,is_public")
      .single();
    if (error || !data) {
      setCollections((prev) => prev.filter((row) => row.id !== optimisticId));
      flash("Couldn’t create that collection — changes reverted.");
    } else {
      const saved = data as CollectionRow;
      setCollections((prev) =>
        prev.map((row) => (row.id === optimisticId ? saved : row))
      );
    }
    setCreating(false);
  };

  const persistTitle = useCallback(
    async (id: string, title: string) => {
      if (!client || title === "") return;
      const origin = collectionsRef.current.find((row) => row.id === id);
      const { error } = await client
        .from("collections")
        .update({ title })
        .eq("id", id);
      if (error && origin) {
        const restored = origin;
        setCollections((prev) =>
          prev.map((row) => (row.id === id ? restored : row))
        );
        flash("Rename couldn’t be saved — reverted.");
      }
    },
    [client, flash]
  );

  const stopRenameTimer = (): void => {
    if (renameTimer.current) {
      window.clearTimeout(renameTimer.current);
      renameTimer.current = null;
    }
  };

  const beginRename = (row: CollectionRow): void => {
    stopRenameTimer();
    setRenamingId(row.id);
    setRenameDraft(row.title);
    renameOrigin.current = { id: row.id, title: row.title };
  };

  const cancelRename = (): void => {
    stopRenameTimer();
    const origin = renameOrigin.current;
    if (origin) {
      setCollections((prev) =>
        prev.map((row) =>
          row.id === origin.id ? { ...row, title: origin.title } : row
        )
      );
    }
    renameOrigin.current = null;
    setRenamingId(null);
    setRenameDraft("");
  };

  const onRenameChange = (id: string, value: string): void => {
    setRenameDraft(value);
    setCollections((prev) =>
      prev.map((row) => (row.id === id ? { ...row, title: value } : row))
    );
    stopRenameTimer();
    renameTimer.current = window.setTimeout(() => {
      renameTimer.current = null;
      void persistTitle(id, value.trim());
    }, 300);
  };

  const saveRename = (id: string): void => {
    stopRenameTimer();
    const draft = renameDraft.trim();
    if (draft !== "") void persistTitle(id, draft);
    renameOrigin.current = null;
    setRenamingId(null);
    setRenameDraft("");
  };

  const togglePublic = async (row: CollectionRow): Promise<void> => {
    if (!client) return;
    const next = !row.is_public;
    setCollections((prev) =>
      prev.map((entry) =>
        entry.id === row.id ? { ...entry, is_public: next } : entry
      )
    );
    const { error } = await client
      .from("collections")
      .update({ is_public: next })
      .eq("id", row.id);
    if (error) {
      setCollections((prev) =>
        prev.map((entry) =>
          entry.id === row.id ? { ...entry, is_public: row.is_public } : entry
        )
      );
      flash("Visibility change reverted.");
    }
  };

  const deleteCollection = async (row: CollectionRow): Promise<void> => {
    if (!client) return;
    if (armedDeleteId !== row.id) {
      setArmedDeleteId(row.id);
      window.setTimeout(
        () =>
          setArmedDeleteId((current) => (current === row.id ? null : current)),
        4000
      );
      return;
    }
    const snapshotCollections = collectionsRef.current;
    const snapshotItems = itemsRef.current;
    setArmedDeleteId(null);
    setExpandedId((current) => (current === row.id ? null : current));
    setCollections((prev) => prev.filter((entry) => entry.id !== row.id));
    setItemsByCollection((prev) => {
      const next = { ...prev };
      delete next[row.id];
      return next;
    });
    const itemsResult = await client
      .from("collection_items")
      .delete()
      .eq("collection_id", row.id);
    const collectionResult = await client
      .from("collections")
      .delete()
      .eq("id", row.id);
    if (itemsResult.error || collectionResult.error) {
      setCollections(snapshotCollections);
      setItemsByCollection(snapshotItems);
      flash("Delete failed — shelf restored.");
    }
  };

  const setPickerValue = (collectionId: string, value: string): void =>
    setPickerValues((prev) => ({ ...prev, [collectionId]: value }));

  const addTopic = async (collectionId: string): Promise<void> => {
    const raw = (pickerValues[collectionId] ?? "").trim();
    if (!client || raw === "") return;
    const needle = raw.toLowerCase();
    const topic = TOPICS.find(
      (candidate) =>
        candidate.title.toLowerCase() === needle || candidate.slug === needle
    );
    if (!topic) {
      flash(`No topic answers to “${raw}”.`);
      return;
    }
    const current = itemsRef.current[collectionId] ?? [];
    if (current.some((item) => item.topic_slug === topic.slug)) {
      flash("That topic is already on this shelf.");
      return;
    }
    const position =
      current.reduce((max, item) => Math.max(max, item.position), 0) + 1;
    const optimisticId = `pending-${Date.now()}`;
    const optimistic: ItemRow = {
      id: optimisticId,
      collection_id: collectionId,
      topic_slug: topic.slug,
      position,
    };
    setItemsByCollection((prev) => ({
      ...prev,
      [collectionId]: [...(prev[collectionId] ?? []), optimistic],
    }));
    setPickerValue(collectionId, "");
    const { data, error } = await client
      .from("collection_items")
      .insert({
        collection_id: collectionId,
        topic_slug: topic.slug,
        position,
      })
      .select("id,collection_id,topic_slug,position")
      .single();
    if (error || !data) {
      setItemsByCollection((prev) => ({
        ...prev,
        [collectionId]: (prev[collectionId] ?? []).filter(
          (item) => item.id !== optimisticId
        ),
      }));
      flash("Couldn’t add that topic — reverted.");
    } else {
      const saved = data as ItemRow;
      setItemsByCollection((prev) => ({
        ...prev,
        [collectionId]: (prev[collectionId] ?? []).map((item) =>
          item.id === optimisticId ? saved : item
        ),
      }));
    }
  };

  const moveItem = async (
    collectionId: string,
    index: number,
    direction: -1 | 1
  ): Promise<void> => {
    if (!client) return;
    const list = sortItems(itemsRef.current[collectionId] ?? []);
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const moving = { ...list[index], position: list[target].position };
    const displaced = { ...list[target], position: list[index].position };
    const next = [...list];
    next[index] = moving;
    next[target] = displaced;
    setItemsByCollection((prev) => ({ ...prev, [collectionId]: next }));
    const [first, second] = await Promise.all([
      client
        .from("collection_items")
        .update({ position: moving.position })
        .eq("id", moving.id),
      client
        .from("collection_items")
        .update({ position: displaced.position })
        .eq("id", displaced.id),
    ]);
    if (first.error || second.error) {
      setItemsByCollection((prev) => ({ ...prev, [collectionId]: list }));
      flash("Reorder reverted.");
    }
  };

  const removeItem = async (
    collectionId: string,
    item: ItemRow
  ): Promise<void> => {
    if (!client) return;
    const list = itemsRef.current[collectionId] ?? [];
    setItemsByCollection((prev) => ({
      ...prev,
      [collectionId]: (prev[collectionId] ?? []).filter(
        (entry) => entry.id !== item.id
      ),
    }));
    const { error } = await client
      .from("collection_items")
      .delete()
      .eq("id", item.id);
    if (error) {
      setItemsByCollection((prev) => ({ ...prev, [collectionId]: list }));
      flash("Couldn’t remove that topic — restored.");
    }
  };

  if (!client) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-line px-6 py-14 text-center">
        <p className="text-sm text-muted">
          The browser couldn’t reach the archive, so shelves are resting for
          the moment.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <p className="mt-10 font-mono text-xs text-muted">
        Unpacking your shelves…
      </p>
    );
  }

  const inputClass =
    "focus-ring w-full rounded-xl border border-line bg-panel px-4 py-2.5 text-fg outline-none placeholder:text-muted/70";
  const ghostPill =
    "focus-ring rounded-full border border-line px-3 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-fg";
  const accentPill =
    "focus-ring rounded-full border border-accent/40 px-3 py-1 text-xs text-accent transition-colors hover:bg-accent/10";
  const dangerPill =
    "focus-ring rounded-full border border-amber/50 px-3 py-1 text-xs text-amber transition-colors hover:bg-amber/10";
  const iconButton =
    "focus-ring inline-flex h-7 w-7 items-center justify-center rounded-lg border border-line text-xs text-muted transition-colors hover:border-accent/40 hover:text-fg disabled:cursor-not-allowed disabled:opacity-30";
  const visibilityPill = (isPublic: boolean): string =>
    `focus-ring inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition-colors ${
      isPublic
        ? "border-green/40 bg-green/10 text-green"
        : "border-line text-muted hover:text-fg"
    }`;

  return (
    <div className="space-y-8">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void createCollection();
        }}
        className="space-y-4 rounded-2xl border border-line bg-panel p-5"
      >
        <h2 className="text-lg font-semibold tracking-tight">
          New collection
        </h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            type="text"
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="Name this shelf…"
            aria-label="Collection title"
            required
            maxLength={80}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={creating || newTitle.trim() === ""}
            className="focus-ring rounded-xl border border-accent/40 px-4 py-2.5 text-sm text-accent transition-colors hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {creating ? "Creating…" : "Create collection"}
          </button>
        </div>
        <input
          type="text"
          value={newDescription}
          onChange={(event) => setNewDescription(event.target.value)}
          placeholder="Optional description…"
          aria-label="Collection description"
          maxLength={160}
          className={inputClass}
        />
        <button
          type="button"
          role="switch"
          aria-checked={newIsPublic}
          onClick={() => setNewIsPublic((value) => !value)}
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors ${
            newIsPublic
              ? "border-green/40 bg-green/10 text-green"
              : "border-line text-muted hover:text-fg"
          }`}
        >
          <span
            aria-hidden="true"
            className={`inline-block h-2 w-2 rounded-full ${
              newIsPublic ? "bg-green" : "bg-muted"
            }`}
          />
          {newIsPublic ? "Public" : "Private"}
        </button>
      </form>

      {notice ? (
        <p
          role="status"
          className="rounded-xl border border-amber/30 bg-amber/10 px-4 py-2.5 text-sm text-amber"
        >
          {notice}
        </p>
      ) : null}

      {collections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line px-6 py-14 text-center">
          <p className="text-muted">
            No shelves yet — name your first collection above.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {collections.map((row) => {
            const items = sortItems(itemsByCollection[row.id] ?? []);
            const expanded = expandedId === row.id;
            const renaming = renamingId === row.id;
            const armed = armedDeleteId === row.id;
            return (
              <li
                key={row.id}
                className="rounded-2xl border border-line bg-panel"
              >
                <div className="flex flex-wrap items-center gap-2 p-4">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(expanded ? null : row.id)
                    }
                    aria-expanded={expanded}
                    aria-label={`${expanded ? "Collapse" : "Expand"} ${row.title}`}
                    className="focus-ring rounded-lg px-1 font-mono text-xs text-muted"
                  >
                    <span aria-hidden="true">{expanded ? "▾" : "▸"}</span>
                  </button>
                  {renaming ? (
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        saveRename(row.id);
                      }}
                      className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
                    >
                      <input
                        type="text"
                        value={renameDraft}
                        onChange={(event) =>
                          onRenameChange(row.id, event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Escape") cancelRename();
                        }}
                        autoFocus
                        maxLength={80}
                        aria-label="Rename collection"
                        className={`${inputClass} max-w-md min-w-0 flex-1`}
                      />
                      <button type="submit" className={accentPill}>
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelRename}
                        className={ghostPill}
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(expanded ? null : row.id)
                        }
                        className="focus-ring min-w-0 flex-1 truncate text-left font-semibold tracking-tight transition-colors hover:text-accent"
                      >
                        {row.title}
                      </button>
                      <span className="font-mono text-xs text-muted">
                        {items.length}{" "}
                        {items.length === 1 ? "topic" : "topics"} ·{" "}
                        {row.is_public ? "Public" : "Private"}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={row.is_public}
                        aria-label={`Make ${row.title} ${
                          row.is_public ? "private" : "public"
                        }`}
                        onClick={() => void togglePublic(row)}
                        className={visibilityPill(row.is_public)}
                      >
                        <span
                          aria-hidden="true"
                          className={`inline-block h-2 w-2 rounded-full ${
                            row.is_public ? "bg-green" : "bg-muted"
                          }`}
                        />
                        {row.is_public ? "Public" : "Private"}
                      </button>
                      <button
                        type="button"
                        onClick={() => beginRename(row)}
                        className={ghostPill}
                      >
                        Rename
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteCollection(row)}
                        aria-label={
                          armed
                            ? `Confirm deleting ${row.title}`
                            : `Delete ${row.title}`
                        }
                        className={armed ? dangerPill : ghostPill}
                      >
                        {armed ? "Delete?" : "Delete"}
                      </button>
                    </>
                  )}
                </div>
                {expanded ? (
                  <div className="space-y-4 border-t border-line px-4 py-4">
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        void addTopic(row.id);
                      }}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <input
                        type="text"
                        list={`topic-picker-${row.id}`}
                        value={pickerValues[row.id] ?? ""}
                        onChange={(event) =>
                          setPickerValue(row.id, event.target.value)
                        }
                        placeholder="Add a topic by title…"
                        aria-label={`Add a topic to ${row.title}`}
                        className={`${inputClass} max-w-sm min-w-0 flex-1`}
                      />
                      <datalist id={`topic-picker-${row.id}`}>
                        {TOPICS.map((topic) => (
                          <option key={topic.slug} value={topic.title} />
                        ))}
                      </datalist>
                      <button type="submit" className={accentPill}>
                        Add
                      </button>
                    </form>
                    {items.length === 0 ? (
                      <p className="text-sm text-muted">
                        An empty shelf — add the first topic above.
                      </p>
                    ) : (
                      <ol className="space-y-2">
                        {items.map((item, index) => {
                          const label =
                            getTopic(item.topic_slug)?.title ??
                            item.topic_slug;
                          return (
                            <li
                              key={item.id}
                              className="flex flex-wrap items-center gap-3 rounded-xl border border-line px-3 py-2"
                            >
                              <span className="font-mono text-xs text-muted">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <div className="min-w-0 flex-1">
                                {getTopic(item.topic_slug) ? (
                                  <>
                                    <p className="truncate text-sm font-medium">
                                      {label}
                                    </p>
                                    <p className="truncate text-xs text-muted">
                                      {getTopic(item.topic_slug)?.tagline}
                                    </p>
                                  </>
                                ) : (
                                  <p className="truncate text-sm text-muted">
                                    Retired topic · {label}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    void moveItem(row.id, index, -1)
                                  }
                                  disabled={index === 0}
                                  aria-label={`Move ${label} up`}
                                  className={iconButton}
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void moveItem(row.id, index, 1)
                                  }
                                  disabled={index === items.length - 1}
                                  aria-label={`Move ${label} down`}
                                  className={iconButton}
                                >
                                  ↓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void removeItem(row.id, item)}
                                  aria-label={`Remove ${label}`}
                                  className={iconButton}
                                >
                                  ×
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
