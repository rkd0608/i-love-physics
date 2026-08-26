import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import CoupledModesLab from "@/components/labs/CoupledModesLab";
import { domainLabel, getTopic } from "@/lib/topics";
import type { TopicMeta } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";

export const metadata: Metadata = {
  title: "Coupled Oscillators",
  description:
    "Push one mass, watch energy learn to share.",
};

const topic = getTopic("coupled-modes")!;

const related = [
  getTopic("harmonic-oscillator"),
  getTopic("wave-interference"),
].filter((t): t is TopicMeta => Boolean(t));

const equations = [
  {
    tex: "\\ddot{x}_1 = -k(2x_1 - x_2),\\quad \\ddot{x}_2 = -k(2x_2 - x_1)",
    note: "The coupled pair: each mass feels its own wall spring plus the tug of its neighbour through the coupling spring — pull one and the other cannot stay indifferent.",
  },
  {
    tex: "q_{\\pm} = \\tfrac{1}{2}(x_1 \\pm x_2)",
    note: "The modal transform: stretch together (q₊) or oppose (q₋) and the coupling drops out of the bookkeeping entirely.",
  },
  {
    tex: "\\omega_{+} = \\sqrt{k/m},\\quad \\omega_{-} = \\sqrt{3k/m}",
    note: "Eigenfrequencies: the symmetric mode never stretches the middle spring, while the antisymmetric mode stretches it double — hence the factor of √3.",
  },
  {
    tex: "T_{\\text{beat}} = \\frac{2\\pi}{|\\omega_- - \\omega_+|}",
    note: "Beat period: the tempo at which the energy bars slosh between the masses, set only by how far apart the two modal frequencies sit.",
  },
];

const experiments = [
  "Leave “Pull mass 1” at 1 and “Pull mass 2” at 0, then press Release: the maximal one-mass pluck, pouring energy across the coupling spring and back on every beat.",
  "Make the pulls EQUAL to excite the pure symmetric mode — both masses breathe in unison, the coupling spring never stretches, and the energy bars freeze in place.",
  "Make them OPPOSITE for the pure antisymmetric mode: a fast shiver about a motionless centre, three times the frequency and no transfer at all.",
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

export default function CoupledModesPage() {
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
        <p className="text-lg leading-relaxed text-fg/90">
          “Sympathy between springs.”
        </p>
        <p className="leading-relaxed text-fg/90">
          Pluck one mass of a coupled pair and, swing by swing, it falls almost
          still while the second takes up the motion — energy crossing the
          coupling spring on a clean, predictable beat rhythm. The lab
          decomposes whatever starting pulls you choose into a symmetric and an
          antisymmetric mode, then rebuilds the motion from their closed-form
          superposition, frame by frame.
        </p>
      </Section>

              <Section index="02" title="Interactive simulation" wide>

              <CoupledModesLab />

              <ProgressToggle slug="coupled-modes" />

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
          Symmetry diagonalizes the system. Because the two masses are equal
          and identically anchored, the sum and difference of their positions
          each evolve as an independent{" "}
          <Link
            href="/topics/harmonic-oscillator"
            className="focus-ring rounded-sm text-accent transition-colors hover:text-fg"
          >
            harmonic oscillator
          </Link>{" "}
          — one slow (symmetric), one fast (antisymmetric). Superposition does
          the rest: any motion is a blend of the two pure modes, and their slow
          phase drift beats like the overlapping wavelets of{" "}
          <Link
            href="/topics/wave-interference"
            className="focus-ring rounded-sm text-accent transition-colors hover:text-fg"
          >
            wave interference
          </Link>
          . Nothing more mysterious than bookkeeping in better coordinates.
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
