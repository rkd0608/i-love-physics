import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import TeX from "@/components/math/TeX";
import LCCircuitLab from "@/components/labs/LCCircuitLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";

export const metadata: Metadata = {
  title: "LC Circuit",
  description: "Capacitor and coil trade energy in perfect rhythm.",
};

const topic = getTopic("lc-circuit")!;

const equations = [
  {
    tex: "L\\,\\ddot{q} + \\frac{q}{C} = 0",
    note: "Kirchhoff’s loop law around one capacitor and one coil: the voltage across the plates must equal the back-emf of the inductor, which is exactly a restoring-force equation in the plate charge.",
  },
  {
    tex: "\\omega_0 = \\frac{1}{\\sqrt{LC}}",
    note: "The natural frequency depends only on the product LC — bigger capacitor plates or a beefier coil both slow the slosh by the same √ rule.",
  },
  {
    tex: "U_E = \\frac{q^2}{2C},\\quad U_B = \\frac{L\\,i^2}{2}",
    note: "Field energy stored two ways: in the electric field between the plates and in the magnetic field threaded through the coil. Their sum never changes.",
  },
];

const analogy = [
  { what: "Displacement", mech: "x", elec: "q" },
  { what: "Restoring term", mech: "k", elec: "1/C" },
  { what: "Inertia", mech: "m", elec: "L" },
  { what: "Flow", mech: "v = ẋ", elec: "i = q̇" },
];

const experiments = [
  "Set both sliders to 2 F and 2 H, then both to 0.2 F and 0.2 H, and compare the readout periods — four hundred times the LC product buys only twenty times the period, the √(LC) scaling made visible.",
  "Enable “Detuned twin” and watch the two scope traces drift apart and realign: electrical beats, the same phenomenon that pumps energy between coupled modes.",
  "Press “Recharge” at a quarter-period and predict which bar fills first — then check the U_E / U_B split against your guess.",
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

export default function LCCircuitPage() {
  const related = relatedTopics("lc-circuit");
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
          “A spring made of pure fields.”
        </p>
        <p className="leading-relaxed text-fg/90">
          Charge a capacitor, connect a coil, and the circuit begins to
          breathe: field energy pours out of the electric gap into the
          magnetic core and back again, forever, at a tempo set only by L and
          C. The lab draws the whole loop live — charge glyphs swelling on the
          plates, the coil glowing as current peaks — and evaluates every
          value straight from the closed-form cosine, no integrator anywhere.
        </p>
      </Section>

              <Section index="02" title="Interactive simulation" wide>

              <LCCircuitLab />

              <ProgressToggle slug="lc-circuit" />

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
          <figure className="overflow-hidden rounded-2xl border border-line bg-panel">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Quantity</th>
                  <th className="px-5 py-3 font-medium">Spring–mass</th>
                  <th className="px-5 py-3 font-medium">LC circuit</th>
                </tr>
              </thead>
              <tbody>
                {analogy.map((row) => (
                  <tr key={row.what} className="border-b border-line last:border-b-0">
                    <td className="px-5 py-2.5 text-muted">{row.what}</td>
                    <td className="px-5 py-2.5 font-mono">{row.mech}</td>
                    <td className="px-5 py-2.5 font-mono">{row.elec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <figcaption className="border-t border-line px-5 py-3 text-sm leading-relaxed text-muted">
              The mechanical–electrical dictionary: every spring equation
              becomes a circuit equation by direct substitution.
            </figcaption>
          </figure>
        </div>
      </Section>

      <Section index="04" title="Why it works">
        <p className="leading-relaxed text-fg/90">
          Kirchhoff’s loop law is simple-harmonic motion’s differential
          equation in disguise: the inductor supplies inertia (
          <span className="font-mono">L q̈</span>) exactly as mass supplies{" "}
          <span className="font-mono">m ẍ</span>, and the capacitor supplies a
          restoring term (<span className="font-mono">q/C</span>) exactly as a
          spring supplies <span className="font-mono">kx</span>. So the same
          cosine that runs the{" "}
          <Link
            href="/topics/harmonic-oscillator"
            className="focus-ring rounded-sm text-accent transition-colors hover:text-fg"
          >
            harmonic oscillator
          </Link>{" "}
          runs pure electromagnetism — nothing material moves, yet charge
          sloshes between field and field with mechanical regularity. Detune a
          second circuit by five percent and their slow phase drift beats just
          like{" "}
          <Link
            href="/topics/coupled-modes"
            className="focus-ring rounded-sm text-accent transition-colors hover:text-fg"
          >
            coupled oscillators
          </Link>
          , because it is the same mathematics wearing different units.
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
