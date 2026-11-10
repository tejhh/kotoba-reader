"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { LevelBadge } from "@/components/LevelBadge";
import { SAMPLE_TEXTS } from "@/data/sample-texts";
import { createId, formatDate } from "@/lib/utils";
import { useAppStore } from "@/store/AppStore";

export default function LibraryPage() {
  const { state, dispatch } = useAppStore();
  const [query, setQuery] = useState("");

  const texts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...state.library]
      .filter((t) => !q || t.title.toLowerCase().includes(q) || t.content.includes(query.trim()))
      .sort((a, b) => (b.lastOpenedAt ?? b.createdAt) - (a.lastOpenedAt ?? a.createdAt));
  }, [state.library, query]);

  const importSamples = () => {
    for (const s of SAMPLE_TEXTS) {
      dispatch({
        type: "addText",
        text: { id: createId("text"), title: s.title, content: s.content, createdAt: Date.now(), estimatedLevel: s.level },
      });
    }
  };

  const remove = (id: string, title: string) => {
    if (window.confirm(`Delete "${title}" from your library?`)) dispatch({ type: "removeText", id });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Library <span className="font-serif text-base font-normal text-ink-faint">書庫</span>
          </h1>
          <p className="text-sm text-ink-soft">Texts you&apos;ve saved. Stored in this browser only.</p>
        </div>
        <div className="flex gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-40 rounded-md border border-line bg-paper-raised px-3 py-2 text-sm sm:w-56"
            aria-label="Search library"
          />
          <Link href="/reader" className="rounded-md bg-shu px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            + New text
          </Link>
        </div>
      </header>

      {!state.hydrated ? (
        <p className="py-16 text-center text-ink-faint">読み込み中…</p>
      ) : state.library.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center">
          <p lang="ja" className="font-serif text-3xl text-ink-faint">空っぽ</p>
          <p className="mt-2 text-ink-soft">Your library is empty. Save a text from the reader, or start with the samples.</p>
          <button
            type="button"
            onClick={importSamples}
            className="mt-5 rounded-md border border-line px-4 py-2 text-sm hover:bg-paper-sunken"
          >
            Import {SAMPLE_TEXTS.length} sample texts
          </button>
        </div>
      ) : texts.length === 0 ? (
        <p className="py-10 text-center text-ink-faint">No texts match “{query}”.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {texts.map((t) => (
            <li key={t.id} className="flex flex-col rounded-xl border border-line bg-paper-raised p-5">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/reader?id=${t.id}`} lang="ja" className="font-serif text-lg hover:text-shu">
                  {t.title}
                </Link>
                {t.estimatedLevel && <LevelBadge level={t.estimatedLevel} />}
              </div>
              <p lang="ja" className="mt-2 line-clamp-3 flex-1 font-serif text-sm text-ink-soft">{t.content}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-ink-faint">
                <span>
                  {t.content.length.toLocaleString()} chars · {t.lastOpenedAt ? `opened ${formatDate(t.lastOpenedAt)}` : `added ${formatDate(t.createdAt)}`}
                </span>
                <div className="flex gap-3">
                  <Link href={`/reader?id=${t.id}`} className="font-medium text-shu hover:underline">
                    Read
                  </Link>
                  <button type="button" onClick={() => remove(t.id, t.title)} className="hover:text-shu">
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
