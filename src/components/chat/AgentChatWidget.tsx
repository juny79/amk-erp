"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  Minimize2,
  Maximize2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolExecuted?: {
    name: string;
    args: any;
    result: any;
  };
  timestamp: string;
}

export const AgentChatWidget: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "안녕하세요! AMK ERP AI Agent 비서(Upstage Solar)입니다. 🤖\n업무 일정 등록, 근태 체크, amk-inventory 부품 재고 조회를 자연어로 바로 처리해 드립니다.",
      timestamp: "방금 전",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          toolExecuted: data.toolExecuted,
          timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "네트워크 오류로 응답을 생성하지 못했습니다.",
          timestamp: "오류",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* 1. 우측 하단 플로팅 챗봇 트리거 버튼 (최상위 z-index 및 인라인 스타일 보장) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            zIndex: 999999,
          }}
          className="flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ring-4 ring-white/80"
          aria-label="AMK AI Agent 챗봇 열기"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 text-white animate-bounce" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-wide leading-none">AMK Solar Agent</span>
            <span className="text-[10px] text-purple-200 font-semibold mt-0.5">AI 업무 비서 챗봇</span>
          </div>
        </button>
      )}

      {/* 2. 챗봇 대화 창 */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 999999,
          }}
          className="w-[92vw] sm:w-[420px] h-[600px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* 챗봇 헤더 */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-4 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-500/30 rounded-xl flex items-center justify-center border border-purple-400/30">
                <Bot className="w-5 h-5 text-purple-200" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-extrabold">AMK Solar Agent</h4>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                    Function Calling
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">Upstage Solar 기반 업무/재고 총괄 비서</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 대화 메시지 영역 */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/60 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <div className="w-7 h-7 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className="space-y-1.5 max-w-[82%]">
                  <div
                    className={`p-3.5 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-xs ${
                      m.role === "user"
                        ? "bg-purple-600 text-white rounded-tr-xs"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs"
                    }`}
                  >
                    {m.content}
                  </div>

                  {/* 실행된 Tool 결과 인터랙티브 카드 (시각화) */}
                  {m.toolExecuted && (
                    <div className="p-2.5 bg-purple-50/80 border border-purple-200/80 rounded-xl text-[11px] text-purple-900 space-y-1">
                      <div className="flex items-center gap-1 font-bold text-purple-700">
                        <Sparkles className="w-3 h-3 text-purple-600" />
                        <span>실행된 ERP 액션: {m.toolExecuted.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        결과: {JSON.stringify(m.toolExecuted.result).slice(0, 80)}...
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[9px] text-slate-400 ${
                      m.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-slate-400">
                <div className="w-7 h-7 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="text-xs bg-white border border-slate-200 p-3 rounded-2xl animate-pulse">
                  Solar LLM이 요청을 분석하고 ERP 도구를 실행 중입니다...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 퀵 프롬프트 칩스 */}
          <div className="p-2 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <button
              onClick={() => handleSend("FB-01 부품 재고 얼마 남았어?")}
              className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-200 shadow-2xs cursor-pointer"
            >
              📦 FB-01 재고 조회
            </button>
            <button
              onClick={() => handleSend("안전재고 부족한 품목 리스트 뽑아줘")}
              className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-200 shadow-2xs cursor-pointer"
            >
              ⚠️ 부족 재고 경고
            </button>
            <button
              onClick={() => handleSend("내일 오전 자재 발주 회의 일정 등록해줘")}
              className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-200 shadow-2xs cursor-pointer"
            >
              📅 캘린더 등록
            </button>
            <button
              onClick={() => handleSend("오늘 출근 체크해줘")}
              className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-200 shadow-2xs cursor-pointer"
            >
              ⏰ 출근 체크
            </button>
          </div>

          {/* 입력 창 */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="업무 지시나 재고 질문을 입력하세요..."
              className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-purple-500 text-slate-800"
            />
            <button
              disabled={isLoading || !input.trim()}
              onClick={() => handleSend()}
              className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};