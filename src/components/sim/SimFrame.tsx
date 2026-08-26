import type { ReactNode } from "react";

export default function SimFrame({
  title,
  subtitle,
  children,
  controls,
  footnote,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  controls?: ReactNode;
  footnote?: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-panel">
      <header className="px-4 pt-4 sm:px-5 sm:pt-5">
        <h2 className="text-sm font-semibold">{title}</h2>
        {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
      </header>
      <div className="relative aspect-video w-full bg-[#060a17]">{children}</div>
      {controls ? (
        <div className="flex flex-wrap gap-x-6 gap-y-4 p-4 sm:p-5">{controls}</div>
      ) : null}
      {footnote ? (
        <div className="border-t border-line px-4 py-3 text-xs text-muted sm:px-5">
          {footnote}
        </div>
      ) : null}
    </section>
  );
}
