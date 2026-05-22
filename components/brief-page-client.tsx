"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDisplayDate, type Brief } from "@/src/lib/brief-types";

type BriefPageClientProps = {
  id: string;
  initialBrief: Brief;
};

function splitParagraphs(content: string) {
  return content
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function BriefPageClient({ id, initialBrief }: BriefPageClientProps) {
  const [brief, setBrief] = useState(initialBrief);
  const [error, setError] = useState("");
  const coreSummaryParagraphs = splitParagraphs(brief.coreSummary);
  const pmInsightParagraphs = splitParagraphs(brief.pmInsight);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await fetch(`/api/briefs/${id}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("无法读取这篇本地简报。");
        }

        const data = (await response.json()) as Brief;
        if (active) {
          setBrief(data);
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
  }, [id]);

  return (
    <main className="min-h-screen bg-paper px-4 py-6 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <Link
          href={`/daily/${brief.date}`}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-sm text-ink/78 shadow-sm hover:border-accent/35 hover:text-accent"
        >
          <span aria-hidden="true">←</span>
          <span>返回今日晚报</span>
        </Link>

        <article className="paper-card mx-auto mt-6 max-w-[1040px] rounded-[36px] px-6 py-8 sm:px-10 sm:py-12">
          <header className="border-b border-line pb-8">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
              <span>{formatDisplayDate(brief.date)}</span>
            </div>

            <h1 className="mt-6 font-serif text-[2.15rem] leading-[1.45] text-ink sm:text-[2.7rem]">
              {brief.title}
            </h1>

            <p className="mt-6 text-[1.05rem] leading-9 text-ink/80">{brief.oneSentenceSummary}</p>

            <div className="mt-8 rounded-[24px] border border-line bg-paper px-5 py-5">
              <div className="text-[11px] tracking-[0.18em] text-muted">推荐阅读理由</div>
              <p className="mt-3 text-[15px] leading-8 text-ink/72">{brief.recommendationReason}</p>
            </div>

            {error ? <p className="mt-4 text-sm text-accent">{error}</p> : null}
          </header>

          <div className="article-copy mt-10 space-y-8">
            <section className="article-section-card space-y-5 rounded-[28px] border border-line/75 bg-white/72 px-6 py-6 sm:px-8 sm:py-7">
              <div className="space-y-1">
                <div className="text-[11px] tracking-[0.2em] text-muted">CORE SUMMARY</div>
                <h2>核心摘要</h2>
              </div>

              <div className="space-y-4">
                {coreSummaryParagraphs.length > 0 ? (
                  coreSummaryParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                ) : (
                  <p>这篇简报暂时还没有整理出核心摘要。</p>
                )}
              </div>
            </section>

            <section className="article-section-card space-y-5 rounded-[28px] border border-line/75 bg-white/72 px-6 py-6 sm:px-8 sm:py-7">
              <div className="space-y-1">
                <div className="text-[11px] tracking-[0.2em] text-muted">KEY POINTS</div>
                <h2>关键观点</h2>
              </div>
              {brief.keyPoints.length > 0 ? (
                <ul className="article-list-grid">
                  {brief.keyPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : (
                <p>这篇简报暂时还没有整理出关键观点。</p>
              )}
            </section>

            <section className="article-section-card space-y-5 rounded-[28px] border border-line/75 bg-white/72 px-6 py-6 sm:px-8 sm:py-7">
              <div className="space-y-1">
                <div className="text-[11px] tracking-[0.2em] text-muted">PM INSIGHT</div>
                <h2>对 AI 产品经理的启发</h2>
              </div>
              <div className="space-y-4">
                {pmInsightParagraphs.length > 0 ? (
                  pmInsightParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
                ) : (
                  <p>这篇简报暂时还没有补充产品启发。</p>
                )}
              </div>
            </section>

            <section className="article-section-card space-y-5 rounded-[28px] border border-line/75 bg-white/72 px-6 py-6 sm:px-8 sm:py-7">
              <div className="space-y-1">
                <div className="text-[11px] tracking-[0.2em] text-muted">NEXT ACTIONS</div>
                <h2>可执行行动</h2>
              </div>
              {brief.actions.length > 0 ? (
                <ul className="article-list-grid">
                  {brief.actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              ) : (
                <p>这篇简报暂时还没有整理出下一步行动。</p>
              )}
            </section>

            <section className="article-section-card space-y-5 rounded-[28px] border border-line/75 bg-white/72 px-6 py-6 sm:px-8 sm:py-7">
              <div className="space-y-1">
                <div className="text-[11px] tracking-[0.2em] text-muted">SOURCE</div>
                <h2>原文链接</h2>
              </div>
              {brief.sourceUrl ? (
                <a
                  href={brief.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accentSoft px-4 py-2 text-sm font-medium text-accent hover:border-accent/40"
                >
                  <span>打开原文</span>
                  <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <p>这篇文章暂时没有原文链接。</p>
              )}
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}
