"use client";

import { useState, type ReactNode } from "react";
import EquationAnatomy from "@/components/math/EquationAnatomy";
import TeX from "@/components/math/TeX";
import { ANATOMY } from "@/lib/anatomy";
import type { TopicSlug } from "@/lib/topics";
import { getTopic } from "@/lib/topics";

export default function DissectibleEquation({
  slug,
  index,
  tex,
  decode,
}: {
  slug: TopicSlug;
  index: number;
  tex: string;
  decode: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const parts = ANATOMY[slug]?.[index];
  const label = `${getTopic(slug)?.title ?? slug} · equation ${index + 1}`;
  const panelId = `dissect-${slug}-${index}`;

  return (
    <figure className="relative border-t border-line pt-5">
      <TeX tex={tex} block className="overflow-x-auto text-lg" />
      <figcaption className="mt-2 text-sm leading-relaxed text-muted">
        {decode}
      </figcaption>
      {parts ? (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className="focus-ring mt-3 inline-flex rounded-full border border-line px-2.5 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent sm:absolute sm:right-0 sm:top-5 sm:mt-0"
        >
          Dissect
        </button>
      ) : null}
      {parts && open ? (
        <div id={panelId} className="mt-3">
          <EquationAnatomy parts={parts} label={label} />
        </div>
      ) : null}
    </figure>
  );
}
