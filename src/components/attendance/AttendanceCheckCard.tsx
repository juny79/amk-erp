"use client";

import React, { useState, useEffect } from "react";
import { Clock, MapPin, Wifi, CheckCircle2, LogIn, LogOut } from "lucide-react";
import { AttendanceRecord } from "@/types/attendance";

interface AttendanceCheckCardProps {
  onStatusChange: () => void;
}

export const AttendanceCheckCard: React.FC<AttendanceCheckCardProps> = ({ onStatusChange }) => {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [myRecord, setMyRecord] = useState<AttendanceRecord | null>(null);
  const [location, setLocation] = useState("AMK 제1공장 본사 (사내 Wi-Fi 연결됨)");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toTimeString().slice(0, 8));
      setCurrentDate(now.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = async (action: "CHECK_IN" | "CHECK_OUT") => {
    setIsLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          userId: "USR-001",
          userName: "홍길동",
          department: "생산팀",
          position: "과장",
          location,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMyRecord(data.data);
        setMessage(data.message);
        onStatusChange();
      } else {
        setMessage(data.message);
      }
    } catch {
      setMessage("통신 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>AMK 사내 네트워크 연동 정상 (192.168.0.21)</span>
          </div>

          <div className="text-3xl md:text-4xl font-black tracking-tight mt-2 font-mono">
            {currentTime || "09:00:00"}
          </div>
          <div className="text-xs text-blue-200/80 mt-1">{currentDate}</div>

          <div className="flex items-center gap-2 mt-3 text-xs text-blue-100 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs w-fit">
            <MapPin className="w-3.5 h-3.5 text-blue-300" />
            <span>{location}</span>
          </div>
        </div>

        {/* 출근/퇴근 버튼 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            disabled={isLoading || Boolean(myRecord?.checkIn)}
            onClick={() => handleAction("CHECK_IN")}
            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all ${
              myRecord?.checkIn
                ? "bg-emerald-600/50 text-emerald-100 cursor-not-allowed border border-emerald-500/30"
                : "bg-blue-600 hover:bg-blue-500 text-white hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            <LogIn className="w-4 h-4" />
            {myRecord?.checkIn ? `출근 완료 (${myRecord.checkIn})` : "출근 체크 (09:00)"}
          </button>

          <button
            disabled={isLoading || !myRecord?.checkIn || Boolean(myRecord?.checkOut)}
            onClick={() => handleAction("CHECK_OUT")}
            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm shadow-sm transition-all ${
              !myRecord?.checkIn || myRecord?.checkOut
                ? "bg-white/10 text-slate-400 cursor-not-allowed"
                : "bg-amber-600 hover:bg-amber-500 text-white hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            <LogOut className="w-4 h-4" />
            {myRecord?.checkOut ? `퇴근 완료 (${myRecord.checkOut})` : "퇴근 체크 (18:00)"}
          </button>
        </div>
      </div>

      {message && (
        <div className="mt-4 pt-3 border-t border-white/10 text-xs text-emerald-300 font-medium flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> {message}
        </div>
      )}
    </div>
  );
};