"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAppStore } from "@/store/AppStore";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/reader", label: "Reader", jp: "読む" },
  { href: "/library", label: "Library", jp: "書庫" },
  { href: "/vocabulary", label: "Vocabulary", jp: "単語" },
  { href: "/grammar", label: "Grammar", jp: "文法" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { state } = useAppStore();
  const savedCount = Object.keys(state.savedWords).length;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6" aria-label="Main">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight" onClick={() => setOpen(false)}>
          <span className="grid h-8 w-8 place-items-center rounded-md bg-shu font-serif text-lg text-white">言</span>
          <span>Kotoba Reader</span>
        </Link>

        <button
          type="button"
          className="rounded-md p-2 text-ink-soft sm:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Toggle navigation</span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>

        <ul className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <NavLink {...link} active={pathname.startsWith(link.href)} badge={link.href === "/vocabulary" ? savedCount : 0} />
            </li>
          ))}
        </ul>
      </nav>

      {open && (
        <ul id="mobile-nav" className="border-t border-line px-4 py-2 sm:hidden">
          {LINKS.map((link) => (
            <li key={link.href} onClick={() => setOpen(false)}>
              <NavLink {...link} active={pathname.startsWith(link.href)} badge={link.href === "/vocabulary" ? savedCount : 0} />
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}

function NavLink({ href, label, jp, active, badge }: { href: string; label: string; jp: string; active: boolean; badge: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        active ? "bg-shu-soft text-shu" : "text-ink-soft hover:bg-paper-sunken hover:text-ink",
      )}
    >
      <span className="font-serif text-xs opacity-70">{jp}</span>
      <span>{label}</span>
      {badge > 0 && <span className="rounded-full bg-shu px-1.5 text-[10px] font-semibold leading-4 text-white">{badge}</span>}
    </Link>
  );
}
