import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import MaxwellDemonLab from "@/components/labs/MaxwellDemonLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";

export const metadata: Metadata = {
  title: "Maxwell’s Demon",
  description: "A tiny gatekeeper who seems to beat entropy.",
};

const topic = getTopic("maxwell-demon")!;

const equations = [
  {
    tex: "T \\propto \\langle v^2 \\rangle",
    note: "Kinetic temperature is nothing but mean squared speed. The lab weighs ⟨v²⟩ separately in each chamber every fifteen frames — no thermometers required.",
  },
  {
    tex: "f(v) = 4\\pi v^2\\left(\\frac{m}{2\\pi k_B T}\\right)^{3/2} e^{-mv^2/2k_BT}",
    note: "Real gases spread their speeds along the Maxwell–Boltzmann distribution. This simulation idealizes each molecule into one fixed speed class, so the energy bookkeeping stays exact.",
  },
  {
    tex: "S = -\\sum_i p_i \\ln p_i",
    note: "Mixing entropy over four occupancy bins (chamber × speed class), shown as a percentage of its maximum ln 4. A well-stirred box reads near 100%; a fully sorted one sinks toward 50%.",
  },
  {
    tex: "E \\geq k_B T \\ln 2",
    note: "Landauer’s bound: erasing one bit of information dissipates at least this much heat. The demon’s memory fills with which-molecule-when records that must eventually be wiped.",
  },
];

const experiments = [
  "Switch “Demon sorting” off mid-gradient and watch T_L/T_R relax to 1 as the indiscriminate gate re-mixes everything the demon had separated.",
  "Crank “Hot speed” toward 260 px/s for a violent gradient — the right chamber blazes amber while the left fades to a slow cyan trickle.",
  "Spam “Reset shuffle” and race equilibration timing: how fast can pure randomness undo a gradient that took the demon twenty seconds to build?",
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

export default function MaxwellDemonPage() {
  const related = relatedTopics("maxwell-demon");
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
          Meet the demon: a creature who watches molecules and seems to break
          thermodynamics — almost. A thin wall divides the box, and a trapdoor
          at its center admits only whoever the demon approves. The policy is
          strict and a little unfair: hot (fast) molecules pass left→right
          only, cold (slow) ones right→left only. The left chamber chills while
          the right heats, and a temperature ratio that thermodynamics swore to
          equalize climbs steadily away from 1.
        </p>
      </Section>

              <Section index="02" title="Interactive simulation" wide>

              <MaxwellDemonLab />

              <ProgressToggle slug="maxwell-demon" />

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
          The sorting is real — the gradient genuinely forms, and inside the box
          entropy genuinely falls. The catch lives outside the box: to run the
          gate, the demon must measure each arriving molecule and record the
          answer in memory. Measurement is never free — it is the same currency{" "}
          <Link
            href="/topics/heisenberg-uncertainty"
            className="text-accent hover:underline focus-ring rounded-sm"
          >
            the uncertainty principle prices irreducibly
          </Link>{" "}
          — and memory is finite. When the demon’s ledger fills, erasure is
          mandatory, and Landauer’s bound charges k_BT ln 2 per bit: exactly the
          entropy the demon seemed to destroy. Information pays the bill, and
          the second law never was in danger.
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
