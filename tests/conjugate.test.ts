import { describe, expect, it } from "vitest";
import { conjugate, conjugateWithReading } from "@/lib/parser/conjugate";

const surfaces = (base: string, type: Parameters<typeof conjugate>[1]) => conjugate(base, type).map((f) => f.surface);

describe("conjugate", () => {
  it("conjugates ichidan verbs", () => {
    const forms = surfaces("食べる", "v1");
    expect(forms).toEqual(expect.arrayContaining(["食べる", "食べます", "食べました", "食べない", "食べた", "食べて", "食べたい", "食べられる", "食べ"]));
  });

  it("conjugates godan verbs with the right sound changes", () => {
    expect(surfaces("飲む", "v5m")).toEqual(expect.arrayContaining(["飲みます", "飲まない", "飲んで", "飲んだ", "飲める", "飲もう", "飲めば"]));
    expect(surfaces("書く", "v5k")).toEqual(expect.arrayContaining(["書いて", "書いた", "書かない", "書きます"]));
    expect(surfaces("泳ぐ", "v5g")).toEqual(expect.arrayContaining(["泳いで", "泳いだ"]));
    expect(surfaces("話す", "v5s")).toEqual(expect.arrayContaining(["話して", "話した", "話さない"]));
    expect(surfaces("待つ", "v5t")).toEqual(expect.arrayContaining(["待って", "待った", "待たない"]));
    expect(surfaces("買う", "v5u")).toEqual(expect.arrayContaining(["買って", "買わない", "買われた"]));
    expect(surfaces("帰る", "v5r")).toEqual(expect.arrayContaining(["帰って", "帰らない", "帰れる"]));
  });

  it("handles the irregular te-form of 行く", () => {
    const forms = surfaces("行く", "v5k-s");
    expect(forms).toContain("行って");
    expect(forms).toContain("行った");
    expect(forms).not.toContain("行いて");
  });

  it("conjugates する and 来る", () => {
    expect(surfaces("する", "vs-i")).toEqual(expect.arrayContaining(["します", "しない", "した", "して", "できる"]));
    expect(surfaces("来る", "vk")).toEqual(expect.arrayContaining(["来ます", "来ない", "来た", "来て"]));
    expect(surfaces("くる", "vk")).toEqual(expect.arrayContaining(["きます", "こない", "きた"]));
  });

  it("conjugates suru-nouns", () => {
    expect(surfaces("勉強", "vs")).toEqual(expect.arrayContaining(["勉強", "勉強する", "勉強した", "勉強して", "勉強すれば"]));
  });

  it("conjugates adjectives", () => {
    expect(surfaces("高い", "adj-i")).toEqual(expect.arrayContaining(["高く", "高くない", "高かった", "高くて", "高ければ"]));
    expect(surfaces("いい", "adj-ii")).toEqual(expect.arrayContaining(["よく", "よかった", "よければ"]));
    expect(surfaces("静か", "adj-na")).toEqual(expect.arrayContaining(["静か", "静かな", "静かに"]));
  });

  it("produces readings in lock-step with surfaces", () => {
    const forms = conjugateWithReading("来る", "くる", "vk");
    expect(forms.find((f) => f.surface === "来ない")?.reading).toBe("こない");
    expect(forms.find((f) => f.surface === "来ます")?.reading).toBe("きます");

    const study = conjugateWithReading("勉強", "べんきょう", "vs");
    expect(study.find((f) => f.surface === "勉強した")?.reading).toBe("べんきょうした");

    const drink = conjugateWithReading("飲む", "のむ", "v5m");
    expect(drink.find((f) => f.surface === "飲んで")?.reading).toBe("のんで");
  });
});
