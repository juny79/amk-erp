"use client";

import React, { useState } from "react";
import { LeaveType } from "@/types/attendance";
import { X, Calendar, FileText } from "lucide-react";

interface LeaveApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { leaveType: LeaveType; startDate: string; endDate: string; days: number; reason: string }) => void;
}

export const LeaveApplyModal: React.FC<LeaveApplyModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [leaveType, setLeaveType] = useState<LeaveType>("ANNUAL");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [days, setDays] = useState(1.0);
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmit({ leaveType, startDate, endDate, days, reason });
    onClose();
  };

  const handleTypeChange = (type: LeaveType) => {
    setLeaveType(type);
    if (type === "HALF_AM" || type === "HALF_PM") {
      setDays(0.5);
      setEndDate(startDate);
    } else {
      setDays(1.0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            휴가 / 외근 신청서 (간이 전자결재)
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">신청 구분</label>
            <select
              value={leaveType}
              onChange={(e) => handleTypeChange(e.target.value as LeaveType)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500 bg-white"
            >
              <option value="ANNUAL">정기 연차 (1.0일)</option>
              <option value="HALF_AM">오전 반차 (0.5일)</option>
              <option value="HALF_PM">오후 반차 (0.5일)</option>
              <option value="FIELD_WORK">외근 / 출장 신청</option>
              <option value="SPECIAL">경조사 / 특별휴가</option>
              <option value="OVERTIME">연장 / 초과근무</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">신청 사유</label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="구체적인 사유 및 업무 대행자를 기재하세요."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:border-blue-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl">
              취소
            </button>
            <button type="submit" className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs">
              결재 상신
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};