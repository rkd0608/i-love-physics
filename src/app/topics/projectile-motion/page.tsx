import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import DissectibleEquation from "@/components/math/DissectibleEquation";
import ProjectileLab from "@/components/labs/ProjectileLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";
import TopicMetrics from "@/components/metrics/TopicMetrics";

export const metadata: Metadata = {
  title: "Projectile Motion",
  description: "Launch angles, parabolas, drag, and the perfect arc.",
};

const topic = getTopic("projectile-motion")!;

const equations = [
  {
    tex: "R = \\frac{v_0^2 \\sin 2\\theta}{g}",
    note: "Vacuum range: symmetric about forty-five degrees, which is why that angle wins when air is absent.",
  },
  {
    tex: "\\vec{a} = \\vec{g} - k\\left|\\vec{v}\\right|\\vec{v}",
    note: "With drag, acceleration gains a term pushing opposite the motion, growing with the square of speed.",
  },
  {
    tex: "y = x\\tan\\theta - \\frac{g x^2}{2 v_0^2 \\cos^2\\theta}",
    note: "Height against distance with no air — a true parabola, the shape drag gradually bends downward.",
  },
  {
    tex: "\\theta_{\\text{opt}} < 45^{\\circ} \\quad (k > 0)",
    note: "Drag taxes hang time, so once air gets a vote the winning launch angle drops below forty-five degrees.",
  },
];

const experiments = [
  "Fix “Launch speed” and sweep “Angle” upward: the impact marker marches out to a maximum near forty-five degrees, then retreats just as steadily.",
  "Crank “Drag coefficient k” until the arc crumples while the “Vacuum ghost” holds the ideal shape the real trajectory can no longer keep.",
  "Press Fire repeatedly just below and above forty-five degrees under heavy drag — the winner lands well under the vacuum optimum.",
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

export default function ProjectileMotionPage() {
  const related = relatedTopics("projectile-motion");
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
          Every thrown thing lives the same short life: one instant of borrowed
          velocity, then gravity collects. In a vacuum the flightpath is a
          perfect parabola; add air and it sags, steeper coming down than going
          up. Fire shots at any speed and angle, overlay the ideal parabola on
          its dragged reality, and watch the landing marker expose exactly what
          the atmosphere charges.
        </p>
      </Section>

      <Section index="02" title="Explain it like I’m five">
        <p className="leading-relaxed text-fg/90">
          Throw a ball to a friend. Up it goes, then down it comes,
          drawing a smooth rainbow shape in the air. You did not steer
          it — two simple things did it together. Across the yard, the
          ball just keeps drifting along, steady as anything. The whole
          time, gravity — the invisible pull — tugs it down, every
          single moment. Steady across plus gentle tug-down paints that
          rainbow, every time. Toss harder and the rainbow stretches
          wider. Toss straight up and it squishes into a line.
        </p>
        <p className="leading-relaxed text-fg/90">
          <strong className="text-fg">
            Every thrown thing draws the same rainbow shape.
          </strong>
        </p>
      </Section>

              <Section index="03" title="Interactive simulation" wide>

              <ProjectileLab />

              <ProgressToggle slug="projectile-motion" />
              <TopicMetrics slug="projectile-motion" />

      </Section>

      <Section index="04" title="The equations">
        <div className="space-y-4">
          {equations.map((row, i) => (
            <DissectibleEquation
              key={row.tex}
              slug="projectile-motion"
              index={i}
              tex={row.tex}
              decode={row.note}
            />
          ))}
        </div>
      </Section>

      <Section index="05" title="Why it works">
        <p className="leading-relaxed text-fg/90">
          Without drag the problem decomposes: horizontal motion at constant
          velocity, vertical motion at constant acceleration, and the parabola
          is where those two clocks meet. Air resistance couples the axes
          again, which is precisely why the clean formulas sag and the optimal
          angle leans below forty-five degrees.
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
