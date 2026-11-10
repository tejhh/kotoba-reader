import type { Metadata } from "next";
import { GRAMMAR_POINTS } from "@/data/grammar";
import { GrammarBrowser } from "./GrammarBrowser";

export const metadata: Metadata = {
  title: "Grammar reference",
  description: "JLPT grammar patterns detected by Kotoba Reader, from N5 to N1, with explanations and examples.",
};

export default function GrammarPage() {
  // GRAMMAR_POINTS has no RegExp objects, so it is safe to pass to a client component.
  return <GrammarBrowser points={GRAMMAR_POINTS} />;
}
