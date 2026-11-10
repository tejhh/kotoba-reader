"use client";

import { useEffect, useState } from "react";
import { LevelBadge } from "@/components/LevelBadge";
import type { SavedWord } from "@/store/types";
import { useAppStore } from "@/store/AppStore";

/**
 * Simple flashcard review. The deck is fixed when the session starts
 * (new + learning words, oldest review first) so grading a card doesn't
 * reshuffle the remaining cards.
 */
export function Flashcards({ words, onExit }: { words: SavedWord[]; onExit: () => void }) {
  const { dispatch } = useAppStore();
  // Lazy initial state: the deck is built once per session.
  const [deck] = useState(() =>
    words
      .filter((w) => w.status !== "known")
      .sort((a, b) => (a.lastReviewedAt ?? 0) - (b.lastReviewedAt ?? 0))
      .map((w) => w.entryId),
  );
  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [tally, setTally] = useState({ again: 0, good: 0, known: 0 });

  const current = words.find((w) => w.entryId === deck[position]);
  const done = position >= deck.length;

  const grade = (result: "again" | "good" | "known") => {
    if (!current) return;
    dispatch({ type: "reviewWord", entryId: current.entryId, result });
    setTally((t) => ({ ...t, [result]: t[result] + 1 }));
    setRevealed(false);
    setPosition((p) => p + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setRevealed(true);
      } else if (revealed && e.key === "1") grade("again");
      else if (revealed && e.key === "2") grade("good");
      else if (revealed && e.key === "3") grade("known");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (deck.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-paper-raised p-10 text-center">
        <p className="text-ink-soft">Nothing to review — every saved word is marked as known. 🎉</p>
        <button type="button" onClick={onExit} className="mt-4 rounded-md border border-line px-4 py-2 text-sm hover:bg-paper-sunken">
          Back to list
        </button>
      </div>
    );
  }

  if (done || !current) {
    return (
      <div className="rounded-2xl border border-line bg-paper-raised p-10 text-center">
        <p lang="ja" className="font-serif text-4xl">お疲れ様！</p>
        <p className="mt-2 text-ink-soft">
          Reviewed {deck.length} {deck.length === 1 ? "card" : "cards"}: {tally.known} known, {tally.good} good, {tally.again} again.
        </p>
        <button type="button" onClick={onExit} className="mt-6 rounded-md bg-shu px-4 py-2 text-sm font-medium text-white hover:opacity-90">
          Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-3 flex items-center justify-between text-sm text-ink-faint">
        <span className="tabular-nums">
          {position + 1} / {deck.length}
        </span>
        <button type="button" onClick={onExit} className="hover:text-ink">
          End session
        </button>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-paper-sunken">
        <div className="h-full bg-shu transition-all" style={{ width: `${(position / deck.length) * 100}%` }} />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-paper-raised p-8 text-center shadow-sm">
        <LevelBadge level={current.level} />
        <p lang="ja" className="mt-4 font-serif text-6xl">{current.word}</p>

        {revealed ? (
          <div className="mt-6 space-y-3">
            <p lang="ja" className="text-xl text-ink-soft">{current.reading}</p>
            <p>{current.meanings.join("; ")}</p>
            {current.context && (
              <p lang="ja" className="mx-auto max-w-md border-t border-line pt-3 font-serif text-sm text-ink-faint">{current.context}</p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mt-8 rounded-md border border-line px-6 py-2 text-sm hover:bg-paper-sunken"
          >
            Show answer <kbd className="ml-1 text-xs text-ink-faint">space</kbd>
          </button>
        )}
      </div>

      {revealed && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <GradeButton label="Again" hint="1" onClick={() => grade("again")} className="border-n1/40 text-n1" />
          <GradeButton label="Good" hint="2" onClick={() => grade("good")} className="border-n4/40 text-n4" />
          <GradeButton label="Known" hint="3" onClick={() => grade("known")} className="border-n5/40 text-n5" />
        </div>
      )}
    </div>
  );
}

function GradeButton({ label, hint, onClick, className }: { label: string; hint: string; onClick: () => void; className: string }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-lg border bg-paper-raised py-3 text-sm font-medium hover:bg-paper-sunken ${className}`}>
      {label} <kbd className="ml-1 text-xs opacity-60">{hint}</kbd>
    </button>
  );
}
