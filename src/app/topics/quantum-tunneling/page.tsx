import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import QuantumTunnelingLab from "@/components/labs/QuantumTunnelingLab";
import { domainLabel, getTopic } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";
import TopicMetrics from "@/components/metrics/TopicMetrics";

export const metadata: Metadata = {
  title: "Quantum Tunneling",
  description: "A wavepacket walks through a wall it cannot climb.",
};

const topic = getTopic("quantum-tunneling")!;

const equations = [
  {
    tex: "i\\hbar\\frac{\\partial \\psi}{\\partial t} = -\\frac{\\hbar^2}{2m}\\frac{\\partial^2 \\psi}{\\partial x^2} + V(x)\\,\\psi",
    note: "The time-dependent Schrödinger equation: amplitude flows, spreads, and interferes — it never stops.",
  },
  {
    tex: "e^{-iH\\Delta t/\\hbar} \\approx e^{-iV\\Delta t/2\\hbar}\\, e^{-iT\\Delta t/\\hbar}\\, e^{-iV\\Delta t/2\\hbar}",
    note: "Split-operator factorization: kick in potential space, drift in momentum space via FFT, kick again. Symmetric to O(Δt³) and exactly unitary.",
  },
  {
    tex: "\\kappa = \\sqrt{2m(V_0 - E)}\\,/\\hbar, \\qquad T \\approx e^{-2 w \\kappa}",
    note: "Inside the wall the wave decays as e^{−κx}, so transmission falls exponentially in both height above E and width w.",
  },
  {
    tex: "R + T = 1",
    note: "Probability is conserved: whatever fails to transmit is reflected, and the absorbing skirt at the edges keeps the ledger honest.",
  },
];

const experiments = [
  "Raise “Barrier height V₀” past the dashed energy line and watch the transmitted share collapse exponentially — every notch of height multiplies the leakage down by e^{κ}.",
  "Widen “Barrier width” at fixed height and the escape tunnel shuts: T dies off like e^{−2wκ} until the packet simply ricochets whole.",
  "Push “Packet momentum k₀” above the barrier height for classical over-barrier motion — and notice the wall still reflects part of the packet, as no classical particle would.",
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

export default function QuantumTunnelingPage() {
  const related = ["heisenberg-uncertainty", "quantum-double-slit"]
    .map((slug) => getTopic(slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
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
          “E &lt; V₀ yet the particle crosses.” A Gaussian wavepacket marches
          toward a repulsive barrier taller than its own energy and has no
          business getting past — yet part of it does, every single time. This
          lab integrates the full time-dependent Schrödinger equation with a
          split-step Fourier scheme, so nothing is precomputed or faked: you
          watch amplitude pile up against the wall, leak through, and split
          into reflected and transmitted packets while R + T stays pinned to
          one.
        </p>
      </Section>

              <Section index="02" title="Interactive simulation" wide>

              <QuantumTunnelingLab />

              <ProgressToggle slug="quantum-tunneling" />
              <TopicMetrics slug="quantum-tunneling" />

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
          The packet was never purely on one side in momentum space. Confined
          to σ = 1.5 in position, it carries a momentum spread Δk = 1/(2σ), and
          that spread puts real amplitude at energies above the barrier before
          anything moves. Tunneling is not the particle borrowing energy to
          climb — it is the Fourier truth that{" "}
          <Link
            href="/topics/heisenberg-uncertainty"
            className="text-accent hover:underline focus-ring rounded-sm"
          >
            localizing here means smearing there
          </Link>
          , and time evolution merely lets the already-present high-momentum
          tail stream out the far side. The same interference bookkeeping that
          paints fringes in the{" "}
          <Link
            href="/topics/quantum-double-slit"
            className="text-accent hover:underline focus-ring rounded-sm"
          >
            double-slit experiment
          </Link>{" "}
          decides how much survives the wall.
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
