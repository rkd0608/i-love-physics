import type { Metadata } from "next";
import EquationsBrowser from "@/components/equations/EquationsBrowser";
import { EQUATION_INDEX } from "@/lib/equations";

export const metadata: Metadata = {
  title: "Equations",
  description:
    "Every equation in the collection, decoded in plain language and grouped by branch.",
};

export default function EquationsPage() {
  const expressionCount = EQUATION_INDEX.reduce(
    (sum, group) => sum + group.entries.length,
    0,
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-20 pt-12">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          Reference
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Equation explorer
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Every equation that powers these simulations, grouped by topic and
          decoded in plain language. Open any topic to watch these symbols move.
        </p>
        <p className="mt-3 font-mono text-xs text-muted">
          {EQUATION_INDEX.length} topics · {expressionCount} expressions
        </p>
      </header>

      <EquationsBrowser groups={EQUATION_INDEX} />
    </div>
  );
}
