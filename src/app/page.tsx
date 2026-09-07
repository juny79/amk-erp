import React from "react";
import { Calendar, Clock, PackageCheck, Bot, CheckCircle2, ArrowRight } from "lucide-react";
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
              <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full">Phase 4 Active</span>
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
              <CheckCircle2 className="w-4 h-4" /> Phase 3 배포 완료
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
              <CheckCircle2 className="w-4 h-4" /> Phase 4 개발 완료 (체험 가능)
            </div>
          </Link>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 transition-all">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
              <PackageCheck className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-slate-900 text-lg">amk-inventory 연동</h2>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              기존 재고관리 프로그램 어댑터 연동, 안전재고 부족 알림, 입출고 일정
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Phase 5 어댑터 연동 대기
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-300 transition-all">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Bot className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-slate-900 text-lg">Upstage Solar AI</h2>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              Function Calling 자연어 대화 일정 등록, 재고 조회, 근태 처리 챗봇
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-purple-600 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Phase 6 탑재 대기
            </div>
          </div>
        </div>

        {/* 대시보드 배너 */}
        <section className="bg-slate-900 text-white rounded-2xl p-8 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Phase 4 Live</span>
            <h3 className="text-xl font-bold mt-1">스마트 근태 관리 및 간이 전자결재 시스템 가동</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-2xl">
              실시간 원클릭 출퇴근(정상/지각 자동판정), 부서별 근무현황판, 연차/외근 신청 및 팀장 승인 결재선이 구축되었습니다.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/attendance"
              className="bg-emerald-600 hover:bg-emerald-500 px-5 py-3.5 rounded-xl text-center text-sm font-bold text-white transition-colors"
            >
              근태 관리 열기 &rarr;
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}