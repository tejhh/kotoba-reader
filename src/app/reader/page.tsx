import type { Metadata } from "next";
import { Suspense } from "react";
import { ReaderClient } from "./ReaderClient";

export const metadata: Metadata = {
  title: "Reader",
  description: "Paste Japanese text and read it with JLPT vocabulary and grammar highlighting.",
};

export default function ReaderPage() {
  return (
    // useSearchParams() in ReaderClient requires a Suspense boundary.
    <Suspense fallback={<p className="py-20 text-center text-ink-faint">読み込み中…</p>}>
      <ReaderClient />
    </Suspense>
  );
}
