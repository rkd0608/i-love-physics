import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import CarnotCycleLab from "@/components/labs/CarnotCycleLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";

export const metadata: Metadata = {
  title: "Carnot Cycle",
  description: "Two isotherms, two adiabats, one perfect engine.",
};

const topic = getTopic("carnot-cycle")!;

const equations = [
  {
    tex: "PV = nRT",
    note: "Isotherm: at fixed temperature the pressure falls hyperbolically as the gas expands — strokes one and three ride these curves at T_h and T_c.",
  },
  {
    tex: "PV^{\\gamma} = \\text{const}",
    note: "Adiabat: with no heat exchanged, expansion spends internal energy, so pressure drops faster than on an isotherm — here γ = 5⁄3 for a monatomic gas.",
  },
  {
    tex: "\\eta = 1 - \\frac{T_c}{T_h}",
    note: "Carnot efficiency depends only on the two reservoir temperatures. No working substance, no engineering cleverness, no budget can beat it.",
  },
  {
    tex: "\\oint \\frac{\\delta Q}{T} \\leq 0",
    note: "Clausius inequality: every real loop exports entropy. The reversible Carnot loop sits exactly at equality — which is precisely why it is the ceiling.",
  },
];

const experiments = [
  "Push “Hot temp T_h” up and watch η climb toward 1 — every kelvin of added gap raises the ceiling.",
  "Bring “Cold temp T_c” near “Hot temp T_h” and watch the loop flatten toward zero work: a tiny temperature difference can drive only a trickle.",
  "Raise “Compression ratio” for a fatter enclosed area — more ∮P dV per cycle at unchanged efficiency.",
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

export default function CarnotCyclePage() {
  const related = relatedTopics("carnot-cycle");
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
          “The best engine possible is a statement about failure.” Carnot’s
          theorem caps every heat engine — steam, gasoline, nuclear — at
          η&nbsp;=&nbsp;1&nbsp;−&nbsp;T_c/T_h, and the cycle that touches the cap
          is almost insultingly simple: isothermal expansion at T_h, adiabatic
          expansion down to T_c, isothermal compression at T_c, adiabatic
          compression back. Drag the two temperatures and watch the ceiling of
          every engine ever built move.
        </p>
      </Section>

      <Section index="02" title="Interactive simulation" wide>
        <CarnotCycleLab />
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
          Reversibility is the ceiling. Every real engine pays an entropy export
          tax — friction, turbulence, heat sloshing across finite temperature
          gaps — that the Carnot loop avoids by construction: each stroke
          exchanges heat only across an infinitesimal difference, so ∮δQ/T = 0
          and nothing is forfeited to disorder. The catch is speed. A reversible
          engine must run infinitely slowly, which is why real engines happily
          trade efficiency for pace and live below the line Carnot drew.
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
