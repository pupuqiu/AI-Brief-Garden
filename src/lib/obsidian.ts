import { createHash } from "node:crypto";
import { promises as fs, readFileSync } from "node:fs";
import path from "node:path";
import type { Brief, BriefGroup, BriefStatus } from "./brief-types";

const dateDirPattern = /^\d{4}-\d{2}-\d{2}$/;

const sectionHeaders = {
  oneSentenceSummary: "一句话总结",
  recommendationReason: "推荐阅读理由",
  coreSummary: "核心摘要",
  keyPoints: "关键观点",
  pmInsight: "对 AI 产品经理的启发",
  shouldRead: "我是否应该精读",
  actions: "可执行行动",
  relatedNotes: "关联笔记",
  tags: "标签"
} as const;

function getInboxDirFromEnvFile() {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf8");
    const match = content.match(/^OBSIDIAN_INBOX_DIR=(.*)$/m);

    if (!match?.[1]) {
      return "";
    }

    return match[1].trim().replace(/^['"]|['"]$/g, "");
  } catch {
    return "";
  }
}

function ensureInboxDir() {
  const inboxDir = process.env.OBSIDIAN_INBOX_DIR || getInboxDirFromEnvFile();

  if (!inboxDir) {
    throw new Error("Missing OBSIDIAN_INBOX_DIR. Please set it in .env.local.");
  }

  return path.resolve(inboxDir);
}

function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function buildLegacyBriefId(date: string, title: string) {
  return slugify(`${date}-${title}`);
}

function normalizeRouteKey(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[丨｜|]/g, "-")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function buildBriefId(date: string, filename: string) {
  const hash = createHash("md5").update(`${date}:${filename}`).digest("hex").slice(0, 8);
  return `${date}-${hash}`;
}

function matchesBriefId(routeId: string, brief: Brief) {
  if (routeId === brief.id) {
    return true;
  }

  const legacyId = buildLegacyBriefId(brief.date, brief.title);
  if (routeId === legacyId) {
    return true;
  }

  const normalizedRouteId = normalizeRouteKey(routeId);
  const normalizedCanonicalId = normalizeRouteKey(brief.id);
  const normalizedLegacyId = normalizeRouteKey(legacyId);
  const routeHashMatch = routeId.match(/([0-9a-f]{8})$/i);
  const briefHashMatch = brief.id.match(/([0-9a-f]{8})$/i);

  if (routeHashMatch?.[1] && briefHashMatch?.[1] && routeHashMatch[1] === briefHashMatch[1]) {
    return true;
  }

  return normalizedRouteId === normalizedCanonicalId || normalizedRouteId === normalizedLegacyId;
}

function normalizeStatus(input: string) {
  const value = input.replace(/^#/, "").trim();

  if (!value) {
    return "";
  }

  if (value.includes("精读")) {
    return "值得细读";
  }

  if (value.includes("速览")) {
    return "适合速览";
  }

  if (value.includes("延后")) {
    return "延后阅读";
  }

  if (value.includes("待读")) {
    return "值得细读";
  }

  return value;
}

function parseBulletList(section: string) {
  return section
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

function parseInlineNotes(section: string) {
  const wikiMatches = Array.from(section.matchAll(/\[\[([^\]]+)\]\]/g)).map((match) => match[1].trim());

  if (wikiMatches.length > 0) {
    return wikiMatches;
  }

  return section
    .split("\n")
    .flatMap((line) => line.split(/[、,，]/))
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseTags(section: string) {
  const hashTags = Array.from(section.matchAll(/#([^\s#]+)/g)).map((match) => match[1].trim());

  if (hashTags.length > 0) {
    return hashTags;
  }

  return section
    .split("\n")
    .flatMap((line) => line.split(/[、,，]/))
    .map((item) => item.replace(/^#/, "").trim())
    .filter(Boolean);
}

function parseShouldRead(section: string) {
  const lines = section
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[-*]\s*/, "").trim());

  for (const line of lines) {
    if (!line.startsWith("理由")) {
      return normalizeStatus(line);
    }
  }

  return normalizeStatus(lines[0] ?? "");
}

function getFrontMatterValue(markdown: string, label: string) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`^${escaped}[：:]\\s*(.*)$`, "m"));
  return match?.[1]?.trim() ?? "";
}

function getSection(markdown: string, heading: string) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(
    new RegExp(`^##\\s+${escaped}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, "m")
  );

  return match?.[1]?.trim() ?? "";
}

function parseMarkdownToBrief(args: {
  fileName: string;
  fallbackDate: string;
  markdown: string;
}): Brief {
  const { fileName, fallbackDate, markdown } = args;
  const title = path.basename(fileName, path.extname(fileName)).trim();
  const date = getFrontMatterValue(markdown, "日期") || fallbackDate;

  const keyPointsSection = getSection(markdown, sectionHeaders.keyPoints);
  const actionsSection = getSection(markdown, sectionHeaders.actions);
  const relatedNotesSection = getSection(markdown, sectionHeaders.relatedNotes);
  const tagsSection = getSection(markdown, sectionHeaders.tags);
  const shouldReadSection = getSection(markdown, sectionHeaders.shouldRead);

  return {
    id: buildBriefId(date, fileName),
    source: getFrontMatterValue(markdown, "来源"),
    sourceUrl: getFrontMatterValue(markdown, "原文链接"),
    status: normalizeStatus(getFrontMatterValue(markdown, "状态")) || parseShouldRead(shouldReadSection),
    date,
    title,
    oneSentenceSummary: getSection(markdown, sectionHeaders.oneSentenceSummary),
    recommendationReason: getSection(markdown, sectionHeaders.recommendationReason),
    coreSummary: getSection(markdown, sectionHeaders.coreSummary),
    keyPoints: parseBulletList(keyPointsSection),
    pmInsight: getSection(markdown, sectionHeaders.pmInsight),
    actions: parseBulletList(actionsSection),
    relatedNotes: parseInlineNotes(relatedNotesSection),
    tags: parseTags(tagsSection)
  };
}

async function listDateDirectories(rootDir: string) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory() && dateDirPattern.test(entry.name))
    .map((entry) => entry.name)
    .sort((a, b) => b.localeCompare(a));
}

async function readBriefsForDate(rootDir: string, date: string) {
  const dateDir = path.join(rootDir, date);
  const entries = await fs.readdir(dateDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));

  const briefs = await Promise.all(
    files.map(async (fileName) => {
      const fullPath = path.join(dateDir, fileName);
      const markdown = await fs.readFile(fullPath, "utf8");
      return parseMarkdownToBrief({ fileName, fallbackDate: date, markdown });
    })
  );

  return briefs;
}

export async function getBriefGroups(): Promise<BriefGroup[]> {
  const rootDir = ensureInboxDir();
  const dates = await listDateDirectories(rootDir);

  const groups = await Promise.all(
    dates.map(async (date) => {
      const briefs = await readBriefsForDate(rootDir, date);

      return {
        date,
        count: briefs.length,
        briefs
      };
    })
  );

  return groups.filter((group) => group.count > 0);
}

export async function getBriefById(id: string) {
  const groups = await getBriefGroups();

  for (const group of groups) {
    const brief = group.briefs.find((item) => matchesBriefId(id, item));
    if (brief) {
      return brief;
    }
  }

  return null;
}

export async function getBriefsByDate(date: string) {
  const groups = await getBriefGroups();
  return groups.find((group) => group.date === date)?.briefs ?? [];
}

export async function getAvailableDates() {
  const groups = await getBriefGroups();
  return groups.map((group) => group.date);
}

export async function getDefaultDate() {
  const dates = await getAvailableDates();
  return dates[0] ?? "";
}
