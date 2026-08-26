import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import TwinParadoxLab from "@/components/labs/TwinParadoxLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";

export const metadata: Metadata = {
  title: "Twin Paradox",
  description: "Race your twin across spacetime and age less.",
};

const topic = getTopic("twin-paradox")!;

const equations = [
  {
    tex: "\\tau = \\int \\sqrt{1-\\beta^2}\\,dt",
    note: "Proper time: a clock ages by the length of its own worldline. Straight or kinked, integrate the stretch factor √(1−β²) along the path and compare totals.",
  },
  {
    tex: "s^2 = c^2t^2 - x^2",
    note: "The invariant interval: every inertial observer, whatever their coordinates, computes the same s² between departure and reunion. Age difference is frame-independent fact.",
  },
  {
    tex: "f_{\\text{obs}} = f_{\\text{emit}}\\sqrt{\\frac{1-\\beta}{1+\\beta}}",
    note: "Relativistic Doppler shift — what each twin literally sees through the telescope. Receding halves redden and approaching halves blue, but only the traveler flips color mid-journey.",
  },
  {
    tex: "\\tau_{\\text{straight}} > \\tau_{\\text{kinked}}",
    note: "Minkowski’s triangle inequality runs backwards: between two events the straight worldline logs the most proper time, so the twin who kinks returns youngest.",
  },
];

const experiments = [
  "Sweep “Outbound speed β” toward 0.95 and watch Δ explode nonlinearly — γ diverges as β closes on the speed of light.",
  "Enable “Simultaneity planes” to watch the traveler’s ‘now’ tilt through the diagram, leaping ahead along the home twin’s worldline at turnaround.",
  "Shrink “Trip half-length τ” until the advantage vanishes — at everyday speeds both twins age in near lockstep.",
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

export default function TwinParadoxPage() {
  const related = relatedTopics("twin-paradox");
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
        <p className="text-xl font-medium tracking-tight text-fg">
          Both twins see the other age slower — so who wins?
        </p>
        <p className="leading-relaxed text-fg/90">
          One twin stays home; the other rockets to a distant turn point and
          comes back. Each leg is smooth inertial coasting, where ordinary time
          dilation — the light-clock argument on{" "}
          <Link
            href="/topics/special-relativity"
            className="text-accent transition-colors hover:text-accent-2"
          >
            Special Relativity
          </Link>{" "}
          — insists the OTHER clock runs slow. Symmetry says no one can age
          less, yet when they reunite and compare clocks across the same two
          events, one is unambiguously younger. The Minkowski diagram below
          settles it: draw both worldlines between departure and reunion and
          measure their proper lengths yourself.
        </p>
      </Section>

              <Section index="02" title="Interactive simulation" wide>

              <TwinParadoxLab />

              <ProgressToggle slug="twin-paradox" />

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
          The asymmetry lives in the frame flip. The stay-home twin rides a
          single inertial frame start to finish; the traveler occupies two —
          outbound, then inbound — stitched together by an instantaneous
          turnaround. During each leg the mutual slowing is perfectly
          symmetric, but at the flip the traveler’s definition of “now on
          Earth” swings forward across years of home time in zero proper
          seconds, which you can watch as the simultaneity planes pivot. Two
          inertial legs versus one: only one twin changes frames, so only one
          twin’s account can be wrong about total elapsed time. The straight
          worldline simply logs more proper time than any kinked route between
          the same events.
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
