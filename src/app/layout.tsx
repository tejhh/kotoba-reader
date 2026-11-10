import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AppStoreProvider } from "@/store/AppStore";

export const metadata: Metadata = {
  title: {
    default: "Kotoba Reader — Japanese immersion reading with JLPT parsing",
    template: "%s · Kotoba Reader",
  },
  description:
    "Paste any Japanese text and read it with automatic JLPT vocabulary levels, grammar pattern detection, furigana and a personal word bank.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f1" },
    { media: "(prefers-color-scheme: dark)", color: "#15130f" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <AppStoreProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">{children}</main>
          <footer className="border-t border-line py-6 text-center text-xs text-ink-faint">
            JLPT levels are approximate and based on community lists. 読書を楽しんでください。
          </footer>
        </AppStoreProvider>
      </body>
    </html>
  );
}
