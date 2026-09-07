import React from "react";
import { Calendar, Clock, PackageCheck, Bot, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 헤더 */}
        <header className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 text-white font-bold px-3 py-1 rounded-lg text-sm tracking-wider">AMK ERP</span>
              <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Phase 6 Solar Agent Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
              AMK 차세대 통합 ERP & AI Agent 플랫폼
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              업무 공유 캘린더 • 스마트 근태 • amk-inventory 재고 연동 • Upstage Solar Agent
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/calendar"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
            >
              업무 캘린더 <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/attendance"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
            >
              근태 관리 <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/inventory"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
            >
              재고 관리 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* 4대 핵심 모듈 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/calendar"
            className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all group block"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
              업무 공유 & 캘린더
            </h2>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              일간/주간/월간 캘린더 및 드래그앤드롭 칸반보드 상호 연동 업무 관리
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> 배포 완료
            </div>
          </Link>

          <Link
            href="/attendance"
            className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all group block"
          >
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-slate-900 text-lg group-hover:text-emerald-600 transition-colors">
              스마트 근태 관리
            </h2>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              사내 IP/위치 인증 원클릭 출퇴근 체크, 실시간 근무현황판, 연차 결재선
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> 배포 완료
            </div>
          </Link>

          <Link
            href="/inventory"
            className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm hover:shadow-md hover:border-amber-400 transition-all group block"
          >
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <PackageCheck className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-slate-900 text-lg group-hover:text-amber-600 transition-colors">
              amk-inventory 연동
            </h2>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              137개 부품 실시간 동기화, 85개 안전재고 부족 알림, 캘린더 연계
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> 배포 완료
            </div>
          </Link>

          <div className="bg-white p-6 rounded-2xl border border-purple-200 shadow-sm hover:shadow-md hover:border-purple-400 transition-all group block">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-slate-900 text-lg group-hover:text-purple-600 transition-colors">
              Upstage Solar AI
            </h2>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              우측 하단 챗봇 클릭: 재고 조회, 일정 등록, 출퇴근 체크 자연어 처리
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-purple-600 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> 플로팅 챗봇 활성화됨
            </div>
          </div>
        </div>

        {/* AI Agent 배너 */}
        <section className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white rounded-2xl p-8 shadow-lg border border-purple-800/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-purple-400 font-bold">Phase 6 Master Active</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                Dual-Mode Ready (Solar API & Direct Dispatcher)
              </span>
            </div>
            <h3 className="text-xl font-bold mt-1">Upstage Solar 기반 AI Agent 챗봇 가동 중</h3>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl">
              우측 하단의 보라색 <strong>AMK Solar Agent</strong> 아이콘을 누르시면, <strong>"FB-01 재고 얼마 남았어?"</strong>, <strong>"안전재고 부족한 품목 뽑아줘"</strong>, <strong>"출근 체크해줘"</strong> 등의 자연어 명령을 실시간 ERP 액션으로 실행합니다.
            </p>
          </div>
          <div className="text-xs bg-white/10 p-4 rounded-xl backdrop-blur-xs text-purple-200 border border-white/10 space-y-1">
            <div className="font-bold text-white">💡 API 키 안내</div>
            <div>Upstage API 키가 없어도 실제 데이터로 완벽 동작하며, 키 발급 시 .env에 넣으면 즉시 전환됩니다.</div>
          </div>
        </section>
      </div>
    </main>
  );
}