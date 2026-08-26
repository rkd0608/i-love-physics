import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import DissectibleEquation from "@/components/math/DissectibleEquation";
import FourierSoundLab from "@/components/labs/FourierSoundLab";
import { domainLabel, getTopic } from "@/lib/topics";
import type { TopicMeta } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";
import TopicMetrics from "@/components/metrics/TopicMetrics";

export const metadata: Metadata = {
  title: "Fourier Sound",
  description: "Stack pure tones, sculpt any waveform.",
};

const topic = getTopic("fourier-sound")!;

const related = [
  getTopic("wave-interference"),
  getTopic("heisenberg-uncertainty"),
].filter((t): t is TopicMeta => Boolean(t));

const equations = [
  {
    tex: "y(t) = \\sum_{n=1}^{N} A_n \\sin\\left(2\\pi f_n t + \\varphi_n\\right)",
    note: "Additive synthesis: stack pure sines, each with its own amplitude and phase, and the ear hears one instrument-shaped tone rather than the parts.",
  },
  {
    tex: "A_n \\propto n^{-p}",
    note: "Spectral tilt: p = 1 rolls off gently like a bowed string; p = 0 leaves every harmonic equally loud until the sum collapses into spikes.",
  },
  {
    tex: "\\square(t) = \\frac{4}{\\pi}\\sum_{k=0}^{\\infty} \\frac{\\sin\\bigl((2k+1)\\,\\omega t\\bigr)}{2k+1}",
    note: "A square wave is the odd-harmonic series alone — flip on “Odd harmonics only” and the hollow clarinet timbre appears.",
  },
  {
    tex: "\\frac{\\mathrm{Si}(\\pi)}{\\pi} \\approx 0.5895",
    note: "Gibbs phenomenon: a truncated series overshoots each jump by about nine percent, leaving horns on the edges that shrink only slowly as N grows.",
  },
];

const experiments = [
  "Switch “Odd harmonics only” and watch square edges sharpen as N climbs — at N = 12 every cliff wears Gibbs horns.",
  "Raise “Detune b” until the waveform visibly breathes: stretched partials slip out of phase and the sum swells and thins in slow beats.",
  "Drive “Spectral tilt p” to 0 for a spike train — equal-weight harmonics pile up into narrow bursts separated by near silence.",
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

export default function FourierSoundPage() {
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
        <p className="text-lg leading-relaxed text-fg/90">
          “A violin and a flute play the same note — the difference is a list of
          numbers.”
        </p>
        <p className="leading-relaxed text-fg/90">
          Every steady tone is a stack of pure sines called harmonics, each with
          its own amplitude, frequency, and phase; the ear hears the sum as
          timbre. The lab below is silent by design — it renders the pressure
          curve and its spectrum instead of playing them — so you can watch the
          shape that an instrument’s harmonic recipe builds, beat by beat.
        </p>
      </Section>

      <Section index="02" title="Explain it like I’m five">
        <p className="text-lg leading-relaxed text-fg/90">
          Pluck a guitar string and it wiggles in one smooth curve. Wiggle a
          jump rope with two hands at once — quick shakes on top of slow ones
          — and the rope holds both shapes at the same time. Every sound works
          like that rope: one crinkly air line built out of many simple smooth
          wiggles stacked together. A violin picks one stack, a flute picks
          another, so the same note wears different costumes.{" "}
          <strong className="text-fg">
            Every sound is many simple wiggles stacked into one.
          </strong>
        </p>
      </Section>

              <Section index="03" title="Interactive simulation" wide>

              <FourierSoundLab />

              <ProgressToggle slug="fourier-sound" />
              <TopicMetrics slug="fourier-sound" />

      </Section>

      <Section index="04" title="The equations">
        <div className="space-y-4">
          {equations.map((row, i) => (
            <DissectibleEquation
              key={row.tex}
              slug="fourier-sound"
              index={i}
              tex={row.tex}
              decode={row.note}
            />
          ))}
        </div>
      </Section>

      <Section index="05" title="Why it works">
        <p className="leading-relaxed text-fg/90">
          The wave equation is linear: add two solutions and you get another
          solution. That single fact lets timbres superpose note-by-note — a
          clarinet’s odd-harmonic stack and a violin’s tilted spectrum can ride
          one pressure wave at once, exactly the way overlapping fringes share a
          screen in{" "}
          <Link
            href="/topics/wave-interference"
            className="focus-ring rounded-sm text-accent transition-colors hover:text-fg"
          >
            wave interference
          </Link>
          . The flip side is a bargain you cannot renegotiate: confine a sound
          tightly in time and its frequencies must smear wide, the same trade
          quantified in{" "}
          <Link
            href="/topics/heisenberg-uncertainty"
            className="focus-ring rounded-sm text-accent transition-colors hover:text-fg"
          >
            Heisenberg uncertainty
          </Link>
          .
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
