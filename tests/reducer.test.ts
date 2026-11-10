import { describe, expect, it } from "vitest";
import { appReducer } from "@/store/reducer";
import { INITIAL_STATE, type AppState } from "@/store/types";

const word = {
  entryId: "w0001",
  word: "食べる",
  reading: "たべる",
  meanings: ["to eat"],
  level: "N5" as const,
};

const hydrated: AppState = appReducer(INITIAL_STATE, { type: "hydrate", payload: {} });

describe("appReducer", () => {
  it("hydrates and keeps default settings", () => {
    expect(hydrated.hydrated).toBe(true);
    expect(hydrated.settings.showFurigana).toBe(true);
  });

  it("saves, updates status and removes words", () => {
    let s = appReducer(hydrated, { type: "saveWord", word });
    expect(s.savedWords.w0001.status).toBe("new");
    s = appReducer(s, { type: "setWordStatus", entryId: "w0001", status: "known" });
    expect(s.savedWords.w0001.status).toBe("known");
    // Saving again keeps the existing status.
    s = appReducer(s, { type: "saveWord", word });
    expect(s.savedWords.w0001.status).toBe("known");
    s = appReducer(s, { type: "removeWord", entryId: "w0001" });
    expect(s.savedWords.w0001).toBeUndefined();
  });

  it("progresses words through review", () => {
    let s = appReducer(hydrated, { type: "saveWord", word });
    s = appReducer(s, { type: "reviewWord", entryId: "w0001", result: "good" });
    expect(s.savedWords.w0001.status).toBe("learning");
    s = appReducer(s, { type: "reviewWord", entryId: "w0001", result: "good" });
    s = appReducer(s, { type: "reviewWord", entryId: "w0001", result: "good" });
    expect(s.savedWords.w0001.status).toBe("known");
    s = appReducer(s, { type: "reviewWord", entryId: "w0001", result: "again" });
    expect(s.savedWords.w0001.status).toBe("learning");
    expect(s.savedWords.w0001.reviewCount).toBe(0);
  });

  it("adds, updates and removes library texts", () => {
    let s = appReducer(hydrated, { type: "addText", text: { id: "t1", title: "A", content: "本", createdAt: 1 } });
    s = appReducer(s, { type: "updateText", id: "t1", changes: { title: "B" } });
    expect(s.library[0].title).toBe("B");
    s = appReducer(s, { type: "removeText", id: "t1" });
    expect(s.library).toHaveLength(0);
  });

  it("updates settings partially", () => {
    const s = appReducer(hydrated, { type: "updateSettings", settings: { userLevel: "N4" } });
    expect(s.settings.userLevel).toBe("N4");
    expect(s.settings.fontSize).toBe(hydrated.settings.fontSize);
  });
});
