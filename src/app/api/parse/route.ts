import { MAX_TEXT_LENGTH, parseText } from "@/lib/parser";
import { GRAMMAR_RULES } from "@/data/grammar";
import { VOCABULARY } from "@/data/vocabulary";

// The parser relies on Intl.Segmenter and Unicode regexes: use the Node runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(): Response {
  return Response.json({
    status: "ok",
    dictionaryEntries: VOCABULARY.length,
    grammarRules: GRAMMAR_RULES.length,
    maxTextLength: MAX_TEXT_LENGTH,
  });
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const text = (body as { text?: unknown } | null)?.text;
  if (typeof text !== "string") {
    return Response.json({ error: "Field `text` must be a string." }, { status: 400 });
  }
  if (text.trim().length === 0) {
    return Response.json({ error: "Text is empty." }, { status: 400 });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return Response.json(
      { error: `Text is too long (${text.length} characters). The limit is ${MAX_TEXT_LENGTH}.` },
      { status: 413 },
    );
  }

  return Response.json(parseText(text));
}
