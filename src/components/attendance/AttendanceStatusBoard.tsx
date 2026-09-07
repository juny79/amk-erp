"use client";

import React from "react";
import { AttendanceRecord, AttendanceStatus } from "@/types/attendance";
import { Clock, MapPin, AlertTriangle, Briefcase, Plane } from "lucide-react";

interface StatusBoardProps {
  records: AttendanceRecord[];
}

export const AttendanceStatusBoard: React.FC<StatusBoardProps> = ({ records }) => {
  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case "NORMAL":
        return <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[11px] font-bold">정상출근</span>;
      case "LATE":
        return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> 지각</span>;
      case "FIELD_WORK":
        return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1"><Briefcase className="w-3 h-3" /> 외근/출장</span>;
      case "ON_LEAVE":
        return <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1"><Plane className="w-3 h-3" /> 휴가/연차</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[11px] font-bold">미출근</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">당일 임직원 실시간 근무 현황판</h3>
          <p className="text-xs text-slate-500 mt-0.5">사내망 IP 및 모바일 체크인 기반 실시간 집계</p>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-lg">
          총 {records.length}명 기록
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">성명 / 직급</th>
              <th className="py-3 px-4">부서</th>
              <th className="py-3 px-4">출근시각</th>
              <th className="py-3 px-4">퇴근시각</th>
              <th className="py-3 px-4">근무상태</th>
              <th className="py-3 px-4">근무지 / 사내 IP</th>
              <th className="py-3 px-4">특이사항</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-800">
                  {r.userName} <span className="text-slate-400 font-normal">{r.position}</span>
                </td>
                <td className="py-3.5 px-4 text-slate-600">{r.department}</td>
                <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                  {r.checkIn || "-"}
                </td>
                <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                  {r.checkOut || (r.checkIn ? "근무중" : "-")}
                </td>
                <td className="py-3.5 px-4">{getStatusBadge(r.status)}</td>
                <td className="py-3.5 px-4 text-slate-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{r.location || "본사"}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                  {r.note || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};