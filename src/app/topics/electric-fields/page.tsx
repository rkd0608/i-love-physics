import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import ElectricFieldLab from "@/components/labs/ElectricFieldLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";

export const metadata: Metadata = {
  title: "Electric Fields",
  description: "Charge layouts drawn as fields you can probe.",
};

const topic = getTopic("electric-fields")!;

const equations = [
  {
    tex: "\\vec{E} = k\\,\\frac{q}{r^2}\\,\\hat{r}",
    note: "Coulomb field: each point charge paints a radial field into the space around it, weakening with the square of distance.",
  },
  {
    tex: "\\vec{E}_{\\text{net}} = \\sum_i \\vec{E}_i",
    note: "Superposition principle: every charge contributes independently and the vectors simply add — no charge negotiates with another.",
  },
  {
    tex: "\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{q_{\\text{enc}}}{\\varepsilon_0}",
    note: "Gauss’s law: the flux through any closed surface counts exactly the charge enclosed, whatever shape you choose.",
  },
  {
    tex: "V = -\\int \\vec{E} \\cdot d\\vec{s}",
    note: "Potential: voltage is accumulated work per unit charge along a path, and equipotentials are its contour map.",
  },
  {
    tex: "E_{\\text{dipole}} \\propto \\frac{1}{r^3}",
    note: "Dipole falloff: far away, opposite charges nearly cancel and the residue dies one power of r faster than either alone.",
  },
];

const experiments = [
  "Start from “Dipole” with “Show field lines” on, then drag the negative charge in slow circles around its partner — every line re-routes instantly because all of them are re-solved from superposition on the move.",
  "Switch to “Two positives”, switch on “Equipotentials”, and hunt the midpoint saddle where the field vanishes and the contours pinch shut around both charges.",
  "Load the “Quadrupole” and click to sprinkle extra negatives (shift-click for positives) until eight charges ride along, then probe far from the cluster and watch the readout fall off faster than any lone 1/r² predicts.",
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

export default function ElectricFieldsPage() {
  const related = relatedTopics("electric-fields");
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
          Bring a test charge into the room and it feels a push immediately —
          the field exists before any test charge arrives, painted into
          surrounding space by whatever charges are already there. Drag
          positives and negatives around the canvas, watch field lines stitch
          them together, sweep contours of constant potential, and send the
          probe anywhere to read the strength and direction waiting at that
          exact spot.
        </p>
      </Section>

      <Section index="02" title="Interactive simulation" wide>
        <ElectricFieldLab />
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
          Superposition is pure linearity: the net field is a vector sum whose
          terms neither know nor care about one another. That linearity is why
          geometry can encode dynamics here — a field line is nothing more than
          the integral curve of E, a slope field that an imagined test charge
          would slide along, while equipotentials cross every line at right
          angles because V is what E is the negative gradient of. Rearranging
          the charges redraws the slope field; the physics never changed.
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
