import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import HeisenbergUncertaintyLab from "@/components/labs/HeisenbergUncertaintyLab";
import { domainLabel, getTopic, type TopicMeta } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";

export const metadata: Metadata = {
  title: "Heisenberg Uncertainty",
  description: "Squeeze a wave here and it smears there.",
};

const topic = getTopic("heisenberg-uncertainty")!;

const equations = [
  {
    tex: "\\Delta x\\,\\Delta p \\geq \\frac{\\hbar}{2}",
    note: "The irreducible floor: no state of matter, however cleverly engineered, presses the product below half a quantum of action.",
  },
  {
    tex: "\\phi(p) = \\frac{1}{\\sqrt{2\\pi\\hbar}}\\int e^{-ipx/\\hbar}\\,\\psi(x)\\,dx",
    note: "The Fourier pair: momentum amplitudes are precisely the spatial frequencies of ψ — the lab computes this transform with a live radix-2 FFT.",
  },
  {
    tex: "\\psi_{\\text{gauss}}:\\; \\Delta x\\,\\Delta p = \\tfrac{\\hbar}{2}",
    note: "A pure Gaussian saturates equality exactly. Keep the chirp at zero and the badge reads minimum while the product hugs 0.500.",
  },
  {
    tex: "\\sigma_p^2 = \\langle p^2\\rangle - \\langle p\\rangle^2",
    note: "Chirp raises it: bending the phase by αx² tilts the local wavevector across the packet, inflating ⟨p²⟩ even though |ψ(x)|² never changes.",
  },
];

const experiments = [
  "Drag “Position spread σx” down to 0.2 and read Δp blow up past 2.5 in the footnote — the needle-thin packet pays instantly in momentum.",
  "Set “Chirp α” to 2 and watch the product lift off 0.500: the density curve keeps its exact shape, yet the spectrum fattens all the same.",
  "Slide “Momentum k₀” end-to-end from −6 to 6 and prove the product indifferent — boosts translate the whole spectrum without squeezing it.",
];

const related = [getTopic("quantum-tunneling"), getTopic("fourier-sound")].filter(
  (entry): entry is TopicMeta => Boolean(entry)
);

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

export default function HeisenbergUncertaintyPage() {
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
          Certainty is a currency spent in two currencies: localize a particle
          here and you automatically pay in momentum spread there. Nothing is
          being measured or disturbed in this lab — the trade is built into the
          shape of the wave itself. A Gaussian packet gets an optional quadratic
          chirp, a real FFT carries it to momentum space, and both spreads are
          weighed by honest numerical quadrature every time you touch a slider.
        </p>
      </Section>

              <Section index="02" title="Interactive simulation" wide>

              <HeisenbergUncertaintyLab />

              <ProgressToggle slug="heisenberg-uncertainty" />

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
          There is no special “uncertainty force” at work — localization{" "}
          <em>is</em> spectral width. A spike in position needs infinitely many
          wavelengths to assemble; a single crisp wavelength is smeared over all
          of space. That is the identical mathematics behind{" "}
          {" "}Fourier sound: compress either member of a conjugate pair and the
          other must stretch, with Gaussians marking the exact compromise that
          wastes nothing. The chirp cheats neither side — it only shows that
          phase curvature buys width in one currency without touching the other.
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
