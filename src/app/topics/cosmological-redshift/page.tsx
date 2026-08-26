import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import RedshiftLab from "@/components/labs/RedshiftLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";

export const metadata: Metadata = {
  title: "Cosmological Redshift",
  description: "Space itself stretches the light moving through it.",
};

const topic = getTopic("cosmological-redshift")!;

const equations = [
  {
    tex: "a(t) = a_0\\left(1 + H_0 t\\right)",
    note: "The scale factor inflates every proper distance. This lab uses linear growth for a clean picture; real cosmology weaves together radiation, matter, and dark-energy eras where a(t) bends.",
  },
  {
    tex: "1+z = \\frac{a(t_{\\text{obs}})}{a(t_{\\text{em}})} = \\frac{\\lambda_{\\text{obs}}}{\\lambda_{\\text{em}}}",
    note: "Redshift is the ratio of the universe’s size at observation to its size at emission — light keeps the ledger of how much space it crossed.",
  },
  {
    tex: "v = H_0 d",
    note: "Hubble’s law: recession velocity is expansion rate times distance. Far enough away, v passes c — yet nothing ever moves through space faster than light.",
  },
  {
    tex: "\\frac{d\\lambda}{\\lambda} = \\frac{da}{a}",
    note: "While in flight, a photon’s wavelength grows exactly in step with the scale factor — the differential rule the simulation integrates at every timestep.",
  },
];

const experiments = [
  "Push “Emission distance χ” toward 600 px and watch z grow — then read the corner label: at high H₀ the recession speed v = H₀d exceeds c, even though the galaxy never moves through space at all.",
  "Halve “Emitted wavelength λ” mid-flight: the arriving ratio λ_obs/λ_em barely budges, proving redshift is a ratio baked in by expansion, not a fixed wavelength offset.",
  "Drag “Hubble rate H₀” toward its minimum and the universe goes nearly static — photons arrive carrying their birth wavelength and z melts toward zero.",
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

export default function CosmologicalRedshiftPage() {
  const related = relatedTopics("cosmological-redshift");
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
          “The oldest light carries a ruler.” Galaxies are not sprinting away
          from us through space; the space between us is growing underfoot. A
          photon that crosses that growth arrives stretched by exactly the
          amount the universe expanded during its journey — which is why
          redshift doubles as cosmic odometer, clock, and distance ladder all
          at once.
        </p>
      </Section>

      <Section index="02" title="Interactive simulation" wide>
        <RedshiftLab />
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
          A wavelength is a proper length — a small piece of distance riding
          the same metric as everything else. Cosmic expansion taxes it
          exactly like the gap between galaxies: each infinitesimal step of
          time multiplies both by da/a, so by arrival the stretch factor is
          simply a(t_obs)/a(t_em). No force tugs the photon, no Doppler
          recession speed enters; the wave just rides geometry that grew,
          which is why the measured ratio in the sim matches the scale-factor
          prediction to within a rounding error.
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
