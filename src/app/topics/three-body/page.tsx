import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import ThreeBodyLab from "@/components/labs/ThreeBodyLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";
import TopicMetrics from "@/components/metrics/TopicMetrics";

export const metadata: Metadata = {
  title: "Three-Body Problem",
  description: "Two bodies dance; a third turns it to chaos.",
};

const topic = getTopic("three-body")!;

const equations = [
  {
    tex: "\\ddot{x} = 2\\dot{y} + \\Omega_x,\\quad \\ddot{y} = -2\\dot{x} + \\Omega_y",
    note: "Equations of motion in the rotating frame. The 2ṗ terms are Coriolis — forces felt only while moving — and Ωₓ, Ωᵧ are slopes of the effective potential below.",
  },
  {
    tex: "\\Omega = \\frac{1-\\mu}{r_1} + \\frac{\\mu}{r_2} + \\tfrac{1}{2}\\left(x^2 + y^2\\right)",
    note: "The effective potential: gravity builds hills under each primary (masses 1−μ and μ) while the centrifugal term adds a gentle bowl around the barycenter.",
  },
  {
    tex: "C = 2\\Omega - v^2",
    note: "The Jacobi integral — one number conserved along every test-particle trajectory. It acts as an energy budget over the terrain: cross a pass and there is no going back.",
  },
  {
    tex: "L_{4},\\,L_{5}: \\left(\\tfrac{1}{2}-\\mu,\\; \\pm\\tfrac{\\sqrt{3}}{2}\\right)",
    note: "Two of the five Lagrange points anchor equilateral triangles with the primaries. The collinear trio L1–L3 has no formula — this lab finds them by bisection on Ωₓ = 0.",
  },
];

const experiments = [
  "Toggle “Lagrange markers” on and launch a test mass right at L4 or L5 with barely any drag — the marker behaves like a shelf, and the drift readout shows C holding nearly still.",
  "Nudge “Mass ratio μ” upward and watch the collinear passes L1–L3 migrate toward the growing companion while L4 and L5 ride the equilateral rule across the map.",
  "Fire two particles from the same spot a hair apart in the drag and watch their trails peel apart à la double-pendulum — sensitive dependence, in Newton’s own playground.",
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

export default function ThreeBodyPage() {
  const related = relatedTopics("three-body", 3);
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
          Two bodies waltz to Newton’s tune and add one more — and the music
          stops. The circular restricted problem freezes the easiest version of
          the mess: two primaries locked in circular orbits about their common
          center, and you flinging weightless test masses through the frame
          that spins with them. Poincaré proved that no closed-form solution
          waits at the end of the general problem; what remains instead is
          terrain worth reading, and chaos worth watching.
        </p>
      </Section>

              <Section index="02" title="Interactive simulation" wide>

              <ThreeBodyLab />

              <ProgressToggle slug="three-body" />
              <TopicMetrics slug="three-body" />

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
          Spin the camera with the binaries and gravity stops being a chase:
          both primaries pin to fixed spots, and motion becomes rolling over a
          frozen landscape. Ω raises hills at the primaries and lets the
          centrifugal term slope gently away outward, and the five Lagrange
          points are the passes through that terrain — saddles where every
          slope cancels. The Jacobi constant C is your energy budget over this
          landscape: a particle whose C sits above a pass cannot cross it,
          which is why tadpole orbits hug L4 and L5 and why the footnote’s
          drift readout stays near zero for well-behaved launches.
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
