import type { LevelCounts, ParseStats } from "@/lib/parser/types";
import { JLPT_LEVELS } from "@/lib/parser/types";
import { LevelBadge } from "@/components/LevelBadge";
import { LEVEL_STYLES, cn } from "@/lib/utils";

export function StatsPanel({ stats }: { stats: ParseStats }) {
  return (
    <div className="space-y-4 rounded-xl border border-line bg-paper-raised p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">Estimated level</p>
        <LevelBadge level={stats.estimatedLevel} className="text-sm" />
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Characters" value={stats.characterCount} />
        <Stat label="Words" value={stats.wordTokenCount} />
        <Stat label="Dictionary coverage" value={`${Math.round(stats.coverage * 100)}%`} />
        <Stat label="Unique kanji" value={stats.uniqueKanji} />
      </dl>

      <LevelBar title="Vocabulary (unique words)" counts={stats.vocabularyByLevel} />
      <LevelBar title="Grammar patterns" counts={stats.grammarByLevel} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-paper-sunken px-3 py-2">
      <dt className="text-xs text-ink-faint">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function LevelBar({ title, counts }: { title: string; counts: LevelCounts }) {
  const total = JLPT_LEVELS.reduce((sum, l) => sum + counts[l], 0);
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-ink-faint">{title}</p>
      {total === 0 ? (
        <p className="text-sm text-ink-faint">None found</p>
      ) : (
        <>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-paper-sunken" role="img" aria-label={`${title} by JLPT level`}>
            {JLPT_LEVELS.map((level) =>
              counts[level] > 0 ? (
                <div key={level} className={cn(LEVEL_STYLES[level].dot)} style={{ width: `${(counts[level] / total) * 100}%` }} />
              ) : null,
            )}
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-soft">
            {JLPT_LEVELS.map((level) => (
              <li key={level} className="flex items-center gap-1">
                <span className={cn("h-2 w-2 rounded-full", LEVEL_STYLES[level].dot)} />
                {level} <span className="tabular-nums text-ink-faint">{counts[level]}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
