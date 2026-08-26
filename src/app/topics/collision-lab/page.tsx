import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import DissectibleEquation from "@/components/math/DissectibleEquation";
import CollisionLab from "@/components/labs/CollisionLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";
import TopicMetrics from "@/components/metrics/TopicMetrics";

export const metadata: Metadata = {
  title: "Collision Lab",
  description:
    "Two gliders, one ledger: momentum balances to the last decimal while kinetic energy negotiates.",
};

const topic = getTopic("collision-lab")!;

const equations = [
  {
    tex: "m_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2",
    note: "Momentum conservation: the total before contact equals the total after, no matter the masses, speeds, or restitution.",
  },
  {
    tex: "e = \\frac{v_2' - v_1'}{u_1 - u_2}",
    note: "Newton’s restitution: the separation speed as a fraction of the approach speed, priced between zero and one.",
  },
  {
    tex: "\\Delta KE = \\tfrac{1}{2}\\mu(1-e^2)(u_1-u_2)^2",
    note: "Energy lost in the impact, with μ the reduced mass m₁m₂/(m₁+m₂). It vanishes at e = 1 and peaks at e = 0.",
  },
  {
    tex: "e = 1:\\ \\text{elastic} \\qquad e = 0:\\ \\text{perfectly inelastic}",
    note: "The two bookend collisions: perfect bounce-back that keeps every joule, and the sticky merger that keeps only momentum.",
  },
];

const experiments = [
  "Set “Restitution e” to 0 for the sticky merger: the gliders leave with identical velocities and the ledger books the maximum possible ΔKE.",
  "Push “Mass m₁” far above “Mass m₂” for the bowling-ball-pin bounce-back — the pin flies off fast while the heavy ball barely notices.",
  "Hunt for u₁, u₂ and e that leave both gliders with equal post-collision speeds, then verify against the ledger’s Σp rows.",
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

export default function CollisionLabPage() {
  const related = relatedTopics("collision-lab");
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
          Conservation of momentum is the one law in the room with no
          exceptions. Crash anything into anything else — sticky, springy, or
          somewhere between — and the books close to the last decimal every
          single time. What actually varies is the energy settlement: elastic
          impacts refund every joule, messy ones write some off as heat and
          deformation. Send two air-track gliders into each other at any masses
          and speeds, dial restitution from glass-ball to lump-of-putty, and
          watch the ledger prove that momentum never blinks.
        </p>
      </Section>

      <Section index="02" title="Explain it like I’m five">
        <p className="leading-relaxed text-fg/90">
          Roll one marble straight into a matching marble sitting
          still. Clack! The rolling marble stops dead and the still one
          shoots off carrying exactly the same push. It is like they
          traded pushes. Roll a giant marble instead and the little one
          zooms off extra fast while the big one barely notices. Squash
          two lumps of putty together and they simply stick and roll on
          as one blob. Whatever crashes, whatever sticks or springs
          apart, the pushes add up to the same total after.
        </p>
        <p className="leading-relaxed text-fg/90">
          <strong className="text-fg">
            Crashing only moves pushes around; none ever disappear.
          </strong>
        </p>
      </Section>

              <Section index="03" title="Interactive simulation" wide>

              <CollisionLab />

              <ProgressToggle slug="collision-lab" />
              <TopicMetrics slug="collision-lab" />

      </Section>

      <Section index="04" title="The equations">
        <div className="space-y-4">
          {equations.map((row, i) => (
            <DissectibleEquation
              key={row.tex}
              slug="collision-lab"
              index={i}
              tex={row.tex}
              decode={row.note}
            />
          ))}
        </div>
      </Section>

      <Section index="05" title="Why it works">
        <p className="leading-relaxed text-fg/90">
          During contact the gliders push on each other with equal and opposite
          forces — Newton’s third-law symmetry — so their momentum changes
          cancel exactly, whatever the force law between them looks like.
          Momentum closure is therefore forced every time, by symmetry alone.
          Restitution just prices the energy leak: a softer collision holds
          contact longer and diverts more of the relative kinetic energy into
          heat, sound, and permanent dents, which is precisely the{" "}
          {"½μ(1−e²)u²"} the ledger deducts.
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
