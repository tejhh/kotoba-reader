import type { WordType } from "./types";

/**
 * Forward conjugation: given a dictionary form and its word type, produce
 * every inflected surface form we want to recognise in running text.
 *
 * Forward generation (rather than de-inflection) lets the tokenizer use a
 * simple longest-match lookup over a precomputed surface → entry map.
 */

export interface ConjugatedForm {
  surface: string;
  label: string;
}

const ICHIDAN_SUFFIXES: Array<[string, string]> = [
  ["る", "dictionary"],
  ["ます", "polite"],
  ["ました", "polite past"],
  ["ません", "polite negative"],
  ["ませんでした", "polite past negative"],
  ["ましょう", "polite volitional"],
  ["ない", "negative"],
  ["なかった", "past negative"],
  ["なくて", "negative te-form"],
  ["ないで", "negative te-form"],
  ["た", "past"],
  ["て", "te-form"],
  ["たり", "tari (listing actions)"],
  ["たい", "want to"],
  ["たくない", "don't want to"],
  ["たかった", "wanted to"],
  ["れば", "conditional (ba)"],
  ["たら", "conditional (tara)"],
  ["よう", "volitional"],
  ["られる", "potential / passive"],
  ["られない", "potential / passive negative"],
  ["られます", "potential / passive polite"],
  ["られた", "potential / passive past"],
  ["させる", "causative"],
  ["させられる", "causative-passive"],
  ["ろ", "imperative"],
  ["", "stem"],
];

interface GodanRow {
  i: string;
  a: string;
  e: string;
  o: string;
  te: string;
  ta: string;
}

const GODAN_ROWS: Record<string, GodanRow> = {
  う: { i: "い", a: "わ", e: "え", o: "お", te: "って", ta: "った" },
  く: { i: "き", a: "か", e: "け", o: "こ", te: "いて", ta: "いた" },
  ぐ: { i: "ぎ", a: "が", e: "げ", o: "ご", te: "いで", ta: "いだ" },
  す: { i: "し", a: "さ", e: "せ", o: "そ", te: "して", ta: "した" },
  つ: { i: "ち", a: "た", e: "て", o: "と", te: "って", ta: "った" },
  ぬ: { i: "に", a: "な", e: "ね", o: "の", te: "んで", ta: "んだ" },
  ぶ: { i: "び", a: "ば", e: "べ", o: "ぼ", te: "んで", ta: "んだ" },
  む: { i: "み", a: "ま", e: "め", o: "も", te: "んで", ta: "んだ" },
  る: { i: "り", a: "ら", e: "れ", o: "ろ", te: "って", ta: "った" },
};

function godanForms(base: string, irregularIku: boolean): ConjugatedForm[] {
  const last = base.slice(-1);
  const stem = base.slice(0, -1);
  const row = GODAN_ROWS[last];
  if (!row) return [{ surface: base, label: "dictionary" }];
  const te = irregularIku ? "って" : row.te;
  const ta = irregularIku ? "った" : row.ta;
  const i = stem + row.i;
  const a = stem + row.a;
  const e = stem + row.e;
  return [
    { surface: base, label: "dictionary" },
    { surface: i + "ます", label: "polite" },
    { surface: i + "ました", label: "polite past" },
    { surface: i + "ません", label: "polite negative" },
    { surface: i + "ませんでした", label: "polite past negative" },
    { surface: i + "ましょう", label: "polite volitional" },
    { surface: i + "たい", label: "want to" },
    { surface: i + "たくない", label: "don't want to" },
    { surface: i + "たかった", label: "wanted to" },
    { surface: i, label: "stem" },
    { surface: a + "ない", label: "negative" },
    { surface: a + "なかった", label: "past negative" },
    { surface: a + "なくて", label: "negative te-form" },
    { surface: a + "ないで", label: "negative te-form" },
    { surface: a + "れる", label: "passive" },
    { surface: a + "れた", label: "passive past" },
    { surface: a + "れて", label: "passive te-form" },
    { surface: a + "せる", label: "causative" },
    { surface: a + "された", label: "causative-passive past" },
    { surface: e + "る", label: "potential" },
    { surface: e + "ない", label: "potential negative" },
    { surface: e + "ます", label: "potential polite" },
    { surface: e + "ば", label: "conditional (ba)" },
    { surface: e, label: "imperative" },
    { surface: stem + row.o + "う", label: "volitional" },
    { surface: stem + te, label: "te-form" },
    { surface: stem + ta, label: "past" },
    { surface: stem + ta + "ら", label: "conditional (tara)" },
    { surface: stem + ta + "り", label: "tari (listing actions)" },
  ];
}

const SURU_FORMS: Array<[string, string]> = [
  ["する", "dictionary"],
  ["します", "polite"],
  ["しました", "polite past"],
  ["しません", "polite negative"],
  ["しませんでした", "polite past negative"],
  ["しましょう", "polite volitional"],
  ["しない", "negative"],
  ["しなかった", "past negative"],
  ["しなくて", "negative te-form"],
  ["した", "past"],
  ["して", "te-form"],
  ["したり", "tari (listing actions)"],
  ["したい", "want to"],
  ["すれば", "conditional (ba)"],
  ["したら", "conditional (tara)"],
  ["しよう", "volitional"],
  ["される", "passive"],
  ["された", "passive past"],
  ["させる", "causative"],
  ["できる", "potential"],
  ["できます", "potential polite"],
  ["しろ", "imperative"],
];

const KURU_FORMS: Array<[string, string]> = [
  ["くる", "dictionary"],
  ["きます", "polite"],
  ["きました", "polite past"],
  ["きません", "polite negative"],
  ["きませんでした", "polite past negative"],
  ["きましょう", "polite volitional"],
  ["こない", "negative"],
  ["こなかった", "past negative"],
  ["きた", "past"],
  ["きて", "te-form"],
  ["きたり", "tari (listing actions)"],
  ["きたい", "want to"],
  ["くれば", "conditional (ba)"],
  ["きたら", "conditional (tara)"],
  ["こよう", "volitional"],
  ["こられる", "potential / passive"],
  ["こい", "imperative"],
];

function iAdjectiveForms(base: string): ConjugatedForm[] {
  const stem = base.slice(0, -1);
  return [
    { surface: base, label: "dictionary" },
    { surface: stem + "く", label: "adverbial" },
    { surface: stem + "くない", label: "negative" },
    { surface: stem + "くなかった", label: "past negative" },
    { surface: stem + "かった", label: "past" },
    { surface: stem + "くて", label: "te-form" },
    { surface: stem + "かったり", label: "tari (listing states)" },
    { surface: stem + "ければ", label: "conditional (ba)" },
    { surface: stem + "さ", label: "nominalised (-sa)" },
    { surface: stem + "そう", label: "looks (-sou)" },
  ];
}

const II_FORMS: Array<[string, string]> = [
  ["いい", "dictionary"],
  ["よく", "adverbial"],
  ["よくない", "negative"],
  ["よくなかった", "past negative"],
  ["よかった", "past"],
  ["よくて", "te-form"],
  ["よければ", "conditional (ba)"],
  ["よさそう", "looks (-sou)"],
];

/**
 * Conjugate a single spelling. For 来る the kanji 来 replaces the first
 * kana of every form (来ます, 来ない …), so both spellings are supported.
 */
export function conjugate(base: string, type: WordType): ConjugatedForm[] {
  switch (type) {
    case "v1":
      return ICHIDAN_SUFFIXES.map(([suffix, label]) => ({
        surface: base.slice(0, -1) + suffix,
        label,
      })).filter((f) => f.surface.length > 0);
    case "v5u":
    case "v5k":
    case "v5g":
    case "v5s":
    case "v5t":
    case "v5n":
    case "v5b":
    case "v5m":
    case "v5r":
      return godanForms(base, false);
    case "v5k-s":
      return godanForms(base, true);
    case "vk": {
      // base is either 来る or くる
      const usesKanji = base.startsWith("来");
      return KURU_FORMS.map(([kana, label]) => ({
        surface: usesKanji ? "来" + kana.slice(1) : kana,
        label,
      }));
    }
    case "vs-i":
      return SURU_FORMS.map(([surface, label]) => ({ surface, label }));
    case "vs":
      return [
        { surface: base, label: "noun" },
        ...SURU_FORMS.map(([suffix, label]) => ({ surface: base + suffix, label: `suru-verb ${label}` })),
      ];
    case "adj-i":
      return iAdjectiveForms(base);
    case "adj-ii":
      return II_FORMS.map(([surface, label]) => ({ surface, label }));
    case "adj-na":
      return [
        { surface: base, label: "dictionary" },
        { surface: base + "な", label: "attributive (na)" },
        { surface: base + "に", label: "adverbial (ni)" },
      ];
    default:
      return [{ surface: base, label: "dictionary" }];
  }
}

/**
 * Conjugate the reading in lock-step with the surface so every generated
 * form also has a kana reading for furigana.
 */
export function conjugateWithReading(
  base: string,
  reading: string,
  type: WordType,
): Array<ConjugatedForm & { reading: string }> {
  const surfaceForms = conjugate(base, type);
  if (type === "vk") {
    const readingForms = conjugate("くる", "vk");
    return surfaceForms.map((f, i) => ({ ...f, reading: readingForms[i].surface }));
  }
  if (type === "vs") {
    return surfaceForms.map((f) => ({
      ...f,
      reading: f.surface.startsWith(base) ? reading + f.surface.slice(base.length) : f.surface,
    }));
  }
  const readingForms = conjugate(reading, type);
  return surfaceForms.map((f, i) => ({
    ...f,
    reading: readingForms[i]?.surface ?? reading,
  }));
}
