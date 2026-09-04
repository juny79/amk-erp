import React from "react";
import { Calendar, Clock, PackageCheck, Bot, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 헤더 */}
        <header className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 text-white font-bold px-3 py-1 rounded-lg text-sm tracking-wider">AMK ERP</span>
              <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full">v2.1 Master Ready</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
              AMK 차세대 통합 ERP & AI Agent 플랫폼
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              업무 공유 캘린더 • 스마트 근태 • amk-inventory 재고 연동 • Upstage Solar Agent
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-all shadow-sm">
              로그인 / 사번인증
            </button>
          </div>
        </header>

        {/* 4대 핵심 모듈 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-slate-900 text-lg">업무 공유 & 캘린더</h2>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              일간/주간/월간 캘린더 및 드래그앤드롭 칸반보드 상호 연동 업무 관리
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-blue-600 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Phase 3 개발 대기
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-slate-900 text-lg">스마트 근태 관리</h2>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              사내 IP/위치 인증 원클릭 출퇴근 체크, 실시간 근무현황판, 연차 결재선
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Phase 4 연계
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 transition-all">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
              <PackageCheck className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-slate-900 text-lg">amk-inventory 연동</h2>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">
              기존 재고관리 프로그램 어댑터 연동, 안전재고 부족 알림, 입출고 일정
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Phase 5 어댑터 연동
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
              <CheckCircle2 className="w-4 h-4" /> Phase 6 탑재
            </div>
          </div>
        </div>

        {/* 안내 배너 */}
        <section className="bg-slate-900 text-white rounded-2xl p-8 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">Phase 2 Completed</span>
              <h3 className="text-xl font-bold mt-1">풀스택 골격 셋업 & Prisma DB 엔터티 모델링 완료</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-2xl">
                Next.js 15 App Router 환경 및 PostgreSQL Prisma 7대 엔터티(User, Attendance, LeaveRequest, Task, InventoryCache, ChatSession, AuditLog) 정의가 완료되었습니다.
              </p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 px-5 py-3.5 rounded-xl text-center">
              <div className="text-xs text-slate-400">다음 단계 로드맵</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">Phase 3: 업무 캘린더 & 칸반 모듈</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
