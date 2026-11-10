import { describe, expect, it } from "vitest";
import { GRAMMAR_RULES } from "@/data/grammar";
import { VOCABULARY } from "@/data/vocabulary";
import { SAMPLE_TEXTS } from "@/data/sample-texts";
import { detectGrammar, parseText, scriptRunSegments } from "@/lib/parser";

const words = (text: string) =>
  parseText(text)
    .tokens.filter((t) => t.kind === "word")
    .map((t) => t.surface);

describe("tokenizer", () => {
  it("covers every character exactly once", () => {
    for (const sample of SAMPLE_TEXTS) {
      const { tokens, text } = parseText(sample.content);
      expect(tokens.map((t) => t.surface).join("")).toBe(text);
      for (let i = 1; i < tokens.length; i++) expect(tokens[i].start).toBe(tokens[i - 1].end);
    }
  });

  it("keeps conjugated verbs together and links them to their dictionary form", () => {
    const { tokens } = parseText("コーヒーを飲みながら新聞を読んでいます。");
    const yonde = tokens.find((t) => t.surface === "読んで");
    expect(yonde?.base).toBe("読む");
    expect(yonde?.reading).toBe("よんで");
    expect(yonde?.baseReading).toBe("よむ");
    expect(yonde?.form).toBe("te-form");
    expect(words("コーヒーを飲みながら新聞を読んでいます。")).toEqual(["コーヒー", "を", "飲み", "ながら", "新聞", "を", "読んで", "います"]);
  });

  it("prefers the longest dictionary match", () => {
    expect(words("日本語を勉強しました")).toEqual(["日本語", "を", "勉強しました"]);
  });

  it("marks unrecognised words as unknown without dropping them", () => {
    const { tokens } = parseText("東京タワーに行った");
    const unknown = tokens.filter((t) => t.kind === "unknown").map((t) => t.surface).join("");
    expect(unknown).toContain("東京");
    expect(tokens.find((t) => t.surface === "行った")?.base).toBe("行く");
  });

  it("classifies punctuation, newlines and latin text", () => {
    const { tokens } = parseText("私はAIです。\n2026年");
    expect(tokens.find((t) => t.surface === "。")?.kind).toBe("punct");
    expect(tokens.find((t) => t.surface === "\n")?.kind).toBe("newline");
    expect(tokens.find((t) => t.surface === "AI")?.kind).toBe("latin");
  });

  it("has a script-run fallback segmenter", () => {
    const segs = scriptRunSegments("日本語をよむ。ABC");
    expect(segs.map((s) => "日本語をよむ。ABC".slice(s.start, s.end))).toEqual(["日本語", "をよむ", "。", "ABC"]);
  });
});

describe("grammar detection", () => {
  it.each(GRAMMAR_RULES.map((r) => [r.id, r] as const))("rule %s matches its own example sentence", (_id, rule) => {
    const ids = detectGrammar(rule.example, GRAMMAR_RULES).map((m) => m.id);
    expect(ids).toContain(rule.id);
  });

  it("returns positions that slice back to the matched text", () => {
    const text = "雨が降るかもしれないので、早く帰ったほうがいいと思います。";
    for (const m of detectGrammar(text, GRAMMAR_RULES)) {
      expect(text.slice(m.start, m.end)).toBe(m.text);
    }
  });

  it("does not treat 例えば as a ba-conditional", () => {
    const ids = detectGrammar("例えば、日本の文化。", GRAMMAR_RULES).map((m) => m.id);
    expect(ids).not.toContain("ba-conditional");
  });

  it("is safe to run repeatedly (no shared regex state)", () => {
    const a = detectGrammar("本を読んでいます。", GRAMMAR_RULES);
    const b = detectGrammar("本を読んでいます。", GRAMMAR_RULES);
    expect(a).toEqual(b);
  });
});

describe("data integrity", () => {
  it("has unique grammar ids", () => {
    const ids = GRAMMAR_RULES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique dictionary ids and non-empty meanings", () => {
    expect(new Set(VOCABULARY.map((v) => v.id)).size).toBe(VOCABULARY.length);
    for (const entry of VOCABULARY) expect(entry.meanings.length).toBeGreaterThan(0);
  });
});

describe("stats", () => {
  it("estimates harder samples at a harder level", () => {
    const rank = { N5: 1, N4: 2, N3: 3, N2: 4, N1: 5 } as const;
    const levels = SAMPLE_TEXTS.map((s) => rank[parseText(s.content).stats.estimatedLevel]);
    expect(levels[2]).toBeGreaterThan(levels[0]);
  });

  it("computes coverage between 0 and 1", () => {
    const { stats } = parseText(SAMPLE_TEXTS[0].content);
    expect(stats.coverage).toBeGreaterThan(0.8);
    expect(stats.coverage).toBeLessThanOrEqual(1);
  });
});
