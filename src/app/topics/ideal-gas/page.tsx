import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import DissectibleEquation from "@/components/math/DissectibleEquation";
import IdealGasLab from "@/components/labs/IdealGasLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";
import TopicMetrics from "@/components/metrics/TopicMetrics";

export const metadata: Metadata = {
  title: "Ideal Gas",
  description: "Piston, particles, and pressure you can watch build.",
};

const topic = getTopic("ideal-gas")!;

const equations = [
  {
    tex: "PV = nRT",
    note: "The whole subject in three symbols. This lab never writes it down internally — the piston simply drifts until the wall impacts say so, and the law appears on its own.",
  },
  {
    tex: "P = \\frac{J}{A\\,\\tau} = n m \\langle v_x^2 \\rangle",
    note: "Pressure as momentum flux: add up every impulse J the molecules deliver to a wall of area A over a window τ and divide. The chamber’s gauge does exactly this — a rolling half-second ledger of piston impacts, no averaging tricks.",
  },
  {
    tex: "v_{\\text{rms}} = \\sqrt{\\frac{3k_B T}{m}}",
    note: "Temperature is mean squared speed in disguise. The “Temperature T” slider targets this v_rms directly and rescales every molecule’s velocity in one sweep — heating without touching positions.",
  },
  {
    tex: "P \\propto \\frac{1}{V} \\quad (T \\text{ fixed})",
    note: "Boyle’s limit. Fewer cubic centimeters means molecules meet the piston more often, so the impact rate per area climbs in exact inverse proportion to volume — visible as the piston sagging inward when you load it.",
  },
  {
    tex: "\\Delta S = n R \\ln\\!\\left(\\frac{V_f}{V_i}\\right)",
    note: "Free expansion’s bill. Release the latch and the gas doubles its volume for free — no work done, no temperature change — yet the entropy rises all the same, because knowing where each molecule used to be is information the universe no longer has.",
  },
];

const experiments = [
  "Freeze “Temperature T”, then raise “External pressure Pₑₓₜ” and watch V shrink — squeeze the load up and the piston surrenders volume exactly along Boyle’s hyperbola.",
  "Press “Release latch” to lock the piston at fixed volume, then crank “Temperature T” and read the measured pressure climbing in a straight line through the origin.",
  "Press “Release latch” and argue about where the entropy went: nothing cools, nothing heats, the energy ledger balances perfectly — and the gas still ends up irreversibly spread.",
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

export default function IdealGasPage() {
  const related = relatedTopics("ideal-gas");
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
          Pressure is molecules doing statistics on a wall. No single molecule
          knows anything about the weather it makes — each one just flies
          straight, bounces, and hands the piston a tiny packet of momentum.
          Multiply those packets by their arrival rate and something uncanny
          happens: out of trillions of aimless deliveries emerges a number
          steady enough to push a piston, compress a spring, or hold up a
          locomotive. This chamber holds a few hundred of them, honest gauge
          included, so you can watch the ideal gas law assemble itself one wall
          impact at a time.
        </p>
      </Section>

      <Section index="02" title="Explain it like I’m five">
        <p className="leading-relaxed text-fg/90">
          Air is made of zillions of tiny bouncy balls you can’t see. Each one
          flies straight until it smacks into something. Warm balls zoom and
          jiggle fast; cold balls crawl. Every time a ball smacks the wall of
          its box it gives the wall one teeny push. Zillions of those pushes
          every second add up to one steady shove you can actually feel —
          that’s pressure. Squeeze the box smaller and the balls meet the wall
          more often, so the shoving gets stronger.{" "}
          <strong className="text-fg">
            Temperature is just how fast the tiny balls jiggle.
          </strong>
        </p>
      </Section>

              <Section index="03" title="Interactive simulation" wide>

              <IdealGasLab />

              <ProgressToggle slug="ideal-gas" />
              <TopicMetrics slug="ideal-gas" />

      </Section>

      <Section index="04" title="The equations">
        <div className="space-y-4">
          {equations.map((row, i) => (
            <DissectibleEquation
              key={row.tex}
              slug="ideal-gas"
              index={i}
              tex={row.tex}
              decode={row.note}
            />
          ))}
        </div>
      </Section>

      <Section index="05" title="Why it works">
        <p className="leading-relaxed text-fg/90">
          Nobody here solves for the collective trajectory of the gas — that
          problem is hopeless by{" "}
          <Link
            href="/topics/three-body"
            className="text-accent hover:underline focus-ring rounded-sm"
          >
            the three-body standard
          </Link>{" "}
          and ours has two hundred bodies. Instead the lab keeps a humble
          ledger: every time a molecule rebounds off the piston it deposits
          twice its approach momentum, and a rolling half-second window sums
          the deposits into a pressure reading. Time-averaged impulses recover
          the exact gas law without ever solving global trajectories — the
          statistics do all the bookkeeping. Equilibrium is not declared, it is
          discovered: the piston slides wherever the imbalance
          P_measured − P_ext sends it and stops precisely where the two agree.
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
