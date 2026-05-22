import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Brief Garden",
  description: "浅色中文 AI 晚报阅读产品，适合长时间浏览与精读。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans text-ink">{children}</body>
    </html>
  );
}
