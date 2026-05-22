import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DailyPageClient } from "@/components/daily-page-client";
import { formatDisplayDate } from "@/src/lib/brief-types";
import { getBriefGroups, getBriefsByDate } from "@/src/lib/obsidian";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DailyPageProps = {
  params: {
    date: string;
  };
};

export async function generateMetadata({ params }: DailyPageProps): Promise<Metadata> {
  const briefs = await getBriefsByDate(params.date);

  if (!briefs.length) {
    return {
      title: "AI Brief Garden"
    };
  }

  return {
    title: `${formatDisplayDate(params.date)} · AI Brief Garden`,
    description: `今晚值得慢慢读的 AI 简报，共 ${briefs.length} 条精选。`
  };
}

export default async function DailyPage({ params }: DailyPageProps) {
  const [dailyBriefs, groups] = await Promise.all([getBriefsByDate(params.date), getBriefGroups()]);

  if (!dailyBriefs.length) {
    notFound();
  }

  return <DailyPageClient initialDate={params.date} initialGroups={groups} />;
}
