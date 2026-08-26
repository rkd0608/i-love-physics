import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import SnellsLawLab from "@/components/labs/SnellsLawLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";
import TopicMetrics from "@/components/metrics/TopicMetrics";

export const metadata: Metadata = {
  title: "Snell’s Law",
  description: "Light bends where speeds change — until it won’t.",
};

const topic = getTopic("snells-law")!;

const equations = [
  {
    tex: "n_1\\sin\\theta_1 = n_2\\sin\\theta_2",
    note: "Crossing a boundary, the product n sinθ never changes: into a denser medium the ray bends toward the normal, into a rarer one away.",
  },
  {
    tex: "\\theta_c = \\arcsin\\!\\left(\\frac{n_2}{n_1}\\right)",
    note: "Exists only dense-to-rare. At this incidence the refracted ray skims along the surface; past it there is no transmitted solution at all.",
  },
  {
    tex: "R = \\left(\\frac{n_1\\cos\\theta_1 - n_2\\cos\\theta_2}{n_1\\cos\\theta_1 + n_2\\cos\\theta_2}\\right)^{2}",
    note: "Fresnel’s reflection coefficient sets how much intensity survives the crossing — watch the refracted ray fade as θ₁ climbs toward θc.",
  },
  {
    tex: "\\delta\\!\\int_A^B \\frac{ds}{v} = 0",
    note: "Fermat’s least-time principle: of all broken paths between two fixed points, light takes the quickest. Varying that time reproduces Snell’s law exactly.",
  },
];

const experiments = [
  "Set “Index n₁” above “Index n₂” and hunt the disappearance angle — the refracted ray skims the interface, fades to nothing, and flips into bright amber reflection.",
  "Press “Critical angle demo” to sweep θ₁ through θc and catch the exact moment refraction surrenders to total internal reflection.",
  "Make both indices equal — light forgets the boundary exists and sails straight through without a kink.",
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

export default function SnellsLawPage() {
  const related = relatedTopics("snells-law");
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
          The fastest path is not the straight one. Send light from A to B across
          a boundary where its speed changes and the quickest route bends — kinked
          at the interface by exactly the amount Snell’s law demands. Push the
          incidence angle far enough going dense-to-rare and the transmitted
          solution vanishes outright: total internal reflection, the perfect
          mirror that runs your fiber-optic world.
        </p>
      </Section>

              <Section index="02" title="Interactive simulation" wide>

              <SnellsLawLab />

              <ProgressToggle slug="snells-law" />
              <TopicMetrics slug="snells-law" />

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
          Snell’s law is momentum bookkeeping. A perfectly flat interface can only
          trade momentum perpendicular to itself, so light’s tangential momentum —
          proportional to n sinθ — must be conserved across the boundary, which is
          the whole law in one line. Fermat sees the same fact from the time side:
          minimize the travel time of a broken path and the calculus of variations
          hands you n₁ sinθ₁ = n₂ sinθ₂. Least time and conserved tangential
          momentum are one statement worn twice.
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
