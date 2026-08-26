import type { Metadata } from "next";
import ExploreClient from "@/components/explore/ExploreClient";
import { TOPICS } from "@/lib/topics";

export const metadata: Metadata = {
  title: "Explore",
  description: "Search and filter the collection of interactive physics topics.",
};

export default function ExplorePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-20">
      <header className="max-w-2xl space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Explore the collection
        </h1>
        <p className="text-lg text-muted">
          Five living phenomena, every dial exposed. Search by idea or browse by
          branch of physics.
        </p>
      </header>
      <ExploreClient topics={TOPICS} />
    </div>
  );
}
