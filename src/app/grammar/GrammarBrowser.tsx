"use client";

import { useMemo, useState } from "react";
import { LevelBadge } from "@/components/LevelBadge";
import { JLPT_LEVELS, type GrammarPoint, type JlptLevel } from "@/lib/parser/types";
import { cn } from "@/lib/utils";

export function GrammarBrowser({ points }: { points: GrammarPoint[] }) {
  const [level, setLevel] = useState<JlptLevel | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return points.filter(
      (p) =>
        (level === "all" || p.level === level) &&
        (!q ||
          p.pattern.includes(query.trim()) ||
          p.meaning.toLowerCase().includes(q) ||
          p.explanation.toLowerCase().includes(q)),
    );
  }, [points, level, query]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">
          Grammar reference <span className="font-serif text-base font-normal text-ink-faint">文法</span>
        </h1>
        <p className="text-sm text-ink-soft">
          {points.length} patterns the parser detects automatically. Levels are approximate.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", ...JLPT_LEVELS] as const).map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={level === l}
            onClick={() => setLevel(l)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm capitalize",
              level === l ? "border-shu bg-shu-soft text-shu" : "border-line hover:bg-paper-sunken",
            )}
          >
            {l} {l !== "all" && <span className="text-ink-faint">({points.filter((p) => p.level === l).length})</span>}
          </button>
        ))}
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pattern or meaning…"
          className="ml-auto w-full rounded-md border border-line bg-paper-raised px-3 py-1.5 text-sm sm:w-64"
          aria-label="Search grammar"
        />
      </div>

      <ul className="grid gap-4 md:grid-cols-2">
        {filtered.map((p) => (
          <li key={p.id} id={p.id} className="scroll-mt-24 rounded-xl border border-line bg-paper-raised p-5 target:ring-2 target:ring-shu">
            <div className="flex items-start justify-between gap-3">
              <h2 lang="ja" className="font-serif text-xl">{p.pattern}</h2>
              <LevelBadge level={p.level} />
            </div>
            <p className="mt-1 font-medium">{p.meaning}</p>
            <p className="mt-2 text-sm text-ink-soft">{p.explanation}</p>
            <div className="mt-3 rounded-lg bg-paper-sunken px-3 py-2">
              <p lang="ja" className="font-serif">{p.example}</p>
              <p className="text-sm text-ink-faint">{p.exampleTranslation}</p>
            </div>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && <p className="py-10 text-center text-ink-faint">No patterns match your search.</p>}
    </div>
  );
}
