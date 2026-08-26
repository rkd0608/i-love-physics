import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import LogisticMapLab from "@/components/labs/LogisticMapLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";
import TopicMetrics from "@/components/metrics/TopicMetrics";

export const metadata: Metadata = {
  title: "Logistic Map",
  description: "One line of math breeding infinite order and chaos.",
};

const topic = getTopic("logistic-map")!;

const equations = [
  {
    tex: "x_{n+1} = r\\,x_n\\left(1-x_n\\right)",
    note: "The logistic recursion: one growth rate r and one multiplication decide the next generation from the last. Every structure below — steady states, cycles, chaos — is nothing but this line iterated.",
  },
  {
    tex: "x^{*} = 1 - \\frac{1}{r}",
    note: "The fixed point: feed it through the map and it reproduces itself exactly. Below r = 3 every orbit settles onto it; above r = 3 it still exists but has turned repulsive — orbits are pushed away to make room for cycles.",
  },
  {
    tex: "\\left|f'(x^{*})\\right| = \\lvert 2 - r \\rvert < 1",
    note: "Stability: the fixed point survives only while the parabola’s slope there is gentler than one in magnitude. At r = 3 the slope hits −1, a period-2 cycle is born, and the doubling cascade marches on through r ≈ 3.449, 3.544…",
  },
  {
    tex: "\\delta = \\lim_{k \\to \\infty} \\frac{r_k - r_{k-1}}{r_{k+1} - r_k} = 4.669\\ldots",
    note: "Feigenbaum’s constant: successive doublings crowd together at a universal rate shared by every one-humped map — dripping taps, circuits, fluids. The bifurcation canvas in the lab is that constant made visible.",
  },
];

const experiments = [
  "Park “Growth rate r” at 3.2, then at 3.5, and count cycle lengths — the regime label obliges with cycle-2, then cycle-4, while the cobweb staircase locks into a closed loop.",
  "Creep across r ≈ 3.5699 slowly and watch order dissolve into band-merging chaos: the bifurcation columns split, smear, then merge into solid green bands.",
  "Deep in chaos, press “Reseed”: a nudge of one part in a million splits the trajectory, and the twin races apart — the double pendulum’s one-dimensional cousin.",
];

function Section({
  index,
  title,
  wide = false,
  children,
}: {
  index: string;
  title: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`space-y-5 ${wide ? "" : "max-w-3xl"}`}>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs uppercase tracking-widest text-accent">
          {index}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

export default function LogisticMapPage() {
  const related = relatedTopics("logistic-map");
  return (
    <div className="mx-auto w-full max-w-4xl space-y-16 px-6 py-14 sm:py-20">
      <nav className="max-w-3xl">
        <Link
          href="/explore"
          className="focus-ring rounded-sm text-sm text-muted transition-colors hover:text-accent"
        >
          ← Explore
        </Link>
      </nav>

      <header className="max-w-3xl space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {topic.title}
        </h1>
        <p className="text-lg text-muted">{topic.tagline}</p>
        <p className="w-fit rounded-full border border-accent-2/30 px-3 py-1 text-xs uppercase tracking-wide text-accent-2">
          {domainLabel(topic.domain)}
        </p>
      </header>

      <Section index="01" title="Overview">
        <p className="leading-relaxed text-fg/90">
          Chaos hiding inside one multiplication. Take a number between zero and
          one — call it a population — multiply by the growth rate r, multiply
          by what remains of the room to grow, and repeat. No randomness, no
          hidden variables, no memory: a single parabola applied over and over.
          Yet slide r upward and the orbit settles, doubles, doubles again, and
          finally shatters into deterministic chaos. The lab stacks all three
          portraits at once: the bifurcation diagram surveying every r, the
          cobweb plot animating each iteration geometrically, and the time
          series ticking underneath.
        </p>
      </Section>

              <Section index="02" title="Interactive simulation" wide>

              <LogisticMapLab />

              <ProgressToggle slug="logistic-map" />
              <TopicMetrics slug="logistic-map" />

      </Section>

      <Section index="03" title="The equations">
        <div className="space-y-4">
          {equations.map((row) => (
            <figure
              key={row.tex}
              className="rounded-2xl border border-line bg-panel px-5 py-4"
            >
              <TeX tex={row.tex} block className="overflow-x-auto text-lg" />
              <figcaption className="mt-2 text-sm leading-relaxed text-muted">
                {row.note}
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section index="04" title="Why it works">
        <p className="leading-relaxed text-fg/90">
          Stability is a statement about slope. Near a fixed point, each
          iteration multiplies small deviations by f′(x*); while that slope is
          smaller than one in magnitude, errors shrink and the orbit settles.
          The moment |f′(x*)| exceeds one, the fixed point ejects its
          neighborhood — so the orbit settles instead into a cycle, until the
          cycle’s own effective slope outgrows one and doubles again. That
          cascade piles up at the Feigenbaum rate, and past it no slope tames
          anything: stretching and refolding, the same two moves the double
          pendulum performs in mid-air, happen here inside [0, 1] through
          repeated multiplication alone.
        </p>
      </Section>

      <Section index="05" title="Things to try">
        <ol className="list-decimal space-y-3 pl-5 marker:text-accent">
          {experiments.map((item) => (
            <li key={item} className="leading-relaxed text-fg/90">
              {item}
            </li>
          ))}
        </ol>
      </Section>

      <Section index="06" title="Related topics">
        <div className="grid gap-5 sm:grid-cols-2">
          {related.map((rel) => (
            <TopicCard key={rel.slug} topic={rel} />
          ))}
        </div>
      </Section>
    </div>
  );
}
