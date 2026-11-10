import Link from "next/link";
import { LevelBadge } from "@/components/LevelBadge";
import { SAMPLE_TEXTS } from "@/data/sample-texts";
import { GRAMMAR_RULES } from "@/data/grammar";
import { VOCABULARY } from "@/data/vocabulary";

const FEATURES = [
  {
    jp: "語彙",
    title: "Vocabulary by JLPT level",
    body: "Every recognised word is colour-coded N5 → N1, with conjugations traced back to their dictionary form.",
  },
  {
    jp: "文法",
    title: "Grammar pattern detection",
    body: `${GRAMMAR_RULES.length} grammar patterns are detected automatically, from 〜ている to 〜を余儀なくされる.`,
  },
  {
    jp: "振仮名",
    title: "Furigana on demand",
    body: "Toggle readings above kanji, and hide highlighting for levels you've already mastered.",
  },
  {
    jp: "復習",
    title: "Personal word bank",
    body: "Save words with the sentence you found them in, then review them as flashcards.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16 py-6">
      <section className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="mb-3 text-sm font-medium tracking-wide text-shu">多読 · Immersion reading</p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Read real Japanese.
            <br />
            <span className="text-ink-soft">Understand every line.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-soft">
            Paste any text and Kotoba Reader breaks it down into words and grammar patterns, tagged by JLPT level, so you can
            read above your level without getting lost.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/reader" className="rounded-lg bg-shu px-5 py-3 font-medium text-white hover:opacity-90">
              Start reading →
            </Link>
            <Link href="/grammar" className="rounded-lg border border-line px-5 py-3 font-medium hover:bg-paper-sunken">
              Browse grammar
            </Link>
          </div>
          <p className="mt-6 text-xs text-ink-faint">
            {VOCABULARY.length} dictionary entries · {GRAMMAR_RULES.length} grammar rules · no account needed
          </p>
        </div>

        {/* Decorative preview of the reader */}
        <div aria-hidden className="rounded-2xl border border-line bg-paper-raised p-6 shadow-sm">
          <p lang="ja" className="reader-text font-serif text-2xl">
            <Mock level="n5" reading="わたし">私</Mock>は
            <Mock level="n3" reading="かんきょう">環境</Mock>
            <span className="bg-highlight">について</span>
            <Mock level="n4" reading="しら">調べ</Mock>
            <span className="bg-highlight">ています</span>。
          </p>
          <div className="mt-5 rounded-xl border border-line bg-paper p-4">
            <div className="flex items-center justify-between">
              <span lang="ja" className="font-serif text-2xl">環境</span>
              <LevelBadge level="N3" />
            </div>
            <p className="text-sm text-ink-soft">かんきょう — environment</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">Features</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <li key={f.title} className="rounded-xl border border-line bg-paper-raised p-5">
              <p lang="ja" className="font-serif text-2xl text-shu">{f.jp}</p>
              <h3 className="mt-2 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{f.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="samples-heading">
        <h2 id="samples-heading" className="mb-4 text-xl font-semibold">Try a sample text</h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {SAMPLE_TEXTS.map((s) => (
            <li key={s.id}>
              <Link
                href={`/reader?sample=${s.id}`}
                className="block h-full rounded-xl border border-line bg-paper-raised p-5 transition-colors hover:border-shu"
              >
                <div className="flex items-center justify-between">
                  <span lang="ja" className="font-serif text-lg">{s.title}</span>
                  <LevelBadge level={s.level} />
                </div>
                <p className="mt-1 text-sm text-ink-soft">{s.description}</p>
                <p lang="ja" className="mt-3 line-clamp-2 font-serif text-sm text-ink-faint">{s.content}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Mock({ children, reading, level }: { children: string; reading: string; level: "n5" | "n4" | "n3" }) {
  const styles = {
    n5: "decoration-n5 bg-n5/10",
    n4: "decoration-n4 bg-n4/10",
    n3: "decoration-n3 bg-n3/10",
  } as const;
  return (
    <span className={`mx-[1px] rounded-sm underline decoration-2 underline-offset-[6px] ${styles[level]}`}>
      <ruby>
        {children}
        <rt>{reading}</rt>
      </ruby>
    </span>
  );
}
