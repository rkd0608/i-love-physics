import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import AngularMomentumLab from "@/components/labs/AngularMomentumLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";

export const metadata: Metadata = {
  title: "Angular Momentum",
  description: "Arms in, spin up: the skater’s secret.",
};

const topic = getTopic("angular-momentum")!;

const equations = [
  {
    tex: "L = I\\omega = \\text{constant}",
    note: "Conservation: with no external torque about the axis, angular momentum is frozen — whatever the arms do, the product Iω cannot change.",
  },
  {
    tex: "I = \\sum m r^{2}",
    note: "Moment of inertia scales with the square of distance: a mass pulled twice as close sheds four times its contribution, which is why folding the arms bites so hard.",
  },
  {
    tex: "K_{\\text{rot}} = \\frac{L^{2}}{2I}",
    note: "Rewritten in terms of the conserved L, rotational kinetic energy GROWS as I shrinks — the spin-up is not just faster, it is energetically richer.",
  },
  {
    tex: "W_{\\text{arms}} = \\Delta K = \\frac{L^{2}}{2}\\left(\\frac{1}{I_{f}} - \\frac{1}{I_{i}}\\right)",
    note: "Work–energy attribution: the kinetic-energy gain equals exactly the work the muscles burn hauling mass inward against the swing. Nothing appears from nowhere.",
  },
];

const experiments = [
  "Press “Pull arms in” with “Friction” off and verify L stays pinned while K jumps.",
  "Enable “Friction” and watch L itself finally bleed away.",
  "Raise “Body inertia I₀” to dilute the effect of arm pulls.",
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

export default function AngularMomentumPage() {
  const related = relatedTopics("angular-momentum");
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
        <p className="text-lg leading-relaxed text-fg/90">
          “The cheapest spin-up in the universe is folding your arms.”
        </p>
        <p className="leading-relaxed text-fg/90">
          A skater on frictionless ice feels no twist from the outside world, so
          her angular momentum simply cannot change. Pull mass toward the axis
          and the moment of inertia collapses — leaving the rotation rate only
          one place to go: up. The ledger below keeps an honest account: L
          pinned, ω surging, and K climbing by precisely the work her muscles
          spend.
        </p>
      </Section>

              <Section index="02" title="Interactive simulation" wide>

              <AngularMomentumLab />

              <ProgressToggle slug="angular-momentum" />

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
          Torque-free means L is frozen — a bookkeeping entry the universe
          refuses to edit. Shrinking I then forces ω upward through Iω =
          constant, no matter how counterintuitive the surge feels. And the
          energy story closes perfectly: rewriting K as L²/2I shows it must grow
          as I falls, and the gain is exactly the work done pulling each hand
          inward against its own orbital swing — muscles, not magic. Switch on
          “Friction” and the one loophole appears: an external torque τ = −cω,
          and now L itself decays, taking the spin down with it.
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
