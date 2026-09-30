import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MALT ROOM | 나만의 위스키 취향 찾기",
  description: "다섯 가지 질문으로 발견하는 나만의 위스키 취향과 AI 소믈리에 노트.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}