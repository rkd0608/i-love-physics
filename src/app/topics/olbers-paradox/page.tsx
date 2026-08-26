import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import OlbersParadoxLab from "@/components/labs/OlbersParadoxLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";
import TopicMetrics from "@/components/metrics/TopicMetrics";

export const metadata: Metadata = {
  title: "Olbers’ Paradox",
  description: "Infinite stars should set the night ablaze. Why dark?",
};

const topic = getTopic("olbers-paradox")!;

const equations = [
  {
    tex: "\\Delta F = nL\\,dr",
    note: "Each shell of thickness dr adds the same flux: its stars are farther and each one dimmer by inverse squares, but the shell holds proportionally more of them. The cancellation is exact, so ΔF is a constant.",
  },
  {
    tex: "F = \\int_0^{R} nL\\,dr = nLR",
    note: "Total flux climbs linearly with how far you look — double the reach, double the glare. Let an eternal, static universe run R to infinity and every line of sight ends on a stellar surface.",
  },
  {
    tex: "F_{\\text{age}} = nLR_{\\text{age}} < nLR",
    note: "The cutoff that actually happens: light from shells beyond the age horizon hasn’t had time to arrive. The integral stops at R_age, and the received flux stays finite while the sky stays dark.",
  },
  {
    tex: "\\Delta F_z = \\frac{nL\\,dr}{(1+z)^{4}}",
    note: "Expansion piles on from there. Cosmological redshift stretches each photon’s wavelength and thins its arrival rate, taxing distant shells by an extra factor of (1+z)⁴ on top of everything else.",
  },
];

const experiments = [
  "Switch “Apply 1/r² dimming” OFF and confirm the bar doesn’t budge: every bar keeps its exact height, because each shell was contributing the same ΔF all along — dimming was never the point.",
  "Pull “Horizon radius” inward until darkness returns — outer shells flip to hollow dashed outlines, their bars stop filling, and F freezes at nLR_age.",
  "Set “Shell count” to 20 with “Horizon radius” at 20 for the blinding limit: every shell lit, F climbing one honest ΔF per shell, and no horizon left to save your retinas.",
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

export default function OlbersParadoxPage() {
  const related = relatedTopics("olbers-paradox");
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
          The night sky is a 400-year-old scandal. Kepler grumbled about it in
          1610, Halley and Chéseaux sharpened it, and Olbers lent it his name:
          in an eternal, static universe sprinkled forever with stars, every
          line of sight should end on a stellar surface, and the whole sky
          should blaze as bright as the Sun. It doesn’t. Below, the paradox is
          built shell by shell — concentric rings of stars around a lone
          observer, each ring paying exactly the same flux — and then broken by
          the one ingredient the classical cosmos was missing: a beginning.
        </p>
      </Section>

              <Section index="02" title="Interactive simulation" wide>

              <OlbersParadoxLab />

              <ProgressToggle slug="olbers-paradox" />
              <TopicMetrics slug="olbers-paradox" />

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
          Inverse-square dimming is the decoy. Yes, each star fades as 1/r² —
          but the number of stars in the shell at distance r grows as r², and
          the two cancel to the digit. That is why flipping “Apply 1/r² dimming”
          leaves the flux bar untouched: per-star brightness was always exactly
          cancelled by star dilution, so no amount of turning stars down can
          make the total turn off. What saves our retinas is history, not
          optics. A finite cosmic age means shells beyond the horizon simply
          haven’t delivered their light yet — F is capped at nLR_age — and the
          expansion of the universe dilutes what does arrive through redshift.
          The darkness overhead isn’t the absence of stars; it’s a timestamp.
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
