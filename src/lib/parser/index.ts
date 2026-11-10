import { GRAMMAR_RULES } from "../../data/grammar";
import { VOCABULARY } from "../../data/vocabulary";
import { buildSurfaceIndex, type SurfaceIndex } from "./dictionary";
import { detectGrammar } from "./grammar";
import { tokenize } from "./tokenize";
import {
  JLPT_LEVELS,
  MAX_TEXT_LENGTH,
  emptyLevelCounts,
  type GrammarMatch,
  type JlptLevel,
  type ParseResult,
  type ParseStats,
  type Token,
} from "./types";

let cachedIndex: SurfaceIndex | null = null;

/** Lazily build (and memoise) the surface index for the bundled dictionary. */
export function getSurfaceIndex(): SurfaceIndex {
  if (!cachedIndex) cachedIndex = buildSurfaceIndex(VOCABULARY);
  return cachedIndex;
}

const KANJI = /\p{Script=Han}/gu;

/**
 * Estimate the JLPT level of a text: the hardest level that accounts for at
 * least 5% of recognised items (words + grammar), so one stray N1 word in a
 * beginner text doesn't make the whole text "N1".
 */
export function estimateLevel(tokens: Token[], grammar: GrammarMatch[]): JlptLevel {
  const counts = emptyLevelCounts();
  for (const t of tokens) if (t.level) counts[t.level]++;
  for (const g of grammar) counts[g.level] += 2; // grammar weighs more than single words
  const total = JLPT_LEVELS.reduce((sum, lvl) => sum + counts[lvl], 0);
  if (total === 0) return "N5";
  for (const level of [...JLPT_LEVELS].reverse()) {
    if (counts[level] / total >= 0.05) return level;
  }
  return "N5";
}

export function computeStats(text: string, tokens: Token[], grammar: GrammarMatch[]): ParseStats {
  const wordTokens = tokens.filter((t) => t.kind === "word" || t.kind === "unknown");
  const recognised = wordTokens.filter((t) => t.kind === "word");
  const vocabularyByLevel = emptyLevelCounts();
  const seen = new Set<string>();
  for (const t of recognised) {
    if (!t.entryId || !t.level || seen.has(t.entryId)) continue;
    seen.add(t.entryId);
    vocabularyByLevel[t.level]++;
  }
  const grammarByLevel = emptyLevelCounts();
  const seenGrammar = new Set<string>();
  for (const g of grammar) {
    if (seenGrammar.has(g.id)) continue;
    seenGrammar.add(g.id);
    grammarByLevel[g.level]++;
  }
  const kanji = text.match(KANJI) ?? [];

  return {
    characterCount: text.length,
    wordTokenCount: wordTokens.length,
    recognisedWordCount: recognised.length,
    uniqueRecognisedWords: seen.size,
    coverage: wordTokens.length === 0 ? 0 : recognised.length / wordTokens.length,
    kanjiCount: kanji.length,
    uniqueKanji: new Set(kanji).size,
    vocabularyByLevel,
    grammarByLevel,
    estimatedLevel: estimateLevel(recognised, grammar),
  };
}

/** Parse a Japanese text into tokens, grammar matches and statistics. */
export function parseText(input: string): ParseResult {
  const text = input.replace(/\r\n?/g, "\n").slice(0, MAX_TEXT_LENGTH);
  const tokens = tokenize(text, getSurfaceIndex());
  const grammar = detectGrammar(text, GRAMMAR_RULES);
  return { text, tokens, grammar, stats: computeStats(text, tokens, grammar) };
}

export * from "./types";
export { conjugate, conjugateWithReading } from "./conjugate";
export { buildSurfaceIndex } from "./dictionary";
export { detectGrammar } from "./grammar";
export { tokenize, segment, scriptRunSegments } from "./tokenize";
