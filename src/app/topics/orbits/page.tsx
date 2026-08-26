import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import DissectibleEquation from "@/components/math/DissectibleEquation";
import OrbitsLab from "@/components/labs/OrbitsLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";
import TopicMetrics from "@/components/metrics/TopicMetrics";

export const metadata: Metadata = {
  title: "Orbits & Gravitation",
  description: "Gravity as geometry: ellipses traced by falling forever.",
};

const topic = getTopic("orbits")!;

const equations = [
  {
    tex: "\\vec{F} = G\\,\\frac{m_1 m_2}{r^2}\\,\\hat{r}",
    note: "Newton’s law of gravitation: pull grows with mass and fades with the square of the distance between them.",
  },
  {
    tex: "v_{\\text{circ}} = \\sqrt{\\frac{GM}{r}}",
    note: "The exact speed that turns a fall into a closed circle of radius r.",
  },
  {
    tex: "v^2 = GM\\left(\\tfrac{2}{r} - \\tfrac{1}{a}\\right)",
    note: "Vis-viva: speed anywhere in an orbit depends only on current distance r and the ellipse’s semi-major axis a.",
  },
  {
    tex: "L = m\\,r^2\\,\\dot{\\theta} = \\text{constant}",
    note: "Angular momentum conservation — equal areas swept in equal times, exactly as Kepler observed.",
  },
];

const experiments = [
  "Drag to launch a body aimed almost sideways at barely circular speed, then stretch “Trail length” until a full year fits on screen.",
  "Raise “Time scale” and watch a stretched orbit sprint through closest approach and dawdle out at apoapsis — Kepler’s second law in one glance.",
  "Enable “Velocity vectors” and compare arrow lengths at opposite ends of an ellipse; relaunch a touch faster and watch the ellipse swell toward escape.",
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

export default function OrbitsPage() {
  const related = relatedTopics("orbits");
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
          Throw a ball hard enough and it never lands — it keeps missing the
          ground. That is all an orbit is: Newton’s cannonball promoted to the
          Moon’s job. The simulation launches bodies around a central star with
          a clock you can bend, and gravity converts altitude into speed and
          back again, tracing ellipses, near-collisions, and escapes in glowing
          trails.
        </p>
      </Section>

      <Section index="02" title="Explain it like I’m five">
        <p className="leading-relaxed text-fg/90">
          Imagine you throw a ball really, really hard. While it flies,
          it is falling — but the round world curves away underneath, so
          it falls a long time before bumping down. Throw harder and it
          lands farther away. Now imagine an impossible, super-duper
          throw: the ball falls and falls and keeps missing the ground,
          all the way around the world. That is what the Moon is doing
          right now. Falling and missing, over and over, forever, draws
          one big loop around us.
        </p>
        <p className="leading-relaxed text-fg/90">
          <strong className="text-fg">
            An orbit is falling forever and always missing the ground.
          </strong>
        </p>
      </Section>

              <Section index="03" title="Interactive simulation" wide>

              <OrbitsLab />

              <ProgressToggle slug="orbits" />
              <TopicMetrics slug="orbits" />

      </Section>

      <Section index="04" title="The equations">
        <div className="space-y-4">
          {equations.map((row, i) => (
            <DissectibleEquation
              key={row.tex}
              slug="orbits"
              index={i}
              tex={row.tex}
              decode={row.note}
            />
          ))}
        </div>
      </Section>

      <Section index="05" title="Why it works">
        <p className="leading-relaxed text-fg/90">
          The conic sections fall out of two conservation laws running
          together: energy fixes an orbit’s size, angular momentum fixes its
          shape, and their combination forbids anything but an ellipse,
          parabola, or hyperbola. Kepler’s equal-area rule is simply angular
          momentum written as geometry.
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
