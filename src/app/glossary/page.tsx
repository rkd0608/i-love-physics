import type { Metadata } from "next";
import GlossaryBrowser from "@/components/glossary/GlossaryBrowser";
import { GLOSSARY_TERMS } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "Plain-language definitions of the collection’s working vocabulary, grouped by branch and linked to live simulations.",
};

export default function GlossaryPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-20">
      <header className="max-w-2xl space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Glossary
          </h1>
          <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-xs text-accent">
            {GLOSSARY_TERMS.length} terms
          </span>
        </div>
        <p className="text-lg text-muted">
          The working vocabulary of the collection, from angular momentum to the
          vis-viva equation — searchable, grouped by branch, and linked to live
          simulations.
        </p>
      </header>
      <GlossaryBrowser terms={GLOSSARY_TERMS} />
    </div>
  );
}
