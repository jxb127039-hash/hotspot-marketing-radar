import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "公开热点营销机会雷达",
  description: "基于公开信息筛选热点，并生成京东全品类营销借势建议。"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
