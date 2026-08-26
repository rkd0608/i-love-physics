import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import KeplerLawsLab from "@/components/labs/KeplerLawsLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";

export const metadata: Metadata = {
  title: "Kepler’s Laws",
  description: "Equal areas, stretched ellipses, clockwork periods.",
};

const topic = getTopic("kepler-laws")!;

const equations = [
  {
    tex: "r = \\frac{a(1-e^2)}{1 + e\\cos\\theta}",
    note: "Ellipse geometry: the Sun sits at one focus, not the center. Eccentricity e squashes a circle of size a into a stretched oval, closest at perihelion and laziest at aphelion.",
  },
  {
    tex: "M = E - e\\sin E",
    note: "Kepler’s equation: the mean anomaly M marches uniformly with time, but the planet’s true position hides behind the eccentric anomaly E — a transcendental equation solved by Newton iteration, not algebra.",
  },
  {
    tex: "\\frac{dA}{dt} = \\frac{L}{2m}",
    note: "The area law: the radius vector sweeps equal areas in equal times because areal velocity is just angular momentum divided by twice the mass.",
  },
  {
    tex: "T^2 = a^3",
    note: "The harmonic law: period squared scales with semi-major axis cubed — exact in units where GM = 4π², and the reason outer planets keep visibly slower time.",
  },
];

const experiments = [
  "Crank “Eccentricity e” to 0.85 and time the perihelion dash against the lazy aphelion coast.",
  "Enable “Comparison planet” and verify T²/a³ matches in the readout.",
  "Press “Restart at perihelion” with wedges on and watch the fat early wedges shrink.",
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

export default function KeplerLawsPage() {
  const related = relatedTopics("kepler-laws");
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
          Three laws read from naked-eye tables before telescopes existed:
          planets move on ellipses with the Sun off-center, the line from Sun
          to planet sweeps equal areas in equal times, and the square of each
          period keeps faith with the cube of each orbit’s size. The simulation
          solves Kepler’s equation every frame, so you can stretch the ellipse,
          restart at perihelion, and watch the geometry and the clockwork agree.
        </p>
      </Section>

              <Section index="02" title="Interactive simulation" wide>

              <KeplerLawsLab />

              <ProgressToggle slug="kepler-laws" />

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
          The area rule is angular-momentum conservation wearing Kepler’s coat:
          gravity points straight at the Sun, so it exerts no torque, the
          product r²θ̇ never wavers, and every wedge the radius vector sweeps
          per second comes out identical no matter where the planet is. The
          harmonic law falls out of inverse-square gravity itself — work
          through the orbital period for a bound inverse-square orbit and T²/a³
          is the same constant for every planet, which is why one ghost world
          on a shrunken ellipse still keeps the same ratio in the readout.
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
