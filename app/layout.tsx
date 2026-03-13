import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "智能客服平台 - Zhipu AI & RAG 驱动",
  description: "基于人工智能驱动的下一代客户服务解决方案",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
