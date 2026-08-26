import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import QuantumDoubleSlitLab from "@/components/labs/QuantumDoubleSlitLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";

export const metadata: Metadata = {
  title: "Quantum Double-Slit",
  description:
    "One particle at a time builds an interference pattern.",
};

const topic = getTopic("quantum-double-slit")!;

const equations = [
  {
    tex: "|\\psi|^2 = \\left|\\psi_1 + \\psi_2\\right|^2",
    note: "The probability comes from squaring the sum of amplitudes, never the sum of squares — the cross term is the interference.",
  },
  {
    tex: "d\\sin\\theta = m\\lambda",
    note: "Bright fringes land wherever the two paths differ by a whole number of wavelengths; between them the cos² probability falls to zero.",
  },
  {
    tex: "\\Delta y = \\frac{\\lambda L}{d}",
    note: "Fringe spacing on the wall: halve the slit separation and every band doubles in width. Check it against the live readout under the sim.",
  },
  {
    tex: "\\mathcal{V}^2 + D^2 \\leq 1",
    note: "Complementarity’s ledger: fringe visibility V and which-path distinguishability D trade off, so full knowledge of the path forces V to zero.",
  },
];

const experiments = [
  "Crank “Emission rate” toward 1000 and watch hundreds of solitary dots per second quietly organize into bands no individual particle ever planned.",
  "Flip “Which-path camera” on mid-run and watch the fringes melt into a featureless hump — the dots were never interfering; their amplitudes were.",
  "Halve “Slit separation d” and re-measure Δy against the live readout: every fringe doubles in width, exactly as λL/d demands.",
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

export default function QuantumDoubleSlitPage() {
  const related = relatedTopics("quantum-double-slit");
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
          Each electron lands alone; the pattern belongs to none of them. Fire
          them singly at a pair of slits and every arrival is one crisp dot —
          yet thousands of dots later, bands of many and none emerge as if each
          particle had interfered with itself. The simulation samples exactly
          this lottery: raise the emission rate to speed the buildup, flip on a
          which-path camera to unmake the fringes, and measure the spacing
          against Δy for yourself.
        </p>
      </Section>

              <Section index="02" title="Interactive simulation" wide>

              <QuantumDoubleSlitLab />

              <ProgressToggle slug="quantum-double-slit" />

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
          Amplitudes add before squaring. While nobody watches, each particle
          travels as ψ₁+ψ₂ — two indistinguishable stories whose sum paints the
          cos² bands. Switch on the which-path camera and the stories become
          distinguishable, destroying the second amplitude: probabilities now
          add where amplitudes used to, the fringes die, and only the smooth
          single-slit envelope remains. Nature enforces that bargain without
          exception — and the same accounting of amplitudes sneaking through
          impossible territory continues in{" "}
          <Link
            href="/topics/quantum-tunneling"
            className="focus-ring rounded-sm text-accent transition-colors hover:text-fg"
          >
            Quantum Tunneling
          </Link>
          .
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
