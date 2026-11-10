# Architecture

Kotoba Reader is a single Next.js App Router application. There is no separate
backend service and no database: parsing happens in a Route Handler on the
server, and per-user data (saved words, library, settings) lives in the
browser's `localStorage`. This keeps the app free to host on Vercel's Hobby
plan with zero configuration.

```
Browser                                         Server (Vercel Function)
┌───────────────────────────────┐   POST JSON   ┌──────────────────────────────┐
│ ReaderClient (client comp.)   │ ────────────▶ │ /api/parse  (route.ts)       │
│  └ requestParse() lib/api.ts  │               │  └ parseText()  lib/parser   │
│                               │ ◀──────────── │      ├ tokenize()            │
│ AppStoreProvider              │  ParseResult  │      ├ detectGrammar()       │
│  └ useReducer + localStorage  │               │      └ computeStats()        │
└───────────────────────────────┘               └──────────────────────────────┘
```

## Parsing pipeline (`src/lib/parser`)

| File | Responsibility |
| --- | --- |
| `types.ts` | Shared, JSON-serialisable types (`Token`, `GrammarMatch`, `ParseResult`, …) and level helpers. |
| `conjugate.ts` | **Forward conjugation.** Given a dictionary form and word type, produces every inflected surface (食べる → 食べます, 食べなかった, 食べられる…) with a matching kana reading. |
| `dictionary.ts` | Builds a `Map<surface, entry>` from every spelling × every conjugation. A word's own dictionary form always wins over an inflection of another word (pronoun あれ beats the imperative of ある). Single-hiragana stems are skipped so they can't match everywhere. |
| `tokenize.ts` | Greedy **longest-match** scan over the text using the surface map. Where no dictionary word starts, it falls back to ICU word segmentation (`Intl.Segmenter("ja")`) so unknown words stay intact, and finally to script-run grouping if `Intl.Segmenter` is unavailable. Every input character ends up in exactly one token. |
| `grammar.ts` | Runs each grammar rule's regex over the raw text and returns positioned matches. Regexes are cloned per call, so concurrent requests never share `lastIndex`. |
| `index.ts` | `parseText()` orchestrates the above and computes stats. The surface index is built lazily once per server instance and memoised. |

### Why forward conjugation instead of a morphological analyser?

Full analysers such as kuromoji or MeCab need 20–50 MB dictionaries, which
slows cold starts and can push a serverless bundle over size limits. Forward
conjugation over a curated JLPT dictionary is tiny, fast (a few ms per
request), fully deterministic and easy to test. The trade-off is coverage:
words outside `src/data/vocabulary.ts` are shown as "unknown" (grey) with a
Jisho lookup link. To scale up, generate `vocabulary.ts` from JMdict plus a
JLPT list. The tokenizer needs no changes.

### Estimated level

`estimateLevel()` counts recognised words (×1) and grammar matches (×2) per
level and returns the hardest level that makes up at least 5% of items, so a
single stray N1 word doesn't label a beginner text as N1.

## Data (`src/data`)

* `vocabulary.ts`: compact tuple rows → `DictionaryEntry[]`. Levels follow community lists; the JLPT has published no official lists since 2010.
* `grammar.ts`: `GRAMMAR_RULES` (with regexes, server only) and `GRAMMAR_POINTS` (regex-free, safe to pass to client components).
* `sample-texts.ts`: original passages at N5, N4 and N3.

## Client state (`src/store`)

* `types.ts`: the state shape and action union.
* `reducer.ts`: a pure reducer (unit-tested, no React or DOM).
* `AppStore.tsx`: Context + `useReducer`. It hydrates from `localStorage` **after mount**, so server and first client render match (no hydration warnings), then writes back on every change. Storage failures (private mode, quota) are swallowed and the app keeps working in memory.

## Routes

| Route | Type | Purpose |
| --- | --- | --- |
| `/` | Server component | Landing page, feature overview, sample links |
| `/reader` | Server page + `ReaderClient` (client) in `<Suspense>` | Paste, parse and read; `?id=` opens a library text, `?sample=` a sample |
| `/library` | Client | Saved texts (search, open, delete, import samples) |
| `/vocabulary` | Client | Saved words: filter, sort, change status, CSV export, flashcard review |
| `/grammar` | Server page + `GrammarBrowser` (client) | Searchable grammar reference; anchors like `/grammar#te-iru` |
| `/api/parse` | Route Handler (Node runtime) | `GET` health, `POST {text}` parse |

## API contract

`POST /api/parse`

```json
{ "text": "毎日日本語を勉強しています。" }
```

Responses:

* `200`: `ParseResult` (`{ text, tokens[], grammar[], stats }`)
* `400`: invalid JSON, missing/non-string/empty `text`
* `413`: more than 20,000 characters

`GET /api/parse` → `{ status, dictionaryEntries, grammarRules, maxTextLength }`

## Extending

* **Add words:** append rows to `src/data/vocabulary.ts`. Pick the right `WordType` so conjugations are generated.
* **Add grammar:** append a rule to `src/data/grammar.ts`. The test suite automatically checks that every rule matches its own `example`, so write the example first.
* **Sync across devices:** swap `AppStore`'s localStorage persistence for an API backed by a database (e.g. Vercel Postgres/Neon or Supabase) plus auth. The reducer and UI don't need to change.
