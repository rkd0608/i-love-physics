import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import BrachistochroneLab from "@/components/labs/BrachistochroneLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";

export const metadata: Metadata = {
  title: "Brachistochrone",
  description: "The curve of fastest descent bends below the straight.",
};

const topic = getTopic("brachistochrone")!;

const equations = [
  {
    tex: String.raw`v = \sqrt{2g\,(y_0 - y)}`,
    note: "Speed from height: a frictionless bead converts every metre of lost elevation into the same kinetic budget, no matter how the wire wandered to get there.",
  },
  {
    tex: String.raw`t = \int \frac{ds}{\sqrt{2g\,(y_0 - y)}}`,
    note: "Descent time as a path integral: each rail charges the same toll per unit of drop collected, and the winning route minimises the total fare.",
  },
  {
    tex: String.raw`x = a(\theta - \sin\theta), \quad y = a(1 - \cos\theta)`,
    note: "The cycloid — traced by a point on a rolling wheel of radius a, measured downward from the release cusp. It is both the referee of this race and its champion.",
  },
  {
    tex: String.raw`t_{\text{full}} = \pi\sqrt{\tfrac{a}{g}}`,
    note: "Cusp-to-cusp descent time for the full arch, shown as the dashed tick on the timer strip. Johann Bernoulli posed the problem in 1697; Isaac Newton delivered the solution overnight and let it be published anonymously.",
  },
];

const experiments = [
  "Flatten “Drop” to 0.5 and confirm the cycloid’s lead shrinks — with little height to spend, clever routing buys less.",
  "Extend “Span” to 4 for maximum drama: the straight rail’s misery stretches out while the cycloid barely notices.",
  "Toggle “Finish times” off, read the rails, call the finishing order aloud, then press “Restart race” and see whether the podium agrees.",
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

export default function BrachistochronePage() {
  const related = relatedTopics("brachistochrone");
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
          The shortest path loses the race. Release three beads on different
          rails from the same point to the same lower endpoint and the straight
          line — geometrically shortest — trails the field. Gravity pays out
          speed by height dropped, not distance travelled, so the rail that
          steals altitude earliest buys velocity while its rivals are still
          creeping. The lab races a straight ramp, a circular arc and the true
          cycloid of fastest descent; watch who leads early, who surges late,
          and who never recovers.
        </p>
        <p className="leading-relaxed text-fg/90">
          Prefer arcs powered by a running start rather than a standing drop?{" "}
          <Link
            href="/topics/projectile-motion"
            className="focus-ring rounded-sm text-accent underline-offset-4 transition-colors hover:underline"
          >
            Projectile motion
          </Link>{" "}
          covers those gravity-powered arcs from launch to landing.
        </p>
      </Section>

              <Section index="02" title="Interactive simulation" wide>

              <BrachistochroneLab />

              <ProgressToggle slug="brachistochrone" />

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
          Dipping early buys speed that compounds over the remaining run: a bead
          that drops first crosses the flat stretch at a pace the straight-route
          bead never reaches. Variational calculus balances the two competing
          costs — steepness, which pays speed early, against length, which
          charges distance throughout — and finds their exact compromise in the
          cycloid. Galileo guessed a circular arc a century earlier and came
          close; the true optimum bends even further below it.
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
