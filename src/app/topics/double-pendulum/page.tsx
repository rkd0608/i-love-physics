import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import DoublePendulumLab from "@/components/labs/DoublePendulumLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";

export const metadata: Metadata = {
  title: "Double Pendulum",
  description: "Tiny nudges, wild divergences: chaos you can steer.",
};

const topic = getTopic("double-pendulum")!;

const equations = [
  {
    tex: "\\ddot{\\theta}_1 = \\frac{-g(2m_1{+}m_2)\\sin\\theta_1 - m_2 g\\sin(\\theta_1{-}2\\theta_2) - 2m_2\\sin(\\theta_1{-}\\theta_2)\\bigl(\\omega_2^2 L_2 + \\omega_1^2 L_1\\cos(\\theta_1{-}\\theta_2)\\bigr)}{L_1\\bigl(2m_1{+}m_2 - m_2\\cos(2\\theta_1{-}2\\theta_2)\\bigr)}",
    note: "Arm one’s acceleration depends on the other arm’s angle and speed — the coupling that makes the dance unpredictable.",
  },
  {
    tex: "\\ddot{\\theta}_2 = \\frac{2\\sin(\\theta_1{-}\\theta_2)\\bigl(\\omega_1^2 L_1 (m_1{+}m_2) + g(m_1{+}m_2)\\cos\\theta_1 + \\omega_2^2 L_2 m_2\\cos(\\theta_1{-}\\theta_2)\\bigr)}{L_2\\bigl(2m_1{+}m_2 - m_2\\cos(2\\theta_1{-}2\\theta_2)\\bigr)}",
    note: "The mirror twin: arm two’s acceleration written in terms of arm one.",
  },
  {
    tex: "\\delta\\theta \\sim e^{\\lambda t}",
    note: "Lyapunov growth: a nudge of size δθ balloons exponentially until neighboring trajectories forget each other.",
  },
  {
    tex: "H = T + V",
    note: "Energy trades between motion and height but never leaks — chaos shuffles it without destroying it.",
  },
];

const experiments = [
  "Start both arms hanging, give one a gentle “Nudge”, then summon the “Ghost twin” and watch a difference of a hair become two different universes.",
  "Cut “Gravity” to lunar values and raise “Time scale” — the same chaos unfolds unhurried, proof that sensitivity is about stretching, not speed.",
  "Shorten “Arm length L” between resets to chase when the ghost pair splits soonest, then press Reset when the tangle turns to art.",
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

export default function DoublePendulumPage() {
  const related = relatedTopics("double-pendulum");
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
          One pendulum is clockwork; hinge a second arm to its bob and the
          clockwork breaks bad. Each arm tugs on the other, trading energy in
          patterns that never quite repeat — sometimes synchronized, sometimes
          tumbling end over end. The simulation integrates the full nonlinear
          equations with RK4, and can run a twin started a hair differently so
          you can watch predictability die in real time.
        </p>
      </Section>

      <Section index="02" title="Interactive simulation" wide>
        <DoublePendulumLab />
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
          Nothing here is random. The state evolves deterministically under
          smooth laws, yet positive Lyapunov exponents amplify any uncertainty
          exponentially fast, while conservation of the Hamiltonian keeps every
          trajectory confined to an ever-folding surface in phase space.
          Stretching and refolding forever is the geometric heart of chaos.
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
