import React, { useState } from "react";
import { TaskItem, TaskPriority, TaskStatus } from "@/types/task";
import { X, Calendar as CalendarIcon, Tag, User, Building, AlertCircle } from "lucide-react";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<TaskItem>) => void;
  initialData?: TaskItem | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [startDate, setStartDate] = useState(
    initialData?.startDate ? initialData.startDate.slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate ? initialData.endDate.slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || "TODO");
  const [priority, setPriority] = useState<TaskPriority>(initialData?.priority || "MEDIUM");
  const [department, setDepartment] = useState(initialData?.department || "생산팀");
  const [assigneeName, setAssigneeName] = useState(initialData?.assigneeName || "");
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(", ") || "");
  const [linkedItemCode, setLinkedItemCode] = useState(initialData?.linkedItemCode || "");
  const [color, setColor] = useState(initialData?.color || "#3b82f6");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialData?.id,
      title,
      description,
      startDate,
      endDate,
      status,
      priority,
      department,
      assigneeName,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      linkedItemCode: linkedItemCode.trim() || undefined,
      color,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 text-lg">
            {initialData ? "업무/일정 수정" : "새 업무/일정 등록"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">업무 / 일정명 *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: [생산팀] 1차 부품 조립 및 캘린더 공유"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" /> 시작 일시
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" /> 종료 일시
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">진행 상태</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="TODO">대기 (To-Do)</option>
                <option value="IN_PROGRESS">진행중 (In Progress)</option>
                <option value="REVIEW">검토 (Review)</option>
                <option value="DONE">완료 (Done)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> 중요도
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="LOW">낮음 (Low)</option>
                <option value="MEDIUM">보통 (Medium)</option>
                <option value="HIGH">높음 (High)</option>
                <option value="URGENT">긴급 (Urgent)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> 담당 부서
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="생산팀">생산팀</option>
                <option value="자재팀">자재팀</option>
                <option value="영업팀">영업팀</option>
                <option value="품질팀">품질팀</option>
                <option value="인사총무">인사총무</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> 담당자명
              </label>
              <input
                type="text"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                placeholder="예: 김철수 대리"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">상세 설명</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="업무에 대한 상세 내용 및 협업 지시사항"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> 태그 (쉼표 구분)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="예: 생산, 자재, QA"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                📦 amk-inventory 연동 자재코드
              </label>
              <input
                type="text"
                value={linkedItemCode}
                onChange={(e) => setLinkedItemCode(e.target.value)}
                placeholder="예: MAT-BOLT-M4"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
            >
              {initialData ? "수정 완료" : "업무 등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
