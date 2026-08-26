import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import DissectibleEquation from "@/components/math/DissectibleEquation";
import ThinLensLab from "@/components/labs/ThinLensLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";
import TopicMetrics from "@/components/metrics/TopicMetrics";

export const metadata: Metadata = {
  title: "Thin Lenses",
  description: "Three rays decide where every image lives.",
};

const topic = getTopic("thin-lenses")!;

const equations = [
  {
    tex: "\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}",
    note: "The thin-lens equation. Hand it a focal length and an object distance and it hands back the image position — no surface curvature required beyond the single number f.",
  },
  {
    tex: "m = -\\frac{d_i}{d_o}",
    note: "Magnification. The minus sign carries the whole story: negative m means the image flips upside down on the far side, positive m means it stays upright.",
  },
  {
    tex: "d_i > 0\\ \\text{real} \\qquad d_i < 0\\ \\text{virtual}",
    note: "Sign-convention decode. Positive d_i lands the image where a screen can actually catch it; negative d_i means the refracted rays only appear to diverge from a point on the object’s own side.",
  },
  {
    tex: "d_o = f \\Rightarrow d_i \\to \\infty \\qquad d_o < f \\Rightarrow \\text{virtual}",
    note: "Special cases. Sit the object exactly on the front focal plane and the image escapes to infinity; slide it inside the focus of a converging lens and the image turns virtual, upright, and magnified — a magnifying glass.",
  },
];

const experiments = [
  "Slide “Object distance d_o” through the focal length and watch the real image sprint to infinity, then flip virtual and reappear on the object’s side, upright and enlarged.",
  "Push “Focal length f” negative for the always-virtual diverging case — no matter where the object sits, the image stays upright and shrunken.",
  "Enable “Ray fan” near d_o ≈ f for the parallel-beam collapse: every ray leaves the lens pointing the same direction because the object sits on the front focal plane.",
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

export default function ThinLensesPage() {
  const related = relatedTopics("thin-lenses");
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
          Every camera and eyeball runs this one formula. A lens thick enough to
          ignore, thin enough to reduce to a single number f, bends light so
          faithfully that three straight lines tell you exactly where any image
          forms — real on a sensor, or virtual behind the glass where only your
          eye can find it.
        </p>
      </Section>

      <Section index="02" title="Explain it like I’m five">
        <p className="leading-relaxed text-fg/90">
          Go outside on a sunny day with a magnifying glass. Tilt it at the
          sidewalk and all the sunshine squeezes into one tiny hot dot. The
          curved glass nudges every ray by just the right amount so they all
          land in the same spot. Slide your hand up and down and the dot
          blurs, sharpens, blurs again. That is all a lens does: steer rays so
          a picture of things lands where your eye or a camera can grab it.{" "}
          <strong className="text-fg">
            A lens bends rays so they all meet in one spot.
          </strong>
        </p>
      </Section>

              <Section index="03" title="Interactive simulation" wide>

              <ThinLensLab />

              <ProgressToggle slug="thin-lenses" />
              <TopicMetrics slug="thin-lenses" />

      </Section>

      <Section index="04" title="The equations">
        <div className="space-y-4">
          {equations.map((row, i) => (
            <DissectibleEquation
              key={row.tex}
              slug="thin-lenses"
              index={i}
              tex={row.tex}
              decode={row.note}
            />
          ))}
        </div>
      </Section>

      <Section index="05" title="Why it works">
        <p className="leading-relaxed text-fg/90">
          A thin lens tips every ray by an angle proportional to its height on
          the glass — small-angle linearity quietly doing the work. Because the
          deflection is linear in height, the three principal constructions are
          exact rather than approximate: parallel-to-focus, focus-to-parallel,
          and straight-through-the-center must all agree on one crossing point.
          The whole curved surface collapses to two dots on the axis, ±|f|, and
          one subtraction — no ray tracing of glass at all.
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
