import Link from "next/link";
import TeX from "@/components/math/TeX";
import { COLLECTIONS, DOMAINS, type TopicMeta } from "@/lib/topics";

const LEVEL_DOTS: Record<number, string> = { 1: "●○○", 2: "●●○", 3: "●●●" };

export default function TopicCard({ topic }: { topic: TopicMeta }) {
  const domain = DOMAINS.find((d) => d.id === topic.domain);
  const collections = COLLECTIONS.filter((c) => topic.collections.includes(c.id));
  return (
    <Link
      href={`/topics/${topic.slug}`}
      className="group block rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-accent/40 focus-ring"
      style={{ borderLeft: `3px solid ${topic.accent}` }}
    >
      <p className="text-xs uppercase tracking-widest" style={{ color: domain?.accent }}>
        {domain?.label ?? topic.domain}
      </p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight transition-colors group-hover:text-accent">
        {topic.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{topic.tagline}</p>
      {collections.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {collections.map((c) => (
            <span
              key={c.id}
              className="rounded-full border border-accent/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted"
            >
              {c.label}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-3 overflow-x-auto opacity-80">
        <TeX tex={topic.equations[0]} />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="font-mono text-xs text-muted">{topic.tags.join(" · ")}</p>
        <span
          aria-label={`Level ${topic.level}`}
          title={`Level ${topic.level}`}
          className="shrink-0 font-mono text-[10px] tracking-widest text-muted"
        >
          {LEVEL_DOTS[topic.level]}
        </span>
      </div>
    </Link>
  );
}
