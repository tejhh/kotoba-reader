/**
 * Shared types for the parsing engine. These types are used on both the
 * server (API route) and the client (reader UI), so they must remain
 * plain, JSON-serialisable shapes.
 */

/** Maximum characters accepted by the parser (shared by API and UI). */
export const MAX_TEXT_LENGTH = 20_000;

export type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";

/** Ordered from easiest to hardest. */
export const JLPT_LEVELS: readonly JlptLevel[] = ["N5", "N4", "N3", "N2", "N1"] as const;

/** Numeric difficulty: N5 = 1 (easiest) … N1 = 5 (hardest). */
export function levelRank(level: JlptLevel): number {
  return JLPT_LEVELS.indexOf(level) + 1;
}

export type WordType =
  | "v1" // ichidan verb (食べる)
  | "v5u"
  | "v5k"
  | "v5k-s" // 行く (irregular te/ta form)
  | "v5g"
  | "v5s"
  | "v5t"
  | "v5n"
  | "v5b"
  | "v5m"
  | "v5r"
  | "vk" // 来る
  | "vs-i" // する itself
  | "vs" // noun that takes する (勉強 / 勉強する)
  | "adj-i"
  | "adj-ii" // いい
  | "adj-na"
  | "n"
  | "pn" // pronoun / pre-noun adjectival
  | "prt" // particle
  | "adv"
  | "conj"
  | "cop" // copula forms
  | "exp"; // expression

export interface DictionaryEntry {
  id: string;
  word: string;
  reading: string;
  type: WordType;
  level: JlptLevel;
  meanings: string[];
  /** Alternative spellings (e.g. kana spelling of a kanji word). */
  alt?: string[];
}

export type TokenKind = "word" | "unknown" | "punct" | "space" | "newline" | "latin" | "number";

export interface Token {
  surface: string;
  start: number;
  end: number;
  kind: TokenKind;
  /** Only present when the token matched a dictionary entry. */
  entryId?: string;
  base?: string;
  /** Reading of the dictionary (base) form. */
  baseReading?: string;
  /** Reading of the surface form as it appears in the text. */
  reading?: string;
  level?: JlptLevel;
  type?: WordType;
  meanings?: string[];
  /** Human-readable conjugation label, e.g. "polite past". */
  form?: string;
}

export interface GrammarPoint {
  id: string;
  pattern: string;
  level: JlptLevel;
  meaning: string;
  explanation: string;
  example: string;
  exampleTranslation: string;
}

export interface GrammarRule extends GrammarPoint {
  regex: RegExp;
}

export interface GrammarMatch {
  id: string;
  pattern: string;
  level: JlptLevel;
  meaning: string;
  start: number;
  end: number;
  text: string;
}

export interface LevelCounts {
  N5: number;
  N4: number;
  N3: number;
  N2: number;
  N1: number;
}

export interface ParseStats {
  characterCount: number;
  wordTokenCount: number;
  recognisedWordCount: number;
  uniqueRecognisedWords: number;
  coverage: number; // 0..1
  kanjiCount: number;
  uniqueKanji: number;
  vocabularyByLevel: LevelCounts;
  grammarByLevel: LevelCounts;
  estimatedLevel: JlptLevel;
}

export interface ParseResult {
  text: string;
  tokens: Token[];
  grammar: GrammarMatch[];
  stats: ParseStats;
}

export function emptyLevelCounts(): LevelCounts {
  return { N5: 0, N4: 0, N3: 0, N2: 0, N1: 0 };
}
