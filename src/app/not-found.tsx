import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p lang="ja" className="font-serif text-6xl text-ink-faint">迷子</p>
      <h1 className="mt-4 text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-ink-soft">This page seems to have wandered off.</p>
      <Link href="/" className="mt-6 inline-block rounded-md bg-shu px-4 py-2 text-sm font-medium text-white hover:opacity-90">
        Back to home
      </Link>
    </div>
  );
}
