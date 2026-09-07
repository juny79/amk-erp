import type { Metadata } from "next";
import "./globals.css";
import { AgentChatWidget } from "@/components/chat/AgentChatWidget";

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
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased relative min-h-screen bg-slate-50 text-slate-900" suppressHydrationWarning>
        {children}
        {/* 전사 어디서나 접근 가능한 Upstage Solar AI Agent 플로팅 챗봇 */}
        <AgentChatWidget />
      </body>
    </html>
  );
}