import Link from "next/link";
import { getDefaultDate } from "@/src/lib/obsidian";

export const dynamic = "force-dynamic";

export default async function NotFoundPage() {
  const defaultDate = await getDefaultDate();

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="paper-card max-w-lg rounded-[32px] px-8 py-10 text-center">
        <div className="text-[11px] tracking-[0.22em] text-muted">AI BRIEF GARDEN</div>
        <h1 className="mt-4 font-serif text-[2rem] text-ink">这篇简报暂时没有找到</h1>
        <p className="mt-4 text-[15px] leading-8 text-ink/68">
          可能是链接已变更，或者当前日期下还没有准备好的内容。
        </p>
        {defaultDate ? (
          <Link
            href={`/daily/${defaultDate}`}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-sm text-ink/78 hover:border-accent/35 hover:text-accent"
          >
            <span aria-hidden="true">←</span>
            <span>返回今日晚报</span>
          </Link>
        ) : null}
      </div>
    </main>
  );
}
