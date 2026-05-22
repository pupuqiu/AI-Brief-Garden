import Link from "next/link";

type DailySidebarProps = {
  currentDate: string;
  fineReadCount: number;
  dates: string[];
};

function itemClass(active: boolean) {
  return active
    ? "border-accent/30 bg-accentSoft text-accent shadow-sm"
    : "border-transparent bg-transparent text-ink/78 hover:border-line hover:bg-card";
}

function getDateLabel(index: number) {
  if (index === 0) {
    return "今天";
  }

  if (index === 1) {
    return "昨天";
  }

  if (index === 2) {
    return "本周稍早";
  }

  return "更早";
}

function getDateDescription(index: number) {
  if (index === 0) {
    return "最新晚报";
  }

  if (index === 1) {
    return "继续回看";
  }

  if (index === 2) {
    return "值得补读";
  }

  return "历史归档";
}

export function DailySidebar({
  currentDate,
  fineReadCount,
  dates
}: DailySidebarProps) {
  return (
    <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-2 soft-scrollbar">
      <div className="space-y-6">
        <nav className="rounded-[28px] border border-line bg-card p-3 shadow-paper">
          <div className="space-y-1">
            {dates.map((date, index) => (
              <Link
                key={date}
                href={`/daily/${date}`}
                className={`block rounded-[22px] border px-4 py-3 ${itemClass(date === currentDate)}`}
              >
                <div className="text-sm font-medium">{getDateLabel(index)}</div>
                <div className="mt-1 text-xs text-muted">{getDateDescription(index)}</div>
              </Link>
            ))}
          </div>
        </nav>

        <section className="rounded-[28px] border border-line bg-card p-5 shadow-paper">
          <div className="text-xs tracking-[0.18em] text-muted">导览</div>
          <div className="mt-4 space-y-2 text-sm">
            <a
              href="#jingdu"
              className="flex items-center justify-between rounded-2xl border border-transparent px-3 py-2 text-ink/80 hover:border-line hover:bg-accentSoft/50"
            >
              <span>精读</span>
              <span className="text-xs text-muted">{fineReadCount} 篇</span>
            </a>
            <div className="flex items-center justify-between rounded-2xl px-3 py-2 text-ink/50">
              <span>收藏</span>
              <span className="text-xs text-muted">稍后开放</span>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}
