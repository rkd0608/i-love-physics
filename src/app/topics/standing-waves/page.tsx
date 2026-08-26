import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import DissectibleEquation from "@/components/math/DissectibleEquation";
import StandingWavesLab from "@/components/labs/StandingWavesLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";
import TopicMetrics from "@/components/metrics/TopicMetrics";

export const metadata: Metadata = {
  title: "Standing Waves",
  description: "A string picks only the notes its length allows.",
};

const topic = getTopic("standing-waves")!;

const equations = [
  {
    tex: "y(x,t) = 2A\\sin(kx)\\cos(\\omega t)",
    note: "Two identical waves travelling opposite ways superpose into a shape that never travels: nodes stay pinned while antinodes breathe between the extremes of the envelope.",
  },
  {
    tex: "\\lambda_n = \\frac{2L}{n}",
    note: "Pinned ends demand zero displacement at both walls, so a whole number of half-wavelengths must fit on the string — every other wavelength destroys itself on reflection.",
  },
  {
    tex: "f_n = \\frac{nv}{2L}",
    note: "Each allowed wavelength rides the same wave speed, so the spectrum collapses to discrete pitches spaced one fundamental apart: the harmonic comb.",
  },
  {
    tex: "v = \\sqrt{T/\\mu}",
    note: "The lab reads v directly, but on a real string it comes from tension and mass density — tighten the string and every pitch climbs together.",
  },
];

const experiments = [
  {
    id: "sweep-harmonic",
    body: (
      <>
        Sweep “Harmonic n” from 1 to 6 and count violet node dots appear — mode
        n always carries exactly n − 1 interior nodes and n amber antinodes.
      </>
    ),
  },
  {
    id: "raise-speed",
    body: (
      <>
        Raise “Wave speed v” and watch every f_n climb pitch-wise — the whole
        comb slides upward without changing which notes exist.
      </>
    ),
  },
  {
    id: "add-octave",
    body: (
      <>
        Enable “Add octave” and meet your first chord: the sum is still a
        standing wave, a two-note timbre preview of{" "}
        <Link
          href="/topics/fourier-sound"
          className="text-accent hover:underline"
        >
          fourier-sound
        </Link>
        .
      </>
    ),
  },
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

export default function StandingWavesPage() {
  const related = relatedTopics("standing-waves");
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
          Resonance is geometry refusing other answers. Wiggle one end of a
          fixed string and almost nothing happens: each wiggle races down,
          flips at the far wall, and returns out of step with itself, so the
          cancellations eat it alive. Only special rhythms survive — the ones
          whose reflections arrive exactly in phase. The string then quits
          travelling altogether and settles into a shape that stands still and
          swings in place, its nodes nailed to the walls’ decree.
        </p>
      </Section>

      <Section index="02" title="Explain it like I’m five">
        <p className="leading-relaxed text-fg/90">
          Tie a jump rope to a doorknob and shake it. Most shakes race down,
          flip at the door, and come back jumbled, so the rope just flops.
          Shake at exactly the right rhythm, though, and the rope stops
          travelling. It holds a still shape — one big arch, or two, or three
          — swinging in place, with dots along it that refuse to move. A
          guitar string only sings those special shapes, and each shape is one
          note.{" "}
          <strong className="text-fg">
            Only special shakes survive, and each survivor is one note.
          </strong>
        </p>
      </Section>

              <Section index="03" title="Interactive simulation" wide>

              <StandingWavesLab />

              <ProgressToggle slug="standing-waves" />
              <TopicMetrics slug="standing-waves" />

      </Section>

      <Section index="04" title="The equations">
        <div className="space-y-4">
          {equations.map((row, i) => (
            <DissectibleEquation
              key={row.tex}
              slug="standing-waves"
              index={i}
              tex={row.tex}
              decode={row.note}
            />
          ))}
        </div>
      </Section>

      <Section index="05" title="Why it works">
        <p className="leading-relaxed text-fg/90">
          Boundary conditions quantize allowed wavelengths. “Both ends fixed”
          is a single geometric demand, yet it filters a continuum of possible
          waves down to a countable family λ_n = 2L/n — nothing else can meet
          itself in phase after a round trip. Replace the walls with potential
          barriers and the string with an electron, and the identical
          mathematics boxes the particle into discrete states: the quantum well
          is this lab played with wavefunctions.
        </p>
      </Section>

      <Section index="06" title="Things to try">
        <ol className="list-decimal space-y-3 pl-5 marker:text-accent">
          {experiments.map((item) => (
            <li key={item.id} className="leading-relaxed text-fg/90">
              {item.body}
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
