import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import DiffusionWalkLab from "@/components/labs/DiffusionWalkLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";
import TopicMetrics from "@/components/metrics/TopicMetrics";

export const metadata: Metadata = {
  title: "Diffusion & Random Walks",
  description: "Ten thousand drunk walkers draw a Gaussian.",
};

const topic = getTopic("diffusion-random-walk")!;

const equations = [
  {
    tex: "\\langle x^2 \\rangle = 2Dt",
    note: "Random-walk variance: after N uncorrelated steps of size s the spread squared is Ns², and with N = t/Δt ticks that is exactly 2Dt once D = s²/(2Δt). The lab’s footnote pits this prediction against the measured ⟨x²⟩ every few frames.",
  },
  {
    tex: "c(x,t) = \\frac{n}{\\sqrt{4\\pi Dt}}\\,e^{-x^2/4Dt}",
    note: "The point-source solution of the diffusion equation: total n conserved, peak falling as 1/√t while the width grows as √t. The dashed white overlay draws it live against the binned ensemble.",
  },
  {
    tex: "D = \\mu k_B T",
    note: "Einstein’s 1905 relation: the same thermal jostling that scatters walkers also meets viscous drag, with mobility μ linking the two. Measure a diffusion coefficient, out comes Boltzmann’s constant — jitter and friction are one coin.",
  },
  {
    tex: "X_N = \\sum_{i=1}^{N} \\xi_i \\;\\Rightarrow\\; \\mathcal{N}\\!\\left(0,\\,N\\sigma^2\\right)",
    note: "The central limit theorem’s verdict: sum enough independent steps of any law with finite variance and the total is Gaussian, its width set by that variance alone. The bell does not care how the chaos underneath is wired.",
  },
];

const experiments = [
  "Double “Step size” and check the footnote: width grows √2 faster per tick, because x_rms = s·√(t/Δt) scales linearly in the step while the clock keeps ticking at the same rate.",
  "Drop “Walkers” to 200 and watch the bell go noisy while its center stays honest — relative roughness scales as 1/√N, but the mean of a fair coin never drifts.",
  "Toggle off “Histogram view” for the drunkard’s ballet: every individual walker stays perfectly unpredictable, yet their stacked census hugs the dashed Gaussian all the same.",
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

export default function DiffusionRandomWalkPage() {
  const related = relatedTopics("diffusion-random-walk");
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
          Every walker on the axis obeys exactly one rule: each tick, lurch left
          or right on a fair coin — no plan, perfect prediction anyway. A single
          path is hopeless noise, forecastable by nobody. But release an
          ensemble from the origin and a shape condenses out of the chaos: a
          Gaussian bell, centered exactly where the crowd began, widening like
          the square root of time. That bell is diffusion itself — perfume
          through a room, heat along a rod, neutrons through a shield — computed
          here by nothing but coin flips.
        </p>
      </Section>

              <Section index="02" title="Interactive simulation" wide>

              <DiffusionWalkLab />

              <ProgressToggle slug="diffusion-random-walk" />
              <TopicMetrics slug="diffusion-random-walk" />

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
          The central limit theorem converts total chaos into a bell whose width
          you can compute from a single number — the step. Each walker’s
          position is a running sum of independent ±s coin flips, and sums of
          independent randomness shed their microscopic details until only the
          one universal distribution remains, with variance equal to the sum of
          the parts: ⟨x²⟩ = Ns² = 2Dt. Nothing in the lab solves the diffusion
          equation ∂c/∂t = D∂²c/∂x²; the equation emerges bottom-up, thousands
          of times per second, from arithmetic too simple to fail.
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
