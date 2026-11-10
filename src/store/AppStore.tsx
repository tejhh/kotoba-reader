"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from "react";
import { appReducer } from "./reducer";
import { INITIAL_STATE, type Action, type AppState } from "./types";

const STORAGE_KEY = "kotoba-reader:v1";

interface StoreValue {
  state: AppState;
  dispatch: Dispatch<Action>;
}

const StoreContext = createContext<StoreValue | null>(null);

function loadPersisted(): Partial<Omit<AppState, "hydrated">> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      savedWords: parsed.savedWords && typeof parsed.savedWords === "object" ? parsed.savedWords : undefined,
      library: Array.isArray(parsed.library) ? parsed.library : undefined,
      settings: parsed.settings && typeof parsed.settings === "object" ? parsed.settings : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Global client store: React context + useReducer, persisted to
 * localStorage. State hydrates after mount so server and client render the
 * same markup on first paint (no hydration mismatch).
 */
export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);

  useEffect(() => {
    dispatch({ type: "hydrate", payload: loadPersisted() });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      const { savedWords, library, settings } = state;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedWords, library, settings }));
    } catch {
      // Storage may be full or unavailable (private mode); the app keeps working in memory.
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore must be used inside <AppStoreProvider>.");
  return ctx;
}
