"use client";

import React from "react";
import { TaskItem, TaskStatus, TaskPriority } from "@/types/task";
import { Clock, User, Package, Plus, MoreHorizontal } from "lucide-react";

interface KanbanBoardProps {
  tasks: TaskItem[];
  onSelectTask: (task: TaskItem) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: () => void;
}

const COLUMNS: { id: TaskStatus; title: string; color: string; bg: string }[] = [
  { id: "TODO", title: "대기 (To-Do)", color: "text-slate-700 border-slate-300", bg: "bg-slate-50" },
  { id: "IN_PROGRESS", title: "진행중 (In Progress)", color: "text-blue-700 border-blue-400", bg: "bg-blue-50/50" },
  { id: "REVIEW", title: "검토 (Review)", color: "text-purple-700 border-purple-400", bg: "bg-purple-50/50" },
  { id: "DONE", title: "완료 (Done)", color: "text-emerald-700 border-emerald-400", bg: "bg-emerald-50/50" },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onSelectTask,
  onUpdateStatus,
  onAddTask,
}) => {
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

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onUpdateStatus(taskId, status);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[600px]">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`flex flex-col rounded-2xl border border-slate-200 ${col.bg} p-4 transition-colors`}
          >
            {/* 컬럼 헤더 */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${col.color}`}>{col.title}</span>
                <span className="text-[11px] bg-white border border-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full shadow-2xs">
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={onAddTask}
                className="p-1 hover:bg-white rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                title="이 상태로 업무 추가"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* 카드 목록 */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-1">
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => onSelectTask(task)}
                  className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-400 shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getPriorityBadge(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                      {task.department}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {task.title}
                  </h4>

                  {task.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  {/* 재고 연동 뱃지 */}
                  {task.linkedItemCode && (
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md w-fit">
                      <Package className="w-3 h-3" />
                      <span>{task.linkedItemCode}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-600 font-medium truncate max-w-[120px]">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {task.assigneeName || "담당자 미지정"}
                    </span>
                    <span className="flex items-center gap-1 text-[10px]">
                      <Clock className="w-3 h-3" />
                      {task.startDate.slice(5, 10)}
                    </span>
                  </div>
                </div>
              ))}

              {colTasks.length === 0 && (
                <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                  카드를 드래그하여 이동
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
