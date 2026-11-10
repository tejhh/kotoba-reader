"use client";

import type { Token } from "@/lib/parser/types";
import { LevelBadge } from "@/components/LevelBadge";
import { useAppStore } from "@/store/AppStore";

const TYPE_LABELS: Record<string, string> = {
  v1: "Ichidan verb",
  v5u: "Godan verb",
  v5k: "Godan verb",
  "v5k-s": "Godan verb (irregular te-form)",
  v5g: "Godan verb",
  v5s: "Godan verb",
  v5t: "Godan verb",
  v5n: "Godan verb",
  v5b: "Godan verb",
  v5m: "Godan verb",
  v5r: "Godan verb",
  vk: "Irregular verb (来る)",
  "vs-i": "Irregular verb (する)",
  vs: "Noun / する-verb",
  "adj-i": "い-adjective",
  "adj-ii": "い-adjective (irregular)",
  "adj-na": "な-adjective",
  n: "Noun",
  pn: "Pronoun / pre-noun",
  prt: "Particle",
  adv: "Adverb",
  conj: "Conjunction",
  cop: "Copula",
  exp: "Expression",
};

interface WordPanelProps {
  token: Token | null;
  context: string;
  onClose?: () => void;
}

export function WordPanel({ token, context, onClose }: WordPanelProps) {
  const { state, dispatch } = useAppStore();

  if (!token) {
    return (
      <div className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-faint">
        Tap any word in the text to see its reading, meaning and JLPT level.
      </div>
    );
  }

  const jishoUrl = `https://jisho.org/search/${encodeURIComponent(token.base ?? token.surface)}`;

  if (token.kind !== "word" || !token.entryId || !token.level) {
    return (
      <div className="space-y-3 rounded-xl border border-line bg-paper-raised p-5">
        <PanelHeader onClose={onClose} />
        <p lang="ja" className="font-serif text-3xl">{token.surface}</p>
        <p className="text-sm text-ink-soft">
          This word isn&apos;t in the built-in dictionary yet. It may be a name, a rarer word, or a form the parser doesn&apos;t recognise.
        </p>
        <a href={jishoUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-medium text-shu hover:underline">
          Look it up on Jisho ↗
        </a>
      </div>
    );
  }

  const saved = state.savedWords[token.entryId];

  const save = () =>
    dispatch({
      type: "saveWord",
      word: {
        entryId: token.entryId!,
        word: token.base ?? token.surface,
        reading: dictionaryReading(token),
        meanings: token.meanings ?? [],
        level: token.level!,
        context,
      },
    });

  return (
    <div className="space-y-4 rounded-xl border border-line bg-paper-raised p-5">
      <PanelHeader onClose={onClose} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p lang="ja" className="font-serif text-4xl leading-tight">{token.base}</p>
          <p lang="ja" className="mt-1 text-ink-soft">{dictionaryReading(token)}</p>
        </div>
        <LevelBadge level={token.level} className="mt-2 text-xs" />
      </div>

      {token.surface !== token.base && (
        <p className="rounded-md bg-paper-sunken px-3 py-2 text-sm">
          <span lang="ja" className="font-serif">{token.surface}</span>
          <span className="text-ink-faint"> — {token.form}</span>
        </p>
      )}

      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-ink-faint">{TYPE_LABELS[token.type ?? ""] ?? "Word"}</p>
        <ol className="list-decimal space-y-0.5 pl-5 text-sm">
          {(token.meanings ?? []).map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ol>
      </div>

      {context && (
        <blockquote lang="ja" className="border-l-2 border-shu pl-3 font-serif text-sm text-ink-soft">
          {context}
        </blockquote>
      )}

      <div className="flex flex-wrap gap-2">
        {saved ? (
          <button
            type="button"
            onClick={() => dispatch({ type: "removeWord", entryId: token.entryId! })}
            className="rounded-md border border-line px-3 py-2 text-sm hover:bg-paper-sunken"
          >
            ✓ Saved — remove
          </button>
        ) : (
          <button type="button" onClick={save} className="rounded-md bg-shu px-3 py-2 text-sm font-medium text-white hover:opacity-90">
            + Save to vocabulary
          </button>
        )}
        <a href={jishoUrl} target="_blank" rel="noopener noreferrer" className="rounded-md border border-line px-3 py-2 text-sm hover:bg-paper-sunken">
          Jisho ↗
        </a>
      </div>
    </div>
  );
}

function PanelHeader({ onClose }: { onClose?: () => void }) {
  if (!onClose) return null;
  return (
    <div className="-mb-2 flex justify-end">
      <button type="button" onClick={onClose} className="rounded p-1 text-ink-faint hover:text-ink" aria-label="Close word details">
        ✕
      </button>
    </div>
  );
}

function dictionaryReading(token: Token): string {
  return token.baseReading ?? token.reading ?? token.surface;
}
