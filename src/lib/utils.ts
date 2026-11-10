import type { JlptLevel } from "./parser/types";

/** Join class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function createId(prefix = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Return the sentence surrounding a character offset. */
export function sentenceAt(text: string, offset: number): string {
  const boundary = /[。！？!?\n]/;
  let start = offset;
  while (start > 0 && !boundary.test(text[start - 1])) start--;
  let end = offset;
  while (end < text.length && !boundary.test(text[end])) end++;
  if (end < text.length && text[end] !== "\n") end++; // include the closing punctuation
  return text.slice(start, end).trim();
}

export function containsKanji(text: string): boolean {
  return /\p{Script=Han}/u.test(text);
}

/** Tailwind classes for each JLPT level (text colour, background tint, underline). */
export const LEVEL_STYLES: Record<JlptLevel, { badge: string; token: string; dot: string }> = {
  N5: {
    badge: "bg-n5/15 text-n5 ring-n5/30",
    token: "decoration-n5 bg-n5/10 hover:bg-n5/20",
    dot: "bg-n5",
  },
  N4: {
    badge: "bg-n4/15 text-n4 ring-n4/30",
    token: "decoration-n4 bg-n4/10 hover:bg-n4/20",
    dot: "bg-n4",
  },
  N3: {
    badge: "bg-n3/15 text-n3 ring-n3/30",
    token: "decoration-n3 bg-n3/10 hover:bg-n3/20",
    dot: "bg-n3",
  },
  N2: {
    badge: "bg-n2/15 text-n2 ring-n2/30",
    token: "decoration-n2 bg-n2/10 hover:bg-n2/20",
    dot: "bg-n2",
  },
  N1: {
    badge: "bg-n1/15 text-n1 ring-n1/30",
    token: "decoration-n1 bg-n1/10 hover:bg-n1/20",
    dot: "bg-n1",
  },
};

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
