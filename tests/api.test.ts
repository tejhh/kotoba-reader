import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/parse/route";
import type { ParseResult } from "@/lib/parser/types";

const post = (body: unknown, raw = false) =>
  POST(
    new Request("http://localhost/api/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: raw ? (body as string) : JSON.stringify(body),
    }),
  );

describe("/api/parse", () => {
  it("GET reports health and dictionary size", async () => {
    const res = GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("ok");
    expect(json.dictionaryEntries).toBeGreaterThan(100);
  });

  it("parses valid text", async () => {
    const res = await post({ text: "毎日日本語を勉強しています。" });
    expect(res.status).toBe(200);
    const json = (await res.json()) as ParseResult;
    expect(json.tokens.length).toBeGreaterThan(0);
    expect(json.grammar.some((g) => g.id === "te-iru")).toBe(true);
  });

  it("rejects malformed JSON", async () => {
    expect((await post("{not json", true)).status).toBe(400);
  });

  it("rejects missing or empty text", async () => {
    expect((await post({})).status).toBe(400);
    expect((await post({ text: "   " })).status).toBe(400);
    expect((await post({ text: 42 })).status).toBe(400);
  });

  it("rejects text over the length limit", async () => {
    expect((await post({ text: "あ".repeat(20_001) })).status).toBe(413);
  });
});
