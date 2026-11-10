import type { GrammarMatch, GrammarRule } from "./types";
import { levelRank } from "./types";

/**
 * Run every grammar rule over the text and return all matches, sorted by
 * position (then by difficulty, hardest first, so the UI can show the most
 * interesting pattern first when two overlap).
 */
export function detectGrammar(text: string, rules: readonly GrammarRule[]): GrammarMatch[] {
  const matches: GrammarMatch[] = [];

  for (const rule of rules) {
    // Clone the regex so concurrent requests never share lastIndex state.
    const regex = new RegExp(rule.regex.source, rule.regex.flags.includes("g") ? rule.regex.flags : rule.regex.flags + "g");
    for (const m of text.matchAll(regex)) {
      if (m.index === undefined || m[0].length === 0) continue;
      matches.push({
        id: rule.id,
        pattern: rule.pattern,
        level: rule.level,
        meaning: rule.meaning,
        start: m.index,
        end: m.index + m[0].length,
        text: m[0],
      });
    }
  }

  return matches.sort((a, b) => a.start - b.start || levelRank(b.level) - levelRank(a.level));
}
