"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GrammarPanel } from "@/components/reader/GrammarPanel";
import { ReaderText } from "@/components/reader/ReaderText";
import { ReaderToolbar } from "@/components/reader/ReaderToolbar";
import { StatsPanel } from "@/components/reader/StatsPanel";
import { WordPanel } from "@/components/reader/WordPanel";
import { LevelBadge } from "@/components/LevelBadge";
import { SAMPLE_TEXTS } from "@/data/sample-texts";
import { requestParse } from "@/lib/api";
import { MAX_TEXT_LENGTH, type GrammarMatch, type ParseResult } from "@/lib/parser/types";
import { cn, createId, sentenceAt } from "@/lib/utils";
import { useAppStore } from "@/store/AppStore";

type Tab = "word" | "grammar" | "stats";

export function ReaderClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { state, dispatch } = useAppStore();

  const [title, setTitle] = useState("");
  const [input, setInput] = useState("");
  const [libraryId, setLibraryId] = useState<string | null>(null);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeGrammar, setActiveGrammar] = useState<GrammarMatch | null>(null);
  const [tab, setTab] = useState<Tab>("grammar");
  const [sheetOpen, setSheetOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const loadedParamRef = useRef<string | null>(null);

  const parse = useCallback(async (text: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    setSelectedIndex(null);
    setActiveGrammar(null);
    try {
      const parsed = await requestParse(text, controller.signal);
      setResult(parsed);
      setTab("grammar");
      return parsed;
    } catch (err) {
      if ((err as Error).name !== "AbortError") setError((err as Error).message);
      return null;
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }, []);

  // Load a text from ?id= (library) or ?sample= (bundled sample) once the store is hydrated.
  useEffect(() => {
    if (!state.hydrated) return;
    const id = searchParams.get("id");
    const sampleId = searchParams.get("sample");
    const key = id ? `id:${id}` : sampleId ? `sample:${sampleId}` : null;
    if (!key || loadedParamRef.current === key) return;
    loadedParamRef.current = key;

    if (id) {
      const text = state.library.find((t) => t.id === id);
      if (!text) {
        setError("That text is no longer in your library.");
        return;
      }
      setTitle(text.title);
      setInput(text.content);
      setLibraryId(text.id);
      dispatch({ type: "updateText", id: text.id, changes: { lastOpenedAt: Date.now() } });
      void parse(text.content);
    } else if (sampleId) {
      const sample = SAMPLE_TEXTS.find((s) => s.id === sampleId);
      if (sample) {
        setTitle(sample.title);
        setInput(sample.content);
        setLibraryId(null);
        void parse(sample.content);
      }
    }
  }, [state.hydrated, state.library, searchParams, parse, dispatch]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const savedIds = useMemo(() => new Set(Object.keys(state.savedWords)), [state.savedWords]);
  const selectedToken = result && selectedIndex !== null ? result.tokens[selectedIndex] : null;
  const context = result && selectedToken ? sentenceAt(result.text, selectedToken.start) : "";

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index);
    setTab("word");
    setSheetOpen(true);
  }, []);

  const handleParse = async () => {
    const parsed = await parse(input);
    if (parsed && libraryId) {
      dispatch({ type: "updateText", id: libraryId, changes: { content: input, title: title || "Untitled", estimatedLevel: parsed.stats.estimatedLevel } });
    }
  };

  const saveToLibrary = () => {
    if (!input.trim()) return;
    const id = libraryId ?? createId("text");
    const fallbackTitle = input.trim().slice(0, 20) + (input.trim().length > 20 ? "…" : "");
    if (libraryId) {
      dispatch({ type: "updateText", id, changes: { title: title || fallbackTitle, content: input, estimatedLevel: result?.stats.estimatedLevel } });
    } else {
      dispatch({
        type: "addText",
        text: { id, title: title || fallbackTitle, content: input, createdAt: Date.now(), lastOpenedAt: Date.now(), estimatedLevel: result?.stats.estimatedLevel },
      });
      setLibraryId(id);
      loadedParamRef.current = `id:${id}`;
      router.replace(`/reader?id=${id}`, { scroll: false });
    }
  };

  const loadSample = (sampleId: string) => {
    const sample = SAMPLE_TEXTS.find((s) => s.id === sampleId);
    if (!sample) return;
    setTitle(sample.title);
    setInput(sample.content);
    setLibraryId(null);
    loadedParamRef.current = `sample:${sample.id}`;
    router.replace(`/reader?sample=${sample.id}`, { scroll: false });
    void parse(sample.content);
  };

  const clear = () => {
    abortRef.current?.abort();
    setTitle("");
    setInput("");
    setResult(null);
    setLibraryId(null);
    setError(null);
    loadedParamRef.current = null;
    router.replace("/reader", { scroll: false });
  };

  return (
    <div className="space-y-6">
      {/* ── Input ───────────────────────────────────────────── */}
      <section className="rounded-2xl border border-line bg-paper-raised p-4 sm:p-5" aria-labelledby="input-heading">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h1 id="input-heading" className="text-lg font-semibold">
            Reader <span className="font-serif text-sm font-normal text-ink-faint">読む</span>
          </h1>
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <span className="text-ink-faint">Try a sample:</span>
            {SAMPLE_TEXTS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => loadSample(s.id)}
                className="flex items-center gap-1.5 rounded-md border border-line px-2 py-1 hover:bg-paper-sunken"
              >
                <LevelBadge level={s.level} />
                <span lang="ja" className="font-serif">{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="mb-2 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm"
          aria-label="Title"
        />
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ここに日本語の文章を貼り付けてください… (Paste Japanese text here — news, NHK Easy, a novel excerpt, song notes…)"
          lang="ja"
          rows={result ? 3 : 8}
          maxLength={MAX_TEXT_LENGTH}
          className="w-full resize-y rounded-lg border border-line bg-paper px-3 py-2 font-serif text-base leading-relaxed"
          aria-label="Japanese text"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs tabular-nums text-ink-faint">
            {input.length.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()}
          </span>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={clear} className="rounded-md border border-line px-3 py-2 text-sm hover:bg-paper-sunken">
              Clear
            </button>
            <button
              type="button"
              onClick={saveToLibrary}
              disabled={!input.trim()}
              className="rounded-md border border-line px-3 py-2 text-sm hover:bg-paper-sunken disabled:opacity-40"
            >
              {libraryId ? "Update in library" : "Save to library"}
            </button>
            <button
              type="button"
              onClick={handleParse}
              disabled={!input.trim() || loading}
              className="rounded-md bg-shu px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40"
            >
              {loading ? "Parsing…" : "Parse text"}
            </button>
          </div>
        </div>
        {error && (
          <p role="alert" className="mt-3 rounded-md bg-shu-soft px-3 py-2 text-sm text-shu">
            {error}
          </p>
        )}
      </section>

      {/* ── Reading view ────────────────────────────────────── */}
      {result && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="rounded-2xl border border-line bg-paper-raised p-5 sm:p-8" aria-label="Parsed text">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <h2 lang="ja" className="font-serif text-xl">{title || "Untitled"}</h2>
              <ReaderToolbar />
            </div>
            <ReaderText
              tokens={result.tokens}
              settings={state.settings}
              savedIds={savedIds}
              selectedIndex={selectedIndex}
              activeGrammar={activeGrammar}
              onSelect={handleSelect}
            />
            <Legend />
          </section>

          <aside className="space-y-3 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto">
            <div className="flex rounded-lg border border-line bg-paper-raised p-1 text-sm" role="tablist">
              {(
                [
                  ["word", "Word"],
                  ["grammar", `Grammar (${new Set(result.grammar.map((g) => g.id)).size})`],
                  ["stats", "Stats"],
                ] as Array<[Tab, string]>
              ).map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  type="button"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={cn("flex-1 rounded-md px-3 py-1.5", tab === key ? "bg-shu-soft font-medium text-shu" : "text-ink-soft hover:text-ink")}
                >
                  {label}
                </button>
              ))}
            </div>
            {tab === "word" && <WordPanel token={selectedToken} context={context} />}
            {tab === "grammar" && <GrammarPanel matches={result.grammar} active={activeGrammar} onSelect={setActiveGrammar} />}
            {tab === "stats" && <StatsPanel stats={result.stats} />}
          </aside>
        </div>
      )}

      {!result && !loading && (
        <p className="py-10 text-center text-sm text-ink-faint">
          Paste some Japanese above and press <strong>Parse text</strong>, or pick a sample to see how it works.
        </p>
      )}

      {/* Mobile bottom sheet for word details */}
      {selectedToken && sheetOpen && (
        <div className="fixed inset-x-0 bottom-0 z-40 max-h-[65dvh] overflow-y-auto border-t border-line bg-paper p-3 shadow-2xl lg:hidden">
          <WordPanel token={selectedToken} context={context} onClose={() => setSheetOpen(false)} />
        </div>
      )}
    </div>
  );
}

function Legend() {
  const items: Array<[string, string]> = [
    ["N5", "bg-n5"],
    ["N4", "bg-n4"],
    ["N3", "bg-n3"],
    ["N2", "bg-n2"],
    ["N1", "bg-n1"],
  ];
  return (
    <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-4 text-xs text-ink-faint">
      {items.map(([label, color]) => (
        <span key={label} className="flex items-center gap-1">
          <span className={cn("h-2 w-4 rounded-sm", color)} /> {label}
        </span>
      ))}
      <span className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-shu" /> saved
      </span>
      <span className="flex items-center gap-1">
        <span className="h-3 w-4 rounded-sm bg-highlight" /> selected grammar
      </span>
      <span>grey = not in dictionary</span>
    </div>
  );
}
