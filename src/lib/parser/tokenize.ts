import type { SurfaceIndex } from "./dictionary";
import type { Token, TokenKind } from "./types";

interface Segment {
  start: number;
  end: number;
}

const PUNCT = /^[\p{P}\p{S}]+$/u;
const SPACE = /^[^\S\n]+$/u;
const LATIN = /^[A-Za-zＡ-Ｚａ-ｚ'’-]+$/;
const NUMBER = /^[0-9０-９.,]+$/;

/**
 * Split text into coarse segments. Uses ICU word segmentation via
 * Intl.Segmenter when available (Node 20+, all evergreen browsers) and
 * falls back to grouping consecutive characters of the same script.
 */
export function segment(text: string): Segment[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("ja", { granularity: "word" });
    return Array.from(segmenter.segment(text), (s) => ({
      start: s.index,
      end: s.index + s.segment.length,
    }));
  }
  return scriptRunSegments(text);
}

function scriptOf(char: string): string {
  if (char === "\n") return "newline";
  if (/\s/.test(char)) return "space";
  if (/\p{Script=Han}/u.test(char)) return "han";
  if (/\p{Script=Hiragana}/u.test(char)) return "hiragana";
  if (/[\p{Script=Katakana}ー]/u.test(char)) return "katakana";
  if (/[A-Za-z]/.test(char)) return "latin";
  if (/[0-9]/.test(char)) return "number";
  return `other:${char}`; // every punctuation mark stands alone
}

export function scriptRunSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  let start = 0;
  for (let i = 1; i <= text.length; i++) {
    if (i === text.length || scriptOf(text[i]) !== scriptOf(text[i - 1]) || text[i - 1] === "\n") {
      segments.push({ start, end: i });
      start = i;
    }
  }
  return segments;
}

function classify(surface: string): TokenKind {
  if (surface === "\n") return "newline";
  if (SPACE.test(surface)) return "space";
  if (NUMBER.test(surface)) return "number";
  if (LATIN.test(surface)) return "latin";
  if (PUNCT.test(surface)) return "punct";
  return "unknown";
}

/**
 * Tokenise Japanese text using greedy longest-match against the surface
 * index. Wherever no dictionary word starts, the ICU segment covering the
 * current position is emitted as an unknown token, so every character of
 * the input ends up in exactly one token.
 */
export function tokenize(text: string, index: SurfaceIndex): Token[] {
  const tokens: Token[] = [];
  const normalised = text.replace(/\r\n?/g, "\n");
  const segments = segment(normalised);
  let segPointer = 0;
  let i = 0;

  while (i < normalised.length) {
    const char = normalised[i];

    if (char === "\n") {
      tokens.push({ surface: "\n", start: i, end: i + 1, kind: "newline" });
      i += 1;
      continue;
    }

    // Longest dictionary match starting at i.
    let matched = false;
    const maxLen = Math.min(index.maxLength, normalised.length - i);
    for (let len = maxLen; len >= 1; len--) {
      const candidate = normalised.slice(i, i + len);
      const hit = index.map.get(candidate);
      if (hit) {
        tokens.push({
          surface: candidate,
          start: i,
          end: i + len,
          kind: "word",
          entryId: hit.entry.id,
          base: hit.entry.word,
          baseReading: hit.entry.reading,
          reading: hit.reading,
          level: hit.entry.level,
          type: hit.entry.type,
          meanings: hit.entry.meanings,
          form: hit.form,
        });
        i += len;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Fall back to the ICU segment that contains position i.
    while (segPointer < segments.length && segments[segPointer].end <= i) segPointer++;
    let end = segPointer < segments.length ? segments[segPointer].end : i + 1;
    const newlineAt = normalised.indexOf("\n", i);
    if (newlineAt !== -1 && newlineAt < end) end = newlineAt;
    if (end <= i) end = i + 1;

    const surface = normalised.slice(i, end);
    tokens.push({ surface, start: i, end, kind: classify(surface) });
    i = end;
  }

  return mergeUnknownRuns(tokens);
}

/** Merge adjacent unknown tokens of the same script (e.g. split katakana). */
function mergeUnknownRuns(tokens: Token[]): Token[] {
  const out: Token[] = [];
  for (const token of tokens) {
    const prev = out[out.length - 1];
    if (
      prev &&
      prev.kind === "unknown" &&
      token.kind === "unknown" &&
      /^[\p{Script=Katakana}ー]+$/u.test(prev.surface) &&
      /^[\p{Script=Katakana}ー]+$/u.test(token.surface)
    ) {
      prev.surface += token.surface;
      prev.end = token.end;
      continue;
    }
    out.push({ ...token });
  }
  return out;
}

export function isWordToken(token: Token): boolean {
  return token.kind === "word" || token.kind === "unknown";
}
