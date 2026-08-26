import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import MagneticDipoleLab from "@/components/labs/MagneticDipoleLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";

export const metadata: Metadata = {
  title: "Magnetic Dipole",
  description: "One dipole’s field map, read by a compass lattice.",
};

const topic = getTopic("magnetic-dipole")!;

const equations = [
  {
    tex: "\\vec{B} = \\frac{\\mu_0 m}{4\\pi r^3}\\left(3\\cos\\theta\\,\\hat{r} - \\hat{m}\\right)",
    note: "The dipole field in compact polar form — identical to 3(m·r̂)r̂ − m over 4πr³. Strength falls off as one over distance cubed, the steepest falloff this side of a monopole.",
  },
  {
    tex: "\\vec{\\tau} = \\vec{m} \\times \\vec{B}",
    note: "A compass needle feels torque of magnitude mB sinθ, always turning its north pole toward the local field direction and vanishing exactly at alignment.",
  },
  {
    tex: "U = -\\vec{m}\\cdot\\vec{B}",
    note: "Alignment is not luck but economics: energy bottoms out when m points along B, so every needle is rolling downhill toward its own lowest-energy heading.",
  },
  {
    tex: "t_{\\text{align}} \\approx \\frac{2}{c}",
    note: "With light damping the ring-down envelope decays like e^(−ct/2), so doubling “Needle damping” halves the time the lattice needs to forget a kick.",
  },
];

const experiments = [
  "Sweep “Dipole tilt” slowly across its range and watch the lattice ripple into new order as all eighty-four compasses re-aim at once.",
  "Drop “Needle damping” to its minimum for ringing: needles overshoot the field direction and swing back in ever-smaller arcs before settling.",
  "Press “Perturb needles” mid-tilt and watch re-alignment waves fan out from the strong-field cells near the magnet while the corners drift in last.",
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

export default function MagneticDipolePage() {
  const related = relatedTopics("magnetic-dipole");
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
          Iron filings are analog computers: sprinkle them around a magnet and
          each filing becomes a tiny compass that solves the field equation for
          you. This lab replaces the filings with eighty-four digital needles on
          a grid, each one integrating the same damped-pendulum tug its metal
          cousin would feel. Tilt the dipole and the whole lattice renegotiates
          its arrangement in plain sight.
        </p>
      </Section>

              <Section index="02" title="Interactive simulation" wide>

              <MagneticDipoleLab />

              <ProgressToggle slug="magnetic-dipole" />

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
          The torque τ = m × B seeks the energy minimum U = −m·B, which sits at
          perfect alignment with the local field — so the lattice becomes a
          self-drawing field map without anyone plotting a single arrow by hand.
          Damping decides how the needles travel there: heavily damped ones glide
          straight into place, lightly damped ones ring like tiny bells around
          their target heading before settling.
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
