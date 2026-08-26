import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import DopplerEffectLab from "@/components/labs/DopplerEffectLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";

export const metadata: Metadata = {
  title: "Doppler Effect",
  description: "Wavefronts bunch ahead, stretch behind.",
};

const topic = getTopic("doppler-effect")!;

const equations: { tex: string; note: ReactNode }[] = [
  {
    tex: "f' = f\\,\\frac{v}{v - v_s}",
    note: "Classical Doppler for a source moving toward a stationary listener. This page keeps the approaching side positive: the simulation writes f′ = fv/(v − vₛcosθ), where θ is the angle between the source’s velocity and the line to the observer — cosθ is +1 dead ahead and −1 dead astern.",
  },
  {
    tex: "\\lambda' = \\lambda - v_s T",
    note: "Each period T the source advances v_sT, so crests ahead are laid down closer together and crests behind farther apart. Shorter wavelength ahead, higher pitch; the reverse behind.",
  },
  {
    tex: "M = \\frac{v_s}{v},\\qquad \\sin\\mu = \\frac{v}{v_s}",
    note: "Past Mach one the emitted circles share an envelope: a cone of half-angle μ trailing the source. Inside it the wavefronts pile up into a shock front, which is why a sonic boom arrives all at once as the source passes.",
  },
  {
    tex: "f' = f\\sqrt{\\frac{1-\\beta}{1+\\beta}}",
    note: (
      <>
        For light there is no medium to carry the shift, only relative motion
        and time dilation; with β = v/c this factor replaces the classical
        ratio.{" "}
        <Link href="/topics/special-relativity" className="text-accent hover:underline">
          Special Relativity
        </Link>{" "}
        builds the light clock that makes it inevitable.
      </>
    ),
  },
];

const experiments = [
  "Push “Source speed vₛ” past 100 px/s for the boom cone — the tangent envelope snaps on exactly when M crosses 1.",
  "Move “Observer offset yₒ” off-axis and watch the shift soften ∝ approach angle, since only cosθ of the closing speed counts.",
  "Max “Emission frequency f” while supersonic for the pile-up gallery: crests stack inside the cone like rings on a stake.",
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

export default function DopplerEffectPage() {
  const related = relatedTopics("doppler-effect");
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
          The Doppler effect is the siren cheat you already own ears for:
          standing at the roadside as an ambulance sweeps past, its pitch slides
          from high to low without the siren changing a thing. The engine emits
          crest after crest on schedule, but because the vehicle advances between
          emissions, the crests ahead are packed tighter and those behind spread
          out. Watch the wavefront circles do exactly that below — then push the
          source past the wave speed and meet the boom.
        </p>
      </Section>

      <Section index="02" title="Interactive simulation" wide>
        <DopplerEffectLab />
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
          Every crest conserves its emission timing: once launched, it expands at
          the wave speed and remembers nothing of the source that made it.
          Motion simply steals spacing ahead and donates it behind — the source
          walks into its own wavefronts in front and walks away from them
          behind. Nothing about the wave changes in transit; only the delivery
          schedule at your ear shifts, which is precisely what frequency is.
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
