"use client";

import React, { useState } from "react";
import { TaskItem, TaskPriority } from "@/types/task";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
} from "date-fns";
import { ko } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Package,
  AlertCircle,
  Plus,
} from "lucide-react";

interface CalendarViewProps {
  tasks: TaskItem[];
  onSelectTask: (task: TaskItem) => void;
  onAddTask: () => void;
}

type ViewMode = "day" | "week" | "month";

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onSelectTask,
  onAddTask,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date("2026-09-07T09:00:00"));
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  // 이전/다음 네비게이션
  const handlePrev = () => {
    if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => setCurrentDate(new Date("2026-09-07T09:00:00"));

  // 우선순위 뱃지 컬러
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-700 border-red-200";
      case "HIGH":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "MEDIUM":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  // 1. 월간 뷰 (Month View)
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center text-xs font-bold text-slate-600 py-3">
          {["일", "월", "화", "수", "목", "금", "토"].map((dayName, idx) => (
            <div key={dayName} className={idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : ""}>
              {dayName}
            </div>
          ))}
        </div>

        {/* 일자 그리드 */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 min-h-[580px]">
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date("2026-09-07T09:00:00"));
            const dayTasks = tasks.filter((t) =>
              isSameDay(new Date(t.startDate), day)
            );

            return (
              <div
                key={day.toISOString()}
                className={`p-2 transition-colors min-h-[110px] ${
                  !isCurrentMonth ? "bg-slate-50/40 text-slate-400" : "bg-white text-slate-800"
                } hover:bg-slate-50/80`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-semibold">
                      {dayTasks.length}건
                    </span>
                  )}
                </div>

                {/* 태스크 목록 */}
                <div className="space-y-1 overflow-y-auto max-h-[80px]">
                  {dayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="group p-1.5 rounded-lg text-xs cursor-pointer border transition-all duration-150 shadow-xs hover:scale-[1.02] bg-white border-slate-200 hover:border-blue-400"
                      style={{ borderLeftColor: task.color || "#3b82f6", borderLeftWidth: "3px" }}
                    >
                      <div className="font-semibold truncate text-slate-800 text-[11px] group-hover:text-blue-600">
                        {task.title}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                        <span className="truncate">{task.assigneeName || task.department}</span>
                        {task.linkedItemCode && (
                          <span className="text-amber-600 bg-amber-50 px-1 rounded flex items-center gap-0.5">
                            <Package className="w-2.5 h-2.5" /> 재고연동
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 2. 주간 뷰 (Week View)
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // 월요일 시작
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 divide-x divide-slate-200 text-center py-3">
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date("2026-09-07T09:00:00"));
            return (
              <div key={day.toISOString()} className="px-2">
                <div className="text-xs font-semibold text-slate-500">
                  {format(day, "E", { locale: ko })}
                </div>
                <div
                  className={`text-sm font-extrabold mt-0.5 inline-block w-7 h-7 leading-7 rounded-full ${
                    isToday ? "bg-blue-600 text-white" : "text-slate-800"
                  }`}
                >
                  {format(day, "d")}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[500px]">
          {weekDays.map((day) => {
            const dayTasks = tasks.filter((t) => isSameDay(new Date(t.startDate), day));
            return (
              <div key={day.toISOString()} className="p-2 space-y-2 bg-white">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white shadow-xs cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {task.startDate.slice(11, 16)}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{task.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">{task.description}</p>
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" /> {task.assigneeName}
                      </span>
                      <span className="text-[10px] bg-slate-200/80 px-1.5 py-0.5 rounded">
                        {task.department}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 3. 일간 뷰 (Day View)
  const renderDayView = () => {
    const dayTasks = tasks.filter((t) => isSameDay(new Date(t.startDate), currentDate));

    return (
      <div className="border border-slate-200 rounded-2xl bg-white shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {format(currentDate, "yyyy년 M월 d일 (EEEE)", { locale: ko })}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              금일 예정된 사내 공유 업무 및 자재 입출고 총 {dayTasks.length}건
            </p>
          </div>
          <button
            onClick={onAddTask}
            className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> 당일 일정 추가
          </button>
        </div>

        {dayTasks.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">등록된 일정이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/20 shadow-xs cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {task.startDate.slice(11, 16)} ~ {task.endDate.slice(11, 16)}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                      {task.department}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{task.title}</h4>
                  <p className="text-xs text-slate-500">{task.description}</p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  {task.linkedItemCode && (
                    <div className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg">
                      <Package className="w-3.5 h-3.5" />
                      <span>{task.linkedItemCode}</span>
                    </div>
                  )}
                  <div className="text-right">
                    <div className="text-xs font-semibold text-slate-700">{task.assigneeName}</div>
                    <div className="text-[10px] text-slate-400">담당자</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 캘린더 상단 제어 바 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
          >
            오늘
          </button>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 ml-2">
            {format(currentDate, "yyyy년 MMMM", { locale: ko })}
          </h2>
        </div>

        {/* 뷰 모드 전환 버튼 (일간/주간/월간) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {(["day", "week", "month"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === mode
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {mode === "day" ? "일간" : mode === "week" ? "주간" : "월간"}
            </button>
          ))}
        </div>
      </div>

      {/* 선택된 뷰 렌더링 */}
      {viewMode === "month" && renderMonthView()}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "day" && renderDayView()}
    </div>
  );
};
