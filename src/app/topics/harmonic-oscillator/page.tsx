import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import DissectibleEquation from "@/components/math/DissectibleEquation";
import HarmonicOscillatorLab from "@/components/labs/HarmonicOscillatorLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";
import TopicMetrics from "@/components/metrics/TopicMetrics";

export const metadata: Metadata = {
  title: "Harmonic Oscillator",
  description:
    "Spring, mass, repeat: the rhythm beneath all wobbles.",
};

const topic = getTopic("harmonic-oscillator")!;

const equations = [
  {
    tex: "\\ddot{x} + 2\\gamma\\,\\dot{x} + \\omega_0^2\\,x = 0",
    note: "The equation of motion: restoring pull, damping bleed, and inertia in balance.",
  },
  {
    tex: "\\omega_0 = \\sqrt{k/m}",
    note: "Stiffer springs tick faster; heavier masses tick slower — frequency cares only about this ratio.",
  },
  {
    tex: "x(t) = A\\,e^{-\\gamma t}\\cos(\\omega' t)",
    note: "Damped solution: steady ticking inside an exponential decay envelope.",
  },
  {
    tex: "\\zeta = \\frac{\\gamma}{\\omega_0}",
    note: "Damping ratio: below one the system rings, at one it returns fastest without overshoot, above one it creeps home.",
  },
  {
    tex: "Q = \\frac{\\omega_0}{2\\gamma}",
    note: "Quality factor counts how many radians of oscillation survive before the stored energy drains away.",
  },
];

const experiments = [
  "Press Pluck with “Damping γ” at zero and race the “Undamped ghost” — two traces locked in eternal agreement.",
  "Double “Mass m” while holding “Stiffness k” steady: the period grows by √2, because tempo depends only on the ratio.",
  "Push “Damping γ” upward and time the return to rest — the quickest settle with no overshoot lands exactly at critical damping.",
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

export default function HarmonicOscillatorPage() {
  const related = relatedTopics("harmonic-oscillator");
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
          Pull anything slightly from rest and it pushes back in proportion —
          that single fact makes guitar strings, suspension springs, pendulums,
          and atoms all sway to the same mathematics. The simulation hangs a
          mass on an adjustable spring, dials damping from vacuum to molasses,
          and ghosts the undamped ideal alongside so decay becomes something
          you can see rather than imagine.
        </p>
      </Section>

      <Section index="02" title="Explain it like I’m five">
        <p className="leading-relaxed text-fg/90">
          Imagine a ball dangling from a bouncy spring. Pull it down a
          little and let go. The stretchy spring pulls the ball back up
          — but the ball rushes too far and overshoots! So the spring
          pulls it back down. Overshoot again. Back and forth it goes:
          wiggle, wiggle, wiggle, always in the same rhythm. A swing
          does it. A guitar string does it. Anything that gets tugged
          home harder the farther it wanders wiggles this way, ticking
          like a little clock.
        </p>
        <p className="leading-relaxed text-fg/90">
          <strong className="text-fg">
            Everything that gets pulled home wiggles in its own steady
            rhythm.
          </strong>
        </p>
      </Section>

              <Section index="03" title="Interactive simulation" wide>

              <HarmonicOscillatorLab />

              <ProgressToggle slug="harmonic-oscillator" />
              <TopicMetrics slug="harmonic-oscillator" />

      </Section>

      <Section index="04" title="The equations">
        <div className="space-y-4">
          {equations.map((row, i) => (
            <DissectibleEquation
              key={row.tex}
              slug="harmonic-oscillator"
              index={i}
              tex={row.tex}
              decode={row.note}
            />
          ))}
        </div>
      </Section>

      <Section index="05" title="Why it works">
        <p className="leading-relaxed text-fg/90">
          Linearization is the whole trick: near any stable equilibrium, Taylor
          expansion leaves nothing but a spring, a mass, and a dashpot. That is
          why one equation scores bells, bridges, circuits, and molecules alike
          — resonance, damping ratios, and quality factors transfer unchanged
          between them all.
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
