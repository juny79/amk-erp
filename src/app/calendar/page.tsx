"use client";

import React, { useState, useEffect } from "react";
import { TaskItem, TaskStatus } from "@/types/task";
import { CalendarView } from "@/components/calendar/CalendarView";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { TaskModal } from "@/components/calendar/TaskModal";
import {
  Calendar as CalendarIcon,
  Columns,
  Plus,
  Filter,
  ArrowLeft,
  RefreshCw,
  Package,
} from "lucide-react";
import Link from "next/link";

export default function CalendarPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activeTab, setActiveTab] = useState<"calendar" | "kanban">("calendar");
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 태스크 로딩
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const query = departmentFilter !== "ALL" ? `?department=${encodeURIComponent(departmentFilter)}` : "";
      const res = await fetch(`/api/tasks${query}`);
      const data = await res.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [departmentFilter]);

  // 태스크 저장(추가/수정)
  const handleSaveTask = async (taskData: Partial<TaskItem>) => {
    try {
      if (taskData.id) {
        // 수정
        await fetch("/api/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
      } else {
        // 신규 추가
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
      }
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  // 칸반 상태 변경 (드래그 앤 드롭)
  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    // 낙관적 UI 업데이트
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
    } catch (e) {
      console.error(e);
      fetchTasks(); // 실패 시 롤백
    }
  };

  const handleOpenAddModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleSelectTask = (task: TaskItem) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 상단 네비게이션 헤더 */}
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
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                  Phase 3 Module
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  전사 협업 플랫폼
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
                AMK 스마트 업무 공유 & 캘린더
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* 부서 필터 */}
            <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="ALL">전체 부서</option>
                <option value="생산팀">생산팀</option>
                <option value="자재팀">자재팀</option>
                <option value="영업팀">영업팀</option>
                <option value="품질팀">품질팀</option>
                <option value="인사총무">인사총무</option>
              </select>
            </div>

            {/* 캘린더 / 칸반 탭 전환 */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("calendar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "calendar"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" /> 캘린더 뷰
              </button>
              <button
                onClick={() => setActiveTab("kanban")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "kanban"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Columns className="w-3.5 h-3.5" /> 칸반 보드
              </button>
            </div>

            {/* 새로고침 */}
            <button
              onClick={fetchTasks}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
              title="새로고침"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
            </button>

            {/* 새 업무 등록 버튼 */}
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> 업무 / 일정 등록
            </button>
          </div>
        </header>

        {/* 안내 바 */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl px-5 py-3 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <span className="font-bold flex items-center gap-1">
              <Package className="w-4 h-4 text-blue-600" /> amk-inventory 자재 연동 활성화:
            </span>
            <span>캘린더와 칸반에서 자재코드(`MAT-BOLT-M4` 등)가 연동된 업무를 실시간 추적할 수 있습니다.</span>
          </div>
          <span className="font-semibold text-blue-700 hidden sm:inline">총 {tasks.length}개 업무 관리 중</span>
        </div>

        {/* 뷰 렌더링 (캘린더 or 칸반) */}
        {activeTab === "calendar" ? (
          <CalendarView
            tasks={tasks}
            onSelectTask={handleSelectTask}
            onAddTask={handleOpenAddModal}
          />
        ) : (
          <KanbanBoard
            tasks={tasks}
            onSelectTask={handleSelectTask}
            onUpdateStatus={handleUpdateStatus}
            onAddTask={handleOpenAddModal}
          />
        )}
      </div>

      {/* 업무 등록/수정 모달 */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        initialData={selectedTask}
      />
    </div>
  );
}
