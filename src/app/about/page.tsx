import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why i love physics exists, how the simulations are built, and what they promise.",
};

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
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

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-14 px-6 py-14 sm:py-20">
      <Section index="01" title="Mission">
        <div className="space-y-4 leading-relaxed text-fg/90">
          <p>
            i love physics exists because intuition deserves better than
            formulas copied off a board. Every topic here starts with something
            you have already seen — a thrown ball, a swaying cable, moonlight
            rippling across water — and builds the formal machinery on top of
            that memory. Simulations come first, symbols second, never the
            reverse.
          </p>
          <p>
            Equations here are treated as living objects rather than dead
            notation. Each one sits a scroll away from the simulation it
            governs, and every symbol corresponds to a control you can move.
            When a formula changes what a system does the instant you tug it,
            it stops being decoration and starts being knowledge.
          </p>
        </div>
      </Section>

      <Section index="02" title="How the simulations work">
        <p className="leading-relaxed text-fg/90">
          Every scene renders with Canvas 2D and advances through fixed-step
          integrators — semi-implicit Euler where stability matters, RK4 where
          accuracy does, and closed-form solutions wherever analytics exist.
          Equations are typeset live by KaTeX, so the notation updates with the
          very parameters you drag. Nothing else sits in the loop per pixel:
          the render path is a single draw function inside one
          requestAnimationFrame cycle.
        </p>
      </Section>

      <Section index="03" title="Accessibility">
        <ul className="list-disc space-y-2 pl-5 marker:text-accent">
          <li className="leading-relaxed text-fg/90">
            Reduced-motion support — ambient animation slows or freezes when
            your system asks for it, and offscreen sims pause entirely.
          </li>
          <li className="leading-relaxed text-fg/90">
            Labeled controls — every slider and button carries an accessible
            name and a visible focus ring for keyboard navigation.
          </li>
          <li className="leading-relaxed text-fg/90">
            High-contrast palettes tuned independently for dark and light
            themes, checked against WCAG contrast guidance.
          </li>
        </ul>
      </Section>

      <Section index="04" title="Accuracy statement">
        <p className="leading-relaxed text-fg/90">
          Every simulation is checked against analytic limits before shipping:
          orbital periods against Kepler’s third law, vacuum ranges against the
          parabola formula, fringe spacing against β ≈ λL/d, the pendulum’s
          energy drift against machine precision, and the oscillator’s decay
          envelope against its closed-form solution. Where numerics and theory
          disagree, the numerics lose. Where a model is knowingly approximate,
          the page says so.
        </p>
      </Section>

      <Section index="05" title="Colophon">
        <p className="leading-relaxed text-fg/90">
          Built with Next.js, styled with Tailwind CSS, drawn with Canvas 2D,
          and typeset by KaTeX — including the letters in the equations you are
          about to steer. No accounts, no trackers, no cookies; everything runs
          in your browser.
        </p>
      </Section>
    </div>
  );
}
