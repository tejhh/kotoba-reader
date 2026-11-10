import { DEFAULT_SETTINGS, INITIAL_STATE, type Action, type AppState, type WordStatus } from "./types";

/**
 * Pure reducer for all persisted client state. Kept free of React and
 * browser APIs so it can be unit-tested directly.
 */
export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "hydrate":
      return {
        savedWords: action.payload.savedWords ?? state.savedWords,
        library: action.payload.library ?? state.library,
        settings: { ...DEFAULT_SETTINGS, ...state.settings, ...action.payload.settings },
        hydrated: true,
      };

    case "saveWord": {
      const existing = state.savedWords[action.word.entryId];
      return {
        ...state,
        savedWords: {
          ...state.savedWords,
          [action.word.entryId]: {
            ...action.word,
            status: action.word.status ?? existing?.status ?? "new",
            addedAt: existing?.addedAt ?? Date.now(),
            reviewCount: existing?.reviewCount ?? 0,
            lastReviewedAt: existing?.lastReviewedAt,
            context: action.word.context ?? existing?.context,
          },
        },
      };
    }

    case "removeWord": {
      const { [action.entryId]: _removed, ...rest } = state.savedWords;
      void _removed;
      return { ...state, savedWords: rest };
    }

    case "setWordStatus": {
      const word = state.savedWords[action.entryId];
      if (!word) return state;
      return {
        ...state,
        savedWords: { ...state.savedWords, [action.entryId]: { ...word, status: action.status } },
      };
    }

    case "reviewWord": {
      const word = state.savedWords[action.entryId];
      if (!word) return state;
      const next: Record<typeof action.result, WordStatus> = {
        again: "learning",
        good: word.status === "new" ? "learning" : word.reviewCount >= 2 ? "known" : "learning",
        known: "known",
      };
      return {
        ...state,
        savedWords: {
          ...state.savedWords,
          [action.entryId]: {
            ...word,
            status: next[action.result],
            reviewCount: action.result === "again" ? 0 : word.reviewCount + 1,
            lastReviewedAt: Date.now(),
          },
        },
      };
    }

    case "addText":
      return { ...state, library: [action.text, ...state.library.filter((t) => t.id !== action.text.id)] };

    case "updateText":
      return {
        ...state,
        library: state.library.map((t) => (t.id === action.id ? { ...t, ...action.changes } : t)),
      };

    case "removeText":
      return { ...state, library: state.library.filter((t) => t.id !== action.id) };

    case "updateSettings":
      return { ...state, settings: { ...state.settings, ...action.settings } };

    case "reset":
      return { ...INITIAL_STATE, hydrated: true };

    default:
      return state;
  }
}
