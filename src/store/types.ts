import type { JlptLevel } from "@/lib/parser/types";

export type WordStatus = "new" | "learning" | "known";

export interface SavedWord {
  entryId: string;
  word: string;
  reading: string;
  meanings: string[];
  level: JlptLevel;
  status: WordStatus;
  /** The sentence the word was saved from. */
  context?: string;
  addedAt: number;
  reviewCount: number;
  lastReviewedAt?: number;
}

export interface LibraryText {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  lastOpenedAt?: number;
  estimatedLevel?: JlptLevel;
}

export interface Settings {
  showFurigana: boolean;
  /** Words at or below this level are shown without colour highlighting. */
  userLevel: JlptLevel | "none";
  fontSize: "sm" | "md" | "lg" | "xl";
}

export interface AppState {
  savedWords: Record<string, SavedWord>;
  library: LibraryText[];
  settings: Settings;
  hydrated: boolean;
}

export type Action =
  | { type: "hydrate"; payload: Partial<Omit<AppState, "hydrated">> }
  | { type: "saveWord"; word: Omit<SavedWord, "addedAt" | "reviewCount" | "status"> & { status?: WordStatus } }
  | { type: "removeWord"; entryId: string }
  | { type: "setWordStatus"; entryId: string; status: WordStatus }
  | { type: "reviewWord"; entryId: string; result: "again" | "good" | "known" }
  | { type: "addText"; text: LibraryText }
  | { type: "updateText"; id: string; changes: Partial<Omit<LibraryText, "id">> }
  | { type: "removeText"; id: string }
  | { type: "updateSettings"; settings: Partial<Settings> }
  | { type: "reset" };

export const DEFAULT_SETTINGS: Settings = {
  showFurigana: true,
  userLevel: "none",
  fontSize: "lg",
};

export const INITIAL_STATE: AppState = {
  savedWords: {},
  library: [],
  settings: DEFAULT_SETTINGS,
  hydrated: false,
};
