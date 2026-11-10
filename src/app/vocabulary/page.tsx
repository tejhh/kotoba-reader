"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Flashcards } from "@/components/Flashcards";
import { LevelBadge } from "@/components/LevelBadge";
import { JLPT_LEVELS, levelRank, type JlptLevel } from "@/lib/parser/types";
import { cn, formatDate } from "@/lib/utils";
import { useAppStore } from "@/store/AppStore";
import type { SavedWord, WordStatus } from "@/store/types";

const STATUSES: WordStatus[] = ["new", "learning", "known"];
const STATUS_STYLES: Record<WordStatus, string> = {
  new: "bg-n4/15 text-n4",
  learning: "bg-n3/15 text-n3",
  known: "bg-n5/15 text-n5",
};
type SortKey = "recent" | "level" | "status";

export default function VocabularyPage() {
  const { state, dispatch } = useAppStore();
  const [levelFilter, setLevelFilter] = useState<JlptLevel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<WordStatus | "all">("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [reviewing, setReviewing] = useState(false);

  const allWords = useMemo(() => Object.values(state.savedWords), [state.savedWords]);

  const words = useMemo(() => {
    const filtered = allWords.filter(
      (w) => (levelFilter === "all" || w.level === levelFilter) && (statusFilter === "all" || w.status === statusFilter),
    );
    const sorters: Record<SortKey, (a: SavedWord, b: SavedWord) => number> = {
      recent: (a, b) => b.addedAt - a.addedAt,
      level: (a, b) => levelRank(a.level) - levelRank(b.level),
      status: (a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status),
    };
    return filtered.sort(sorters[sort]);
  }, [allWords, levelFilter, statusFilter, sort]);

  const counts = useMemo(() => {
    const c: Record<WordStatus, number> = { new: 0, learning: 0, known: 0 };
    for (const w of allWords) c[w.status]++;
    return c;
  }, [allWords]);

  const exportCsv = () => {
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = [
      ["word", "reading", "meanings", "level", "status", "context"],
      ...allWords.map((w) => [w.word, w.reading, w.meanings.join("; "), w.level, w.status, w.context ?? ""]),
    ];
    const blob = new Blob(["﻿" + rows.map((r) => r.map(escape).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kotoba-vocabulary.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (reviewing) return <Flashcards words={allWords} onExit={() => setReviewing(false)} />;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Vocabulary <span className="font-serif text-base font-normal text-ink-faint">単語帳</span>
          </h1>
          <p className="text-sm text-ink-soft">
            {allWords.length} saved · {counts.new} new · {counts.learning} learning · {counts.known} known
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportCsv}
            disabled={allWords.length === 0}
            className="rounded-md border border-line px-3 py-2 text-sm hover:bg-paper-sunken disabled:opacity-40"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => setReviewing(true)}
            disabled={counts.new + counts.learning === 0}
            className="rounded-md bg-shu px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
          >
            Review {counts.new + counts.learning > 0 ? `(${counts.new + counts.learning})` : ""}
          </button>
        </div>
      </header>

      {!state.hydrated ? (
        <p className="py-16 text-center text-ink-faint">読み込み中…</p>
      ) : allWords.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="text-ink-soft">No saved words yet. Tap a word in the reader and press “Save to vocabulary”.</p>
          <Link href="/reader?sample=sample-daily-life" className="mt-4 inline-block text-sm font-medium text-shu hover:underline">
            Open a sample text →
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <FilterGroup
              label="Level"
              options={["all", ...JLPT_LEVELS]}
              value={levelFilter}
              onChange={(v) => setLevelFilter(v as JlptLevel | "all")}
            />
            <FilterGroup
              label="Status"
              options={["all", ...STATUSES]}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as WordStatus | "all")}
            />
            <label className="ml-auto flex items-center gap-2">
              <span className="text-ink-soft">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-md border border-line bg-paper-raised px-2 py-1"
              >
                <option value="recent">Recently added</option>
                <option value="level">JLPT level</option>
                <option value="status">Status</option>
              </select>
            </label>
          </div>

          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-paper-raised">
            {words.map((w) => (
              <li key={w.entryId} className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span lang="ja" className="font-serif text-2xl">{w.word}</span>
                    <span lang="ja" className="text-ink-soft">{w.reading}</span>
                    <LevelBadge level={w.level} />
                  </div>
                  <p className="mt-1 text-sm">{w.meanings.join("; ")}</p>
                  {w.context && <p lang="ja" className="mt-1 truncate font-serif text-xs text-ink-faint">{w.context}</p>}
                  <p className="mt-1 text-[11px] text-ink-faint">Added {formatDate(w.addedAt)} · reviewed {w.reviewCount}×</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={w.status}
                    onChange={(e) => dispatch({ type: "setWordStatus", entryId: w.entryId, status: e.target.value as WordStatus })}
                    className={cn("rounded-md border-0 px-2 py-1 text-xs font-medium", STATUS_STYLES[w.status])}
                    aria-label={`Status for ${w.word}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "removeWord", entryId: w.entryId })}
                    className="rounded p-1 text-ink-faint hover:text-shu"
                    aria-label={`Remove ${w.word}`}
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
            {words.length === 0 && <li className="p-8 text-center text-sm text-ink-faint">No words match these filters.</li>}
          </ul>
        </>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label={label}>
      <span className="mr-1 text-ink-soft">{label}</span>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={cn(
            "rounded-md border px-2 py-1 capitalize",
            value === o ? "border-shu bg-shu-soft text-shu" : "border-line hover:bg-paper-sunken",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
