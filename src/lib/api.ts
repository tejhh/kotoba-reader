import type { ParseResult } from "./parser/types";

export class ParseError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ParseError";
  }
}

/** Call the server-side parser. Throws ParseError with a readable message on failure. */
export async function requestParse(text: string, signal?: AbortSignal): Promise<ParseResult> {
  const response = await fetch("/api/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    signal,
  });
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = (data as { error?: string } | null)?.error ?? `Parsing failed (HTTP ${response.status}).`;
    throw new ParseError(message, response.status);
  }
  return data as ParseResult;
}
