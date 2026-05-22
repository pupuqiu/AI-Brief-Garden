import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BriefPageClient } from "@/components/brief-page-client";
import { getBriefById } from "@/src/lib/obsidian";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type BriefPageProps = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: BriefPageProps): Promise<Metadata> {
  const brief = await getBriefById(params.id);

  if (!brief) {
    return {
      title: "AI Brief Garden"
    };
  }

  return {
    title: `${brief.title} · AI Brief Garden`,
    description: brief.oneSentenceSummary
  };
}

export default async function BriefPage({ params }: BriefPageProps) {
  const brief = await getBriefById(params.id);

  if (!brief) {
    notFound();
  }

  if (params.id !== brief.id) {
    redirect(`/brief/${brief.id}`);
  }

  return <BriefPageClient id={params.id} initialBrief={brief} />;
}
