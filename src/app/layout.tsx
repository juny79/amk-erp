import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AMK ERP - 올인원 통합 업무 플랫폼",
  description: "AMK 업무공유, 근태관리, amk-inventory 연동 및 Upstage Solar AI Agent 챗봇",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
