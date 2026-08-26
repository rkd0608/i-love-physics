import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import DissectibleEquation from "@/components/math/DissectibleEquation";
import WaveInterferenceLab from "@/components/labs/WaveInterferenceLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";
import TopicMetrics from "@/components/metrics/TopicMetrics";

export const metadata: Metadata = {
  title: "Wave Interference",
  description:
    "Superposition made visible: bright lines where waves agree.",
};

const topic = getTopic("wave-interference")!;

const equations = [
  {
    tex: "y = A\\cos(kx_1 - \\omega t) + A\\cos(kx_2 - \\omega t)",
    note: "Superposition: overlapping waves simply add, point by point, without disturbing one another.",
  },
  {
    tex: "\\Delta r = r_2 - r_1",
    note: "Path difference decides everything — it sets whether crest meets crest or crest meets trough.",
  },
  {
    tex: "d\\sin\\theta = m\\lambda",
    note: "Bright fringes appear wherever the path difference is a whole number of wavelengths.",
  },
  {
    tex: "\\beta \\approx \\frac{\\lambda L}{d}",
    note: "Fringe spacing shrinks as the slits separate and stretches as you step back from the wall.",
  },
];

const experiments = [
  "Widen “Separation d” and watch fringes crowd together — spacing falls in exact inverse proportion to the slit gap.",
  "Stretch “Wavelength λ” and the whole pattern breathes apart; long waves sketch broader bands than short ones ever can.",
  "Flip to “Intensity view” and slow “Speed” until you can see wavelets meet, agree, and erase each other along the wall.",
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

export default function WaveInterferencePage() {
  const related = relatedTopics("wave-interference");
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
          Two pebbles in a pond draw rings that argue and agree — that is
          interference, and Young showed light does it too. The simulation runs
          two coherent sources side by side, paints their combined field, and
          projects the result onto a distant wall where the geometry becomes
          something you can measure: bright bands where waves arrive in step,
          dark bands where they cancel.
        </p>
      </Section>

      <Section index="02" title="Explain it like I’m five">
        <p className="leading-relaxed text-fg/90">
          Drop two rocks in a pond. Each rock draws its own circles of
          ripples. When the circles cross, some bumps stack into bigger
          splashes and some bumps cancel out flat. That is interference:
          waves sharing the same water and simply adding together. Where
          they team up, the splash grows huge; where they fight, the water
          forgets to move. Light does the very same thing, painting bright
          and dark stripes on a wall.{" "}
          <strong className="text-fg">
            Where waves agree they grow; where they disagree they vanish.
          </strong>
        </p>
      </Section>

              <Section index="03" title="Interactive simulation" wide>

              <WaveInterferenceLab />

              <ProgressToggle slug="wave-interference" />
              <TopicMetrics slug="wave-interference" />

      </Section>

      <Section index="04" title="The equations">
        <div className="space-y-4">
          {equations.map((row, i) => (
            <DissectibleEquation
              key={row.tex}
              slug="wave-interference"
              index={i}
              tex={row.tex}
              decode={row.note}
            />
          ))}
        </div>
      </Section>

      <Section index="05" title="Why it works">
        <p className="leading-relaxed text-fg/90">
          Superposition is linearity in action: because the wave equation
          admits sums of solutions as solutions, interference is pure phase
          bookkeeping. Where phases align amplitudes double; where they oppose
          they vanish — yet no energy disappears, it simply relocates into the
          bright fringes.
        </p>
      </Section>

      <Section index="06" title="Things to try">
        <ol className="list-decimal space-y-3 pl-5 marker:text-accent">
          {experiments.map((item) => (
            <li key={item} className="leading-relaxed text-fg/90">
              {item}
            </li>
          ))}
        </ol>
      </Section>

      <Section index="07" title="Related topics">
        <div className="grid gap-5 sm:grid-cols-2">
          {related.map((rel) => (
            <TopicCard key={rel.slug} topic={rel} />
          ))}
        </div>
      </Section>
    </div>
  );
}
