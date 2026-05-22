import Link from "next/link";
import type { Brief } from "@/src/lib/brief-types";
import { formatDisplayDate } from "@/src/lib/brief-types";

type BriefCardProps = {
  brief: Brief;
};

export function BriefCard({ brief }: BriefCardProps) {
  return (
    <Link
      href={`/brief/${brief.id}`}
      className="group block rounded-[30px] border border-line bg-card p-6 shadow-paper hover:-translate-y-1 hover:shadow-lift sm:p-7"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span>{formatDisplayDate(brief.date)}</span>
        </div>

        <h2 className="mt-4 font-serif text-[1.55rem] leading-[1.5] text-ink group-hover:text-accent sm:text-[1.75rem]">
          {brief.title}
        </h2>
      </div>

      <p className="mt-4 text-[15px] leading-8 text-ink/78">{brief.oneSentenceSummary}</p>

      <div className="mt-5 rounded-[22px] border border-line/80 bg-paper/70 px-4 py-4">
        <div className="text-[11px] tracking-[0.18em] text-muted">推荐阅读理由</div>
        <p className="mt-2 text-[14px] leading-7 text-ink/68">{brief.recommendationReason}</p>
      </div>
      <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent">
        <span>阅读全文</span>
        <span aria-hidden="true">→</span>
      </div>
    </Link>
  );
}
