"use client";

import React, { useState, useEffect } from "react";
import { AttendanceRecord, LeaveApplication } from "@/types/attendance";
import { AttendanceCheckCard } from "@/components/attendance/AttendanceCheckCard";
import { AttendanceStatusBoard } from "@/components/attendance/AttendanceStatusBoard";
import { LeaveApplyModal } from "@/components/attendance/LeaveApplyModal";
import {
  Clock,
  Users,
  AlertTriangle,
  Plane,
  Briefcase,
  Plus,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [stats, setStats] = useState({
    totalEmployees: 12,
    present: 4,
    late: 1,
    fieldWork: 1,
    onLeave: 1,
  });
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const q = departmentFilter !== "ALL" ? `?department=${encodeURIComponent(departmentFilter)}` : "";
      const res = await fetch(`/api/attendance${q}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
        if (data.stats) setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await fetch("/api/leave");
      const data = await res.json();
      if (data.success) setLeaves(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchLeaves();
  }, [departmentFilter]);

  const handleApplyLeave = async (formData: any) => {
    try {
      await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: "USR-001",
          userName: "홍길동",
          department: "생산팀",
        }),
      });
      fetchLeaves();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveLeave = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await fetch("/api/leave", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, approverName: "최유진 팀장" }),
      });
      fetchLeaves();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <header className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
              title="대시보드로 돌아가기"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                  Phase 4 Module
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  스마트 근태 & 간이 전자결재
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
                AMK 스마트 근태 관리 시스템
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => { fetchAttendance(); fetchLeaves(); }}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600"
              title="새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
            </button>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> 휴가 / 외근 신청
            </button>
          </div>
        </header>

        {/* 1. 개인 원클릭 출퇴근 체크 카드 */}
        <AttendanceCheckCard onStatusChange={fetchAttendance} />

        {/* 2. 전사 당일 근태 통계 KPI 위젯 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">당일 출근율</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">
                {Math.round((stats.present / stats.totalEmployees) * 100)}%
                <span className="text-xs text-slate-400 font-normal ml-1">({stats.present}/{stats.totalEmployees}명)</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">지각자</div>
              <div className="text-xl font-black text-amber-600 mt-0.5">{stats.late}명</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">외근 / 출장</div>
              <div className="text-xl font-black text-blue-600 mt-0.5">{stats.fieldWork}명</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Plane className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">연차 / 휴가자</div>
              <div className="text-xl font-black text-purple-600 mt-0.5">{stats.onLeave}명</div>
            </div>
          </div>
        </div>

        {/* 3. 실시간 근무 현황판 */}
        <AttendanceStatusBoard records={records} />

        {/* 4. 간이 전자결재 (휴가/외근 신청 및 승인 현황) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">간이 전자결재함 (휴가/외근 승인 대기)</h3>
              <p className="text-xs text-slate-500 mt-0.5">관리자 결재 승인 즉시 근무 현황판 및 캘린더에 연동됩니다.</p>
            </div>
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              + 새 신청서 작성
            </button>
          </div>

          <div className="space-y-3">
            {leaves.map((leave) => (
              <div
                key={leave.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {leave.leaveType === "ANNUAL" ? "정기 연차" : leave.leaveType === "HALF_PM" ? "오후 반차" : "외근/출장"}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {leave.userName} ({leave.department})
                    </span>
                    <span className="text-xs text-slate-400">
                      기간: {leave.startDate} ~ {leave.endDate} ({leave.days}일간)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">사유: {leave.reason}</p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  {leave.status === "PENDING" ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveLeave(leave.id, "APPROVED")}
                        className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> 승인
                      </button>
                      <button
                        onClick={() => handleApproveLeave(leave.id, "REJECTED")}
                        className="flex items-center gap-1 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> 반려
                      </button>
                    </div>
                  ) : leave.status === "APPROVED" ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      결재 승인됨 ({leave.approverName})
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                      반려됨
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <LeaveApplyModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSubmit={handleApplyLeave}
      />
    </div>
  );
}