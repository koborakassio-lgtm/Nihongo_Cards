import Link from "next/link";

export default function StudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FDFDFE] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 flex flex-col font-sans transition-colors duration-200">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-[#FDFDFE]/90 backdrop-blur-md dark:border-zinc-900 dark:bg-zinc-950/90">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-red-500 shadow-sm shadow-red-500/20">
              <span className="text-white text-xs font-bold font-japanese">日</span>
            </div>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent dark:from-zinc-100 dark:to-zinc-300">
              Nihongo<span className="text-red-500 font-medium">Cards</span>
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            Início
          </Link>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 md:py-10">
        {children}
      </main>
    </div>
  );
}
