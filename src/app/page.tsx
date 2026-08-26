import type { Metadata } from "next";
import Link from "next/link";
import TopicCard from "@/components/explore/TopicCard";
import Hero from "@/components/home/Hero";
import { DOMAINS, TOPICS } from "@/lib/topics";

export const metadata: Metadata = {
  title: { absolute: "i love physics" },
  description:
    "Cinematic physics you can grab: interactive simulations with live equations.",
};

const featuredSlugs = ["special-relativity", "quantum-tunneling", "double-pendulum"];

const steps = [
  {
    index: "01",
    name: "Watch",
    copy: "Cinematic sims run in your browser at 60fps.",
  },
  {
    index: "02",
    name: "Drag",
    copy: "Every parameter is live — pull it and watch the physics answer.",
  },
  {
    index: "03",
    name: "Derive",
    copy: "Equations update alongside, term by term.",
  },
];

export default function HomePage() {
  const featured = TOPICS.filter((topic) => featuredSlugs.includes(topic.slug));
  return (
    <>
      <Hero />
      <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-16">
        <p className="text-center font-mono text-xs tracking-widest text-muted">
          34 topics · 8 domains · 90-term glossary
        </p>
        <section>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Featured
            </h2>
            <Link
              href="/explore"
              className="focus-ring rounded-sm text-sm text-muted transition-colors hover:text-accent"
            >
              All topics →
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((topic) => (
              <TopicCard key={topic.slug} topic={topic} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Browse by domain
          </p>
          <nav aria-label="Browse by domain" className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {DOMAINS.map((domain) => (
              <Link
                key={domain.id}
                href="/explore"
                className="focus-ring rounded-sm text-sm text-muted transition-colors hover:text-fg"
              >
                {domain.label}
              </Link>
            ))}
          </nav>
        </section>

        <section className="mt-16 rounded-3xl border border-line bg-panel p-6 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            How this works
          </h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.name}>
                <p className="font-mono text-xs uppercase tracking-widest text-accent">
                  {step.index}
                </p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">
                  {step.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 flex flex-col items-center gap-4 rounded-3xl border border-accent/25 bg-accent/5 px-6 py-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to pull on the laws of nature?
          </h2>
          <p className="max-w-md text-muted">
            Every dial exposed, every equation one glance away.
          </p>
          <Link
            href="/explore"
            className="focus-ring mt-2 rounded-full bg-accent px-6 py-3 font-medium text-[#04121a] transition hover:brightness-110"
          >
            Start exploring →
          </Link>
        </section>
      </div>
    </>
  );
}
