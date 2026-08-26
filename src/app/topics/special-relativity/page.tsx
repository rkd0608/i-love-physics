import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import SpecialRelativityLab from "@/components/labs/SpecialRelativityLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";

export const metadata: Metadata = {
  title: "Special Relativity",
  description: "One clock, two frames, and light keeping its promise.",
};

const topic = getTopic("special-relativity")!;

const equations = [
  {
    tex: "\\gamma = \\frac{1}{\\sqrt{1-\\beta^2}}",
    note: "The Lorentz factor: with β = v/c it idles near 1 at everyday speeds, then climbs without bound as β closes in on 1.",
  },
  {
    tex: "\\Delta t = \\gamma\\,\\Delta\\tau",
    note: "Time dilation: a clock sliding past you logs Δτ of proper time while your lab waits Δt — each of its light-clock bounces takes longer.",
  },
  {
    tex: "L = \\frac{L_0}{\\gamma}",
    note: "Length contraction: a rod of rest length L₀ measures shorter along its motion, while any height across the motion is left untouched.",
  },
  {
    tex: "s^2 = c^2 t^2 - x^2",
    note: "The invariant interval: observers disagree freely about t and x, yet every one of them computes the same s² — spacetime’s fixed yardstick.",
  },
  {
    tex: "\\beta_{\\text{sum}} = \\frac{\\beta_1 + \\beta_2}{1 + \\beta_1 \\beta_2}",
    note: "Velocity addition: stack two speeds however you like and the combination still lands below c — light’s lead is untouchable.",
  },
];

const experiments = [
  "Push “Speed β” to 0.99: γ swells past seven, the moving photon crawls through long shallow diagonals, and its tick row falls visibly behind the resting clock’s.",
  "Toggle “Length contraction” off and on to swap the ghost outline for the squashed solid rod, then watch it shrink toward a sliver as β rises.",
  "Press “Sync flashes” to zero both clocks, then race the tick rows below and note how the gap widens steadily — the seed of the twin paradox.",
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

export default function SpecialRelativityPage() {
  const related = relatedTopics("special-relativity");
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
          Light is the stubborn one: chase it as hard as you like and it still
          recedes at exactly c. Einstein took that stubbornness literally and
          asked what else has to give. His answer was: not light. Strap a
          photon between two mirrors and you hold a clock; slide that clock
          sideways and the photon must trace a longer, slanted path at the same
          unchanging speed, so every tick stretches. That stretch is time
          dilation, and its sibling length contraction keeps the ledger
          balanced between frames.
        </p>
      </Section>

      <Section index="02" title="Interactive simulation" wide>
        <SpecialRelativityLab />
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
          Nothing inside the moving clock slows down — the mirrors are perfect
          and the photon relentless. What flexes is the spacetime metric
          itself. Because s² = c²t² − x² must come out identical for every
          inertial observer, a worldline tilted toward the space direction pays
          by dilating its time direction; clocks are just honest instruments
          reporting the geometry they ride through. The traveling twin of the{" "}
          <Link
            href="/topics/twin-paradox"
            className="focus-ring rounded-sm text-accent transition-colors hover:text-fg"
          >
            twin paradox
          </Link>{" "}
          ages less for precisely this reason: the tilted worldline accumulates
          less proper time between departure and reunion.
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
