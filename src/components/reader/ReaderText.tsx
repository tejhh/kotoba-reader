"use client";

import { memo } from "react";
import type { GrammarMatch, Token } from "@/lib/parser/types";
import { levelRank } from "@/lib/parser/types";
import type { Settings } from "@/store/types";
import { LEVEL_STYLES, cn, containsKanji } from "@/lib/utils";

const FONT_SIZES: Record<Settings["fontSize"], string> = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-3xl",
};

interface ReaderTextProps {
  tokens: Token[];
  settings: Settings;
  savedIds: ReadonlySet<string>;
  selectedIndex: number | null;
  activeGrammar: GrammarMatch | null;
  onSelect: (index: number) => void;
}

/**
 * Renders parsed tokens as interactive, colour-coded text. Each dictionary
 * word is a button; unknown words are also clickable so learners can look
 * them up externally.
 */
export const ReaderText = memo(function ReaderText({
  tokens,
  settings,
  savedIds,
  selectedIndex,
  activeGrammar,
  onSelect,
}: ReaderTextProps) {
  return (
    <div lang="ja" className={cn("reader-text font-serif text-ink", FONT_SIZES[settings.fontSize])}>
      {tokens.map((token, index) => {
        if (token.kind === "newline") return <br key={index} />;
        if (token.kind === "space" || token.kind === "punct" || token.kind === "number" || token.kind === "latin") {
          return (
            <span key={index} className={cn(inGrammar(token, activeGrammar) && "bg-highlight")}>
              {token.surface}
            </span>
          );
        }

        const isSelected = index === selectedIndex;
        const isSaved = token.entryId ? savedIds.has(token.entryId) : false;
        const highlightLevel =
          token.level &&
          (settings.userLevel === "none" || levelRank(token.level) > levelRank(settings.userLevel));
        const showRuby = settings.showFurigana && token.reading && containsKanji(token.surface) && token.reading !== token.surface;

        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            title={token.kind === "word" ? `${token.base} · ${token.level}` : "Not in dictionary"}
            className={cn(
              "relative mx-[1px] rounded-sm px-[1px] align-baseline transition-colors",
              token.kind === "word" && highlightLevel && token.level
                ? cn("underline decoration-2 underline-offset-[6px]", LEVEL_STYLES[token.level].token)
                : "hover:bg-paper-sunken",
              token.kind === "unknown" && "text-ink-soft",
              isSaved && "after:absolute after:-top-1 after:right-0 after:h-1.5 after:w-1.5 after:rounded-full after:bg-shu",
              inGrammar(token, activeGrammar) && "bg-highlight",
              isSelected && "ring-2 ring-shu",
            )}
          >
            {showRuby ? (
              <ruby>
                {token.surface}
                <rt>{token.reading}</rt>
              </ruby>
            ) : (
              token.surface
            )}
          </button>
        );
      })}
    </div>
  );
});

function inGrammar(token: Token, match: GrammarMatch | null): boolean {
  return !!match && token.start < match.end && token.end > match.start;
}
