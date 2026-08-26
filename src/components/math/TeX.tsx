"use client";

import katex from "katex";
import { useMemo } from "react";

export default function TeX({
  tex,
  block = false,
  className,
}: {
  tex: string;
  block?: boolean;
  className?: string;
}) {
  const html = useMemo(
    () =>
      katex.renderToString(tex, {
        displayMode: block,
        throwOnError: false,
        output: "html",
        strict: false,
      }),
    [tex, block]
  );
  if (block) {
    return (
      <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
    );
  }
  return (
    <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
