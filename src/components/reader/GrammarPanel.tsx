"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { GrammarMatch } from "@/lib/parser/types";
import { LevelBadge } from "@/components/LevelBadge";
import { cn } from "@/lib/utils";

interface GrammarPanelProps {
  matches: GrammarMatch[];
  active: GrammarMatch | null;
  onSelect: (match: GrammarMatch | null) => void;
}

/** Groups grammar matches by pattern; clicking an occurrence highlights it in the text. */
export function GrammarPanel({ matches, active, onSelect }: GrammarPanelProps) {
  const groups = useMemo(() => {
    const map = new Map<string, GrammarMatch[]>();
    for (const m of matches) {
      const list = map.get(m.id) ?? [];
      list.push(m);
      map.set(m.id, list);
    }
    return [...map.values()];
  }, [matches]);

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-faint">
        No grammar patterns detected in this text.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {groups.map((group) => {
        const first = group[0];
        return (
          <li key={first.id} className="rounded-xl border border-line bg-paper-raised p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p lang="ja" className="font-serif text-lg">{first.pattern}</p>
                <p className="text-sm text-ink-soft">{first.meaning}</p>
              </div>
              <LevelBadge level={first.level} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {group.map((m) => {
                const isActive = active?.start === m.start && active?.id === m.id;
                return (
                  <button
                    key={`${m.id}-${m.start}`}
                    type="button"
                    lang="ja"
                    onClick={() => onSelect(isActive ? null : m)}
                    className={cn(
                      "rounded-md border px-2 py-1 font-serif text-sm transition-colors",
                      isActive ? "border-shu bg-highlight" : "border-line hover:bg-paper-sunken",
                    )}
                  >
                    {m.text}
                  </button>
                );
              })}
            </div>
            <Link href={`/grammar#${first.id}`} className="mt-2 inline-block text-xs text-shu hover:underline">
              Explanation & example →
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
