"use client";

import React, { useState } from "react";
import { InventoryDashboard } from "@/components/inventory/InventoryDashboard";
import { TaskModal } from "@/components/calendar/TaskModal";
import { AmkInventoryPart } from "@/types/inventory";
import { TaskItem } from "@/types/task";
import { Package, ArrowLeft, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InventoryPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialTaskData, setInitialTaskData] = useState<Partial<TaskItem> | null>(null);

  // 재고 부족 품목을 캘린더 발주/조립 일정으로 바로 생성 (시나리오 2 대응)
  const handleCreateTaskFromItem = (item: AmkInventoryPart) => {
    const isShort = item.isLowStock;
    setInitialTaskData({
      title: isShort
        ? `[자재발주] ${item.partNumber} (${item.name}) 안전재고 부족분 긴급 발주`
        : `[생산투입] ${item.partNumber} (${item.name}) 조립 라인 투입 일정`,
      description: `amk-inventory 연동 품목: 현재고 ${item.currentStock}개 / 필요 안전재고 ${item.minRequiredStock}개 (부족 수량: ${item.shortageAmount || 0}개)`,
      department: "자재팀",
      priority: isShort ? "URGENT" : "MEDIUM",
      linkedItemCode: item.partNumber,
      tags: ["amk-inventory", isShort ? "긴급발주" : "생산투입", item.category],
    });
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<TaskItem>) => {
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      alert("업무 캘린더에 성공적으로 등록되었습니다. 캘린더 페이지로 이동합니다.");
      router.push("/calendar");
    } catch (e) {
      console.error(e);
    }
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
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-md">
                  Phase 5 Module
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  실시간 재고 데이터 파이프라인
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
                amk-inventory 실시간 재고 관리 & 캘린더 연동
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/calendar"
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              <Calendar className="w-4 h-4 text-blue-600" /> 업무 캘린더 연동 보기
            </Link>
            <a
              href="https://amk-inventory.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> 원본 사이트 접속
            </a>
          </div>
        </header>

        {/* 메인 재고 대시보드 */}
        <InventoryDashboard onCreateTaskWithItem={handleCreateTaskFromItem} />
      </div>

      {/* 캘린더 일정 연계 모달 */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        initialData={initialTaskData as any}
      />
    </div>
  );
}