"use client";

import { JLPT_LEVELS } from "@/lib/parser/types";
import type { Settings } from "@/store/types";
import { useAppStore } from "@/store/AppStore";
import { cn } from "@/lib/utils";

const FONT_SIZES: Settings["fontSize"][] = ["sm", "md", "lg", "xl"];

/** Display settings for the reader: furigana, level filter, font size. */
export function ReaderToolbar() {
  const { state, dispatch } = useAppStore();
  const { settings } = state;
  const update = (s: Partial<Settings>) => dispatch({ type: "updateSettings", settings: s });

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={settings.showFurigana}
          onChange={(e) => update({ showFurigana: e.target.checked })}
          className="h-4 w-4 accent-shu"
        />
        Furigana
      </label>

      <label className="flex items-center gap-2">
        <span className="text-ink-soft">My level</span>
        <select
          value={settings.userLevel}
          onChange={(e) => update({ userLevel: e.target.value as Settings["userLevel"] })}
          className="rounded-md border border-line bg-paper-raised px-2 py-1"
          title="Words at or below your level are shown without colour"
        >
          <option value="none">Highlight all</option>
          {JLPT_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-center gap-1" role="group" aria-label="Font size">
        {FONT_SIZES.map((size, i) => (
          <button
            key={size}
            type="button"
            onClick={() => update({ fontSize: size })}
            aria-pressed={settings.fontSize === size}
            className={cn(
              "grid h-7 w-7 place-items-center rounded-md border font-serif",
              settings.fontSize === size ? "border-shu bg-shu-soft text-shu" : "border-line hover:bg-paper-sunken",
            )}
            style={{ fontSize: `${11 + i * 2}px` }}
          >
            あ
          </button>
        ))}
      </div>
    </div>
  );
}
