import { notFound, redirect } from "next/navigation";
import { getDefaultDate } from "@/src/lib/obsidian";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const defaultDate = await getDefaultDate();

  if (!defaultDate) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
        <div className="paper-card max-w-xl rounded-[32px] px-8 py-10 text-center">
          <div className="text-[11px] tracking-[0.22em] text-muted">AI BRIEF GARDEN</div>
          <h1 className="mt-4 font-serif text-[2rem] text-ink">还没有读取到本地简报</h1>
          <p className="mt-4 text-[15px] leading-8 text-ink/68">
            请检查 `.env.local` 里的 `OBSIDIAN_INBOX_DIR` 是否正确，以及对应日期目录下是否存在
            `.md` 文件。
          </p>
        </div>
      </main>
    );
  }

  redirect(`/daily/${defaultDate}`);
}
