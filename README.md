# Kotoba Reader 言葉リーダー

A Japanese immersion-reading app. Paste any Japanese text and it is broken
down into words and grammar patterns, each tagged with an approximate JLPT
level (N5 → N1). Includes furigana, a personal word bank with flashcard
review, and a library of saved texts.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Vitest

---

## Features

* **Automatic parsing:** server-side tokenizer with conjugation tracing (読んでいます → 読む + いる), 370 dictionary entries and 72 grammar rules.
* **JLPT colour coding:** words are underlined by level. Set "My level" to stop highlighting words you already know.
* **Grammar detection:** patterns from 〜ている to 〜を余儀なくされる. Click an occurrence to highlight it in the text.
* **Furigana:** readings for every recognised kanji word, toggleable.
* **Word bank:** save words with their source sentence, filter and sort them, export to CSV (Anki-friendly), and review with flashcards (keyboard: `space`, `1` `2` `3`).
* **Library:** save texts and reopen them later (`/reader?id=…`).
* **Text stats:** estimated level, dictionary coverage, kanji count, and level distribution.
* **Responsive:** sidebar on desktop, bottom sheet on mobile. Light and dark mode follow the OS setting.
* **Zero config:** no database and no environment variables. User data stays in the browser's `localStorage`.

## Project structure

```
kotoba-reader/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout: navbar, store provider, footer
│   │   ├── page.tsx                 # Landing page
│   │   ├── globals.css              # Tailwind v4 + design tokens (light/dark)
│   │   ├── icon.svg                 # Favicon
│   │   ├── error.tsx / not-found.tsx
│   │   ├── reader/
│   │   │   ├── page.tsx             # Server wrapper (Suspense boundary)
│   │   │   └── ReaderClient.tsx     # Input, parsing, reading view, side panels
│   │   ├── library/page.tsx         # Saved texts
│   │   ├── vocabulary/page.tsx      # Word bank + flashcard review
│   │   ├── grammar/
│   │   │   ├── page.tsx             # Server page
│   │   │   └── GrammarBrowser.tsx   # Searchable grammar reference
│   │   └── api/parse/route.ts       # POST /api/parse  (GET = health check)
│   ├── components/
│   │   ├── Navbar.tsx, LevelBadge.tsx, Flashcards.tsx
│   │   └── reader/                  # ReaderText, WordPanel, GrammarPanel, StatsPanel, ReaderToolbar
│   ├── lib/
│   │   ├── parser/                  # Parsing engine (framework-free, unit-tested)
│   │   │   ├── types.ts             # Shared types
│   │   │   ├── conjugate.ts         # Forward conjugation (verbs, adjectives)
│   │   │   ├── dictionary.ts        # Surface-form index
│   │   │   ├── tokenize.ts          # Longest-match tokenizer + ICU fallback
│   │   │   ├── grammar.ts           # Regex grammar detector
│   │   │   └── index.ts             # parseText() + stats
│   │   ├── api.ts                   # Typed client for /api/parse
│   │   └── utils.ts                 # cn(), sentenceAt(), level styles…
│   ├── store/                       # Client state: Context + useReducer + localStorage
│   │   ├── AppStore.tsx, reducer.ts, types.ts
│   └── data/
│       ├── vocabulary.ts            # Dictionary with JLPT levels
│       ├── grammar.ts               # Grammar rules
│       └── sample-texts.ts          # Original N5/N4/N3 reading passages
├── tests/                           # Vitest: conjugation, parser, grammar, API, reducer
├── docs/ARCHITECTURE.md             # Design decisions and extension guide
├── next.config.ts, tsconfig.json, postcss.config.mjs, vitest.config.ts
└── package.json
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how the parser works and how to extend it.

---

## Local development

### Prerequisites

* **Node.js 20.9 or newer** (required by Next.js 16). Check with `node -v`. Node 22 LTS is recommended.
* npm 10+ (bundled with Node)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (Turbopack)
npm run dev
```

Open <http://localhost:3000>. Try a sample text from the home page, or go to
**Reader** and paste your own Japanese.

### Available scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload at `localhost:3000` |
| `npm run build` | Production build (also type-checks) |
| `npm start` | Serve the production build (run `build` first) |
| `npm run typecheck` | TypeScript check without emitting |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |

### Trying the API directly

```bash
# Health check
curl http://localhost:3000/api/parse

# Parse a sentence
curl -X POST http://localhost:3000/api/parse \
  -H "Content-Type: application/json" \
  -d '{"text":"毎日日本語を勉強しています。"}'
```

---

## Testing

```bash
npm test
```

The suite (Vitest, Node environment) covers:

| File | Covers |
| --- | --- |
| `tests/conjugate.test.ts` | Ichidan, godan sound changes, irregular 行く/する/来る, adjectives, readings |
| `tests/parser.test.ts` | Token coverage of every character, longest-match, unknown words, punctuation, **every grammar rule matches its own example sentence**, data integrity, level estimation |
| `tests/api.test.ts` | `GET` health, valid parse, 400 on bad JSON / empty / non-string text, 413 on oversized text |
| `tests/reducer.test.ts` | Saving words, status changes, review progression, library CRUD, settings |

Before deploying, run the same checks Vercel will:

```bash
npm run typecheck && npm test && npm run build
```

### Manual test checklist

1. Home → click the **私の毎日** sample. Words are coloured and the Grammar tab lists 〜ている, 〜ながら and 〜たり〜たりする.
2. Click 読んだり. The Word tab shows 読む (よむ), N5, "tari (listing actions)".
3. Click **Save to vocabulary**. A red dot appears on the word and the navbar badge increments.
4. Toggle **Furigana** off and on, change **My level** to N5 (N5 words lose their colour), and change the font size.
5. Grammar tab → click an occurrence. It highlights in yellow in the text.
6. **Save to library**, reload the page, and open it from **Library**. Everything persists.
7. **Vocabulary** → **Review**. Use `space` to reveal and `1`/`2`/`3` to grade.
8. Resize to phone width. Tapping a word opens the bottom sheet.

---

## Deploying to Vercel (free)

The app needs no database, secrets or environment variables, so it deploys
on Vercel's free **Hobby** plan as-is. The `/api/parse` route runs as a
serverless function on the Node.js runtime.

### Option A: GitHub + Vercel dashboard (recommended)

1. **Create a GitHub repository** (for example `kotoba-reader`) and push the project:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/kotoba-reader.git
   git push -u origin main
   ```

2. **Sign up / log in** at <https://vercel.com> with your GitHub account (the Hobby plan is free for personal, non-commercial use).
3. Click **Add New… → Project**, then **Import** your `kotoba-reader` repository. Grant Vercel access to the repo if prompted.
4. **Configure project:** Vercel auto-detects **Next.js**. Leave the defaults:
   * Framework Preset: Next.js
   * Root Directory: `./`
   * Build Command: `next build` (default)
   * Output Directory: default
   * Install Command: `npm install` (default)
   * Environment Variables: none needed
5. Click **Deploy**. After about a minute you get a URL like `https://kotoba-reader-xxxx.vercel.app`.
6. **Verify:** open the URL, load a sample text, and visit `https://<your-url>/api/parse`. It should return `{"status":"ok",…}`.

From then on, every push to `main` redeploys production automatically, and
every pull request gets its own preview URL.

### Option B: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel          # first run: link/create the project, deploys a preview
vercel --prod   # deploy to production
```

### Optional settings

* **Node version:** `package.json` declares `"engines": { "node": ">=20.9.0" }`. If the build complains about Node, set **Settings → Build and Deployment → Node.js Version** to 22.x (or 20.x).
* **Custom domain:** go to **Settings → Domains → Add**, then follow the DNS instructions. Free `*.vercel.app` subdomains work without setup.
* **Region:** the parse function is stateless and fast, so the default region is fine.

### Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Node.js version >=20.9.0 is required` | Update Node locally, or set the Node.js version in Vercel project settings |
| Build fails on a type error | Run `npm run typecheck` locally and fix the errors it reports; Vercel runs the same check during `next build` |
| `/api/parse` returns 413 | Text is over 20,000 characters. Split it, or raise `MAX_TEXT_LENGTH` in `src/lib/parser/types.ts` |
| Saved words vanished | Data lives in that browser's `localStorage`. Clearing site data, private windows or another device start empty |

---

## Notes and limitations

* **JLPT levels are approximate.** The JLPT has published no official vocabulary or grammar lists since 2010; levels follow common community lists.
* **Dictionary coverage** is deliberately compact so the serverless function stays small and fast. Words not in `src/data/vocabulary.ts` show in grey with a Jisho lookup link. You can extend the file by hand or generate it from JMdict.
* **Grammar detection is pattern-based** (regular expressions), so expect occasional false positives or misses on unusual phrasings.
* Sample texts are original passages written for this project.

## License

MIT. External dictionary data you add (e.g. JMdict) comes with its own license terms.
