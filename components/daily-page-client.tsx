"use client";

import { useEffect, useState } from "react";
import { BriefCard } from "@/components/brief-card";
import { DailySidebar } from "@/components/daily-sidebar";
import { formatDisplayDate, type BriefGroup } from "@/src/lib/brief-types";

type DailyPageClientProps = {
  initialDate: string;
  initialGroups: BriefGroup[];
};

export function DailyPageClient({ initialDate, initialGroups }: DailyPageClientProps) {
  const [groups, setGroups] = useState(initialGroups);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch("/api/briefs", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("无法读取本地 Obsidian 简报。");
        }

        const data = (await response.json()) as BriefGroup[];
        if (active) {
          setGroups(data);
          setError("");
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : "读取简报失败。");
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const dates = groups.map((group) => group.date);
  const activeGroup = groups.find((group) => group.date === initialDate) ?? null;

  if (!activeGroup) {
    return (
      <main className="min-h-screen bg-paper px-4 py-6 text-ink sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[980px] rounded-[32px] border border-line bg-card px-8 py-10 shadow-paper">
          <h1 className="font-serif text-[2rem] text-ink">这一天还没有可展示的简报</h1>
          <p className="mt-4 text-[15px] leading-8 text-ink/68">
            {error || "当前日期下没有读取到 Markdown 文件，你可以检查 Obsidian 目录或切换到其他日期。"}
          </p>
        </div>
      </main>
    );
  }

  const fineReads = activeGroup.briefs.filter((brief) => brief.status === "值得细读");
  const quickReads = activeGroup.briefs.filter((brief) => brief.status !== "值得细读");
  const primaryBriefs = fineReads.length > 0 ? fineReads : activeGroup.briefs;
  const secondaryBriefs = fineReads.length > 0 ? quickReads : [];

  return (
    <main className="min-h-screen bg-paper px-4 py-6 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
        <DailySidebar
          currentDate={initialDate}
          fineReadCount={fineReads.length}
          dates={dates}
        />

        <section className="mt-6 lg:mt-0">
          <header className="rounded-[34px] border border-line bg-card px-6 py-8 shadow-paper sm:px-10 sm:py-10">
            <div className="text-[11px] tracking-[0.22em] text-muted">DAILY EDITION</div>
            <h1 className="mt-5 max-w-3xl font-serif text-[2.1rem] leading-[1.35] text-ink sm:text-[2.85rem]">
              今晚值得慢慢读的 AI 简报
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              <span>{formatDisplayDate(activeGroup.date)}</span>
              <span className="text-line">·</span>
              <span>今日精选 {activeGroup.count} 条</span>
            </div>

            <p className="mt-5 max-w-3xl text-[15px] leading-8 text-ink/68">
              这里不追求把所有资讯都堆在一起，而是把真正值得花时间读的内容整理成一份中文 AI
              晚报。你可以顺着卡片慢慢往下翻，也可以直接进入单篇精读。
            </p>

            {error ? <p className="mt-4 text-sm text-accent">{error}</p> : null}
          </header>

          <div className="mt-8 space-y-10">
            <section id="jingdu">
              <div className="space-y-5">
                {primaryBriefs.map((brief) => (
                  <BriefCard key={brief.id} brief={brief} />
                ))}
              </div>
            </section>

            {secondaryBriefs.length > 0 ? (
              <section>
                <div className="mb-5">
                  <h2 className="font-serif text-[1.45rem] text-ink">继续浏览</h2>
                  <p className="mt-1 text-sm text-muted">适合快速掌握方向，再决定是否深入。</p>
                </div>

                <div className="space-y-5">
                  {secondaryBriefs.map((brief) => (
                    <BriefCard key={brief.id} brief={brief} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
