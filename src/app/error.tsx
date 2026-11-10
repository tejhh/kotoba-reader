"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="py-24 text-center">
      <p lang="ja" className="font-serif text-5xl text-ink-faint">エラー</p>
      <h1 className="mt-4 text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-ink-soft">An unexpected error occurred while rendering this page.</p>
      <button type="button" onClick={reset} className="mt-6 rounded-md bg-shu px-4 py-2 text-sm font-medium text-white hover:opacity-90">
        Try again
      </button>
    </div>
  );
}
