import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import DissectibleEquation from "@/components/math/DissectibleEquation";
import InductionLab from "@/components/labs/InductionLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";
import TopicMetrics from "@/components/metrics/TopicMetrics";

export const metadata: Metadata = {
  title: "Electromagnetic Induction",
  description: "A falling magnet, a coil, and Faraday’s living ledger.",
};

const topic = getTopic("electromagnetic-induction")!;

const equations = [
  {
    tex: "\\Phi = B A \\cos\\theta",
    note: "Magnetic flux through one loop: field strength times area, thinned by the cosine of the tilt between the field and the loop’s normal.",
  },
  {
    tex: "\\varepsilon = -N\\frac{d\\Phi}{dt}",
    note: "Faraday’s law: every turn adds its share of EMF, and the minus sign — Lenz’s law — makes the induced current fight the very change that created it.",
  },
  {
    tex: "\\text{approach} \\Rightarrow \\text{repel}, \\quad \\text{depart} \\Rightarrow \\text{attract}",
    note: "Lenz’s law as a sign structure: an entering pole is repelled by the coil’s induced field, an exiting pole is attracted. The coil always argues with the change.",
  },
  {
    tex: "B_z(z) = \\frac{1}{2\\pi}\\frac{m}{\\left(z^2 + R^2\\right)^{3/2}}",
    note: "On-axis field of the point dipole (μ₀/4π = 1 units); flux per turn is this times πR², so the whole signal lives or dies on geometry.",
  },
  {
    tex: "N \\to 2N:\\; \\varepsilon \\to 2\\varepsilon,\\; I \\to \\tfrac{1}{2}I",
    note: "Double the turns and you double the EMF — but the longer wire also doubles the coil’s own resistance, so through a fixed load the current halves.",
  },
];

const experiments = [
  "Halve “Coil radius”: the flux funnel tightens onto the dipole’s core and the EMF spikes violently on both entry and exit.",
  "Compare “Coil turns N” at 1 versus 50 from the same height — the fifty-turn winding traces a surge fifty times taller for one identical fall.",
  "Re-drop with “Flux curve overlay” active and spot the zero-crossing: ε flips sign precisely as the magnet passes the coil’s center, where flux peaks.",
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

export default function ElectromagneticInductionPage() {
  const related = relatedTopics("electromagnetic-induction");
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
          Motion is the price of electricity here. A magnet at rest inside a
          coil generates nothing at all; move it and the flux needle leaps.
          Drop the bar through the winding and the oscilloscope catches two
          opposite surges — one as the field arrives, one as it leaves — with
          a dead zero exactly between them, at the coil’s center. Faraday’s
          law turns position into voltage by way of its time derivative, and
          Lenz’s minus sign makes sure every volt is paid for in fall.
        </p>
      </Section>

      <Section index="02" title="Explain it like I’m five">
        <p className="leading-relaxed text-fg/90">
          Waving a magnet past a coil of wire makes electricity rush through
          the wire — no battery required, motion alone does it. Sweep the
          magnet in and the rushing electricity builds its own little magnet
          that shoves yours away. Pull it back out and the new magnet grabs
          yours, begging it to stay. Hold everything still and the rushing
          stops completely. Whatever you do, the wire always answers with the
          exact opposite push.{" "}
          <strong className="text-fg">Move a magnet and electricity always argues back.</strong>
        </p>
      </Section>

              <Section index="03" title="Interactive simulation" wide>

              <InductionLab />

              <ProgressToggle slug="electromagnetic-induction" />
              <TopicMetrics slug="electromagnetic-induction" />

      </Section>

      <Section index="04" title="The equations">
        <div className="space-y-4">
          {equations.map((row, i) => (
            <DissectibleEquation
              key={row.tex}
              slug="electromagnetic-induction"
              index={i}
              tex={row.tex}
              decode={row.note}
            />
          ))}
        </div>
      </Section>

      <Section index="05" title="Why it works">
        <p className="leading-relaxed text-fg/90">
          Faraday’s minus sign is energy conservation wearing a symbol. The
          induced current always pushes against the change that made it:
          approaching poles are repelled, departing poles are courted to stay.
          Every watt delivered to the coil’s load is deducted from the falling
          magnet’s kinetic energy. Flip that sign and the story collapses — a
          falling magnet would accelerate itself, harvesting perpetual motion
          from an empty ledger. The universe declines the trade, and the
          minus sign is where it signs off.
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
