import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import HohmannTransferLab from "@/components/labs/HohmannTransferLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";

export const metadata: Metadata = {
  title: "Hohmann Transfer",
  description: "Two burns on the cheapest road between orbits.",
};

const topic = getTopic("hohmann-transfer")!;

const equations = [
  {
    tex: "v_{\\text{circ}} = \\sqrt{\\frac{GM}{r}}",
    note: "Circular speed: the exact pace at which a fall bends into a closed circle of radius r. Both parking orbits ride at their own version of this speed.",
  },
  {
    tex: "v^2 = GM\\left(\\frac{2}{r} - \\frac{1}{a}\\right)",
    note: "Vis-viva: speed anywhere on a conic depends only on current distance r and the semi-major axis a. It prices every burn before a drop of propellant is spent.",
  },
  {
    tex: "a_t = \\frac{r_1 + r_2}{2}, \\quad e_t = \\frac{r_2 - r_1}{r_2 + r_1}",
    note: "The transfer ellipse is the unique conic whose periapsis kisses the inner circle and whose apoapsis kisses the outer circle.",
  },
  {
    tex: "\\Delta v_{\\text{total}} = \\Delta v_1 + \\Delta v_2",
    note: "The whole budget: speed up onto the ellipse at periapsis, then match circular speed at apoapsis. Two impulses, priced by vis-viva alone.",
  },
  {
    tex: "T_{\\text{syn}} = \\frac{2\\pi}{\\lvert\\omega_2 - \\omega_1\\rvert}",
    note: "Synodic phasing: for real interplanetary shots the departure window opens only when the target’s orbital clock and yours beat in the right arrangement.",
  },
];

const experiments = [
  "Drag “Outer orbit r₂” outward and watch the bill split: Δv₁ climbs toward the escape-speed limit √2·v_circ while Δv₂ shrinks toward nothing — arriving where gravity is weak makes the second burn cheap, and no ratio big or small ever lets Δv₂ overtake Δv₁.",
  "Switch off “Predicted transfer path” and pick the burn point by eye alone: the ellipse you launch must kiss the outer circle exactly half a revolution later.",
  "Shrink “Inner orbit r₁” and “Outer orbit r₂” together and watch the total barely move — the budget scales with the square root of the radii, not with the radii themselves.",
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

export default function HohmannTransferPage() {
  const related = relatedTopics("hohmann-transfer");
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
          Spaceflight is the art of almost never thrusting. Once you are coasting,
          gravity does the steering for free, so the whole game is spending the
          least possible push at the few moments you must spend any at all. The
          Hohmann transfer is the classic answer: fire once to stretch your circle
          into an ellipse that just grazes the target orbit, coast halfway around,
          then fire again to recircularize. Both burns are priced exactly by
          vis-viva before the engine ever lights.
        </p>
      </Section>

              <Section index="02" title="Interactive simulation" wide>

              <HohmannTransferLab />

              <ProgressToggle slug="hohmann-transfer" />

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
          Each burn should change speed without changing direction, because any
          misaligned thrust wastes part of its magnitude on steering instead of
          energy. That pins both burns to tangential points, and vis-viva’s
          monotonicity does the rest: for a fixed departure radius the orbit’s
          specific energy grows only with the semi-major axis, so the ellipse
          tangent to both circles — and nothing else — carries you to the outer
          radius for the least total Δv. Any other path either leaves the inner
          circle off-tangent or arrives at the outer circle moving at the wrong
          speed, and every one of them pays more. It is provable, not folklore:
          compare each candidate’s two vis-viva bills and the tangent ellipse wins.
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
