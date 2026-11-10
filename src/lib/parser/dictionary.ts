import { conjugateWithReading } from "./conjugate";
import type { DictionaryEntry } from "./types";

export interface SurfaceMatch {
  entry: DictionaryEntry;
  reading: string;
  form: string;
  /** 0 = dictionary form of the entry itself, 1 = generated inflection. */
  priority: number;
}

export interface SurfaceIndex {
  map: Map<string, SurfaceMatch>;
  maxLength: number;
}

const SINGLE_HIRAGANA = /^[ぁ-ゟ]$/;
const KANA_ONLY = /^[ぁ-ヿ]+$/;

/**
 * Build a surface-form index from dictionary entries. Every spelling of
 * every entry is conjugated, and the resulting surfaces are stored with a
 * priority so that a word's own dictionary form always beats an inflection
 * of another word (e.g. pronoun あれ beats imperative of ある).
 */
export function buildSurfaceIndex(entries: readonly DictionaryEntry[]): SurfaceIndex {
  const map = new Map<string, SurfaceMatch>();
  let maxLength = 1;

  const insert = (surface: string, match: SurfaceMatch) => {
    if (!surface) return;
    // Single hiragana stems (e.g. い from いる) would match everywhere.
    if (match.priority > 0 && SINGLE_HIRAGANA.test(surface)) return;
    const existing = map.get(surface);
    if (!existing || match.priority < existing.priority) {
      map.set(surface, match);
      if (surface.length > maxLength) maxLength = surface.length;
    }
  };

  for (const entry of entries) {
    const spellings = [entry.word, ...(entry.alt ?? [])];
    for (const spelling of spellings) {
      insert(spelling, { entry, reading: entry.reading, form: "dictionary", priority: 0 });
      // A kana spelling is its own reading; a kanji spelling uses the entry reading.
      const readingBase = KANA_ONLY.test(spelling) ? spelling : entry.reading;
      for (const form of conjugateWithReading(spelling, readingBase, entry.type)) {
        if (form.surface === spelling) continue;
        insert(form.surface, { entry, reading: form.reading, form: form.label, priority: 1 });
      }
    }
  }

  return { map, maxLength };
}
