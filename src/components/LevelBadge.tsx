import type { JlptLevel } from "@/lib/parser/types";
import { LEVEL_STYLES, cn } from "@/lib/utils";

export function LevelBadge({ level, className }: { level: JlptLevel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold tracking-wide ring-1 ring-inset",
        LEVEL_STYLES[level].badge,
        className,
      )}
    >
      {level}
    </span>
  );
}
