import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import TopicCard from "@/components/explore/TopicCard";
import DissectibleEquation from "@/components/math/DissectibleEquation";
import ZenoAchillesLab from "@/components/labs/ZenoAchillesLab";
import { domainLabel, getTopic, relatedTopics } from "@/lib/topics";
import ProgressToggle from "@/components/library/ProgressToggle";
import TopicMetrics from "@/components/metrics/TopicMetrics";

export const metadata: Metadata = {
  title: "Zeno & Achilles",
  description: "Infinitely many steps, one finite afternoon.",
};

const topic = getTopic("zeno-achilles")!;

const equations = [
  {
    tex: "g_{n} = g_0\\,r^{n},\\quad r = \\tfrac{v_T}{v_A}",
    note: "The gap recursion. Each time Achilles arrives where the tortoise just was, the tortoise has slid ahead by the fixed fraction r, so the deficit shrinks by the same ratio forever.",
  },
  {
    tex: "1 + r + r^2 + \\cdots = \\frac{1}{1-r}",
    note: "The supertask in one line. Infinitely many dashes, every single one demanding real ground, yet their lengths total exactly 1/(1−r) gap-units — a finite budget for an endless to-do list.",
  },
  {
    tex: "t^{*} = \\frac{g_0}{v_A - v_T}",
    note: "The exact catch time. Run the chase as one continuous closing motion at relative speed v_A − v_T and the tortoise is caught after an utterly ordinary afternoon sprint.",
  },
  {
    tex: "S_t(n) = \\sum_{k=1}^{n} \\frac{g_{k-1}}{v_A} \\;\\longrightarrow\\; t^{*}",
    note: "Partial sums of the dash durations climb toward t* and never past it. The stopwatch converging in the lab is this series ticking — infinity, audited and found harmless.",
  },
];

const experiments = [
  "Set “Tortoise speed v_T” near “Achilles speed v_A” and watch r→1 stretch eternity: the dashes crowd together while 1/(1−r) balloons toward a finish that recedes like a horizon.",
  "Flip “Zeno steps” off mid-race for the continuous answer — the same stopwatch glides straight through every remaining dash and crosses the flag at exactly t*.",
  "Shrink “Head start g₀” to tighten convergence: smaller gaps mean fewer visible dashes before the sub-pixel regime swallows the sequence whole.",
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

export default function ZenoAchillesPage() {
  const related = relatedTopics("zeno-achilles");
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
          Achilles, fleetest of mortals, gives a tortoise a head start and
          apparently loses the argument before losing the race: to pass it he
          must first reach where it was, by which point it has crawled a little
          further — forever. Zeno concluded motion itself was suspect. The
          scoreboard says otherwise: watch the gaps collapse by a fixed ratio
          while the stopwatch sweeps through infinitely many dashes to one
          ordinary finishing time. The math wins, the runner still wins.
        </p>
      </Section>

      <Section index="02" title="Explain it like I’m five">
        <p className="leading-relaxed text-fg/90">
          Your friend gets a teeny head start in a race. To pass them,
          first you must reach the exact spot where they stand. But
          while you run there, they creep a little farther! So you run
          to the new spot — and they creep again. Little step, littler
          step, littler still. Do you never catch them? You do! Every
          piece is smaller than the one before, and all those endless
          teeny pieces stack into one ordinary-sized gap. One good
          sprint, and you zoom past.
        </p>
        <p className="leading-relaxed text-fg/90">
          <strong className="text-fg">
            Lots and lots of little steps still end somewhere.
          </strong>
        </p>
      </Section>

              <Section index="03" title="Interactive simulation" wide>

              <ZenoAchillesLab />

              <ProgressToggle slug="zeno-achilles" />
              <TopicMetrics slug="zeno-achilles" />

      </Section>

      <Section index="04" title="The equations">
        <div className="space-y-4">
          {equations.map((row, i) => (
            <DissectibleEquation
              key={row.tex}
              slug="zeno-achilles"
              index={i}
              tex={row.tex}
              decode={row.note}
            />
          ))}
        </div>
      </Section>

      <Section index="05" title="Why it works">
        <p className="leading-relaxed text-fg/90">
          A geometric series is the entire resolution: infinitely many positive
          terms can sum to something perfectly finite, because each term is a
          fixed fraction smaller than the last. The dashes shrink, their
          durations shrink in lockstep, and the partial sums close in on t*
          from below without ever overshooting. Zeno lacked limits, not feet —
          his paradox is a proof that intuition needs the machinery of
          convergence, and once you grant it, the supertask completes on
          schedule. The same appetite for the infinite haunts{" "}
          <Link
            href="/topics/olbers-paradox"
            className="text-accent hover:underline focus-ring rounded-sm"
          >
            Olbers’ paradox
          </Link>
          : both are infinity stories, one about summing endlessly many small
          steps into a finite afternoon, the other about stacking endlessly
          many dim stars into a blazing sky.
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
