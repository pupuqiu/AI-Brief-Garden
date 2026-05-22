export type BriefStatus = "值得细读" | "适合速览" | "延后阅读" | string;

export type Brief = {
  id: string;
  source: string;
  date: string;
  title: string;
  oneSentenceSummary: string;
  recommendationReason: string;
  coreSummary: string;
  keyPoints: string[];
  pmInsight: string;
  actions: string[];
  relatedNotes: string[];
  tags: string[];
  status: BriefStatus;
  sourceUrl: string;
};

export type BriefGroup = {
  date: string;
  count: number;
  briefs: Brief[];
};

export function formatDisplayDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${year} 年 ${month} 月 ${day} 日`;
}

export function getUniqueTags(briefs: Brief[]) {
  return Array.from(new Set(briefs.flatMap((brief) => brief.tags)));
}
