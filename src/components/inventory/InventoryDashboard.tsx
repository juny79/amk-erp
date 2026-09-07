"use client";

import React, { useState, useEffect } from "react";
import { AmkInventoryPart, InventoryAnalyticsSummary } from "@/types/inventory";
import {
  Search,
  RefreshCw,
  Download,
  Printer,
  CalendarPlus,
  ExternalLink,
  Edit2,
  Check,
  X,
  TrendingDown,
  ArrowUpRight,
  Package,
} from "lucide-react";

interface InventoryDashboardProps {
  onCreateTaskWithItem?: (item: AmkInventoryPart) => void;
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ onCreateTaskWithItem }) => {
  const [items, setItems] = useState<AmkInventoryPart[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInlineEditMode, setIsInlineEditMode] = useState(false);
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 로딩
  const fetchInventory = async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      const q = forceRefresh ? "?refresh=true" : "";
      const res = await fetch(`/api/inventory${q}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
        // 카테고리 추출
        const catSet = new Set<string>();
        data.data.forEach((item: AmkInventoryPart) => {
          if (item.category) {
            item.category.split(",").forEach((c) => catSet.add(c.trim()));
          }
        });
        setCategories(Array.from(catSet));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // 카테고리 토글
  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // 필터링
  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.modelName && item.modelName.toLowerCase().includes(q)) ||
      (item.manufacturer && item.manufacturer.toLowerCase().includes(q)) ||
      item.partNumber.toLowerCase().includes(q);

    const itemCats = item.category ? item.category.split(",").map((c) => c.trim()) : [];
    const matchesCategory =
      selectedCategories.length === 0 || itemCats.some((c) => selectedCategories.includes(c));

    return matchesSearch && matchesCategory;
  });

  // CSV 다운로드 기능 (amk-inventory 동일)
  const handleExportCSV = () => {
    const headers = ["NO", "구분", "품명", "제조사", "모델명", "현재고", "안전재고", "상태"];
    const rows = filteredItems.map((item, idx) => {
      const isShort = item.currentStock < item.minRequiredStock;
      return [
        idx + 1,
        `"${item.category || ""}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${(item.manufacturer || "").replace(/"/g, '""')}"`,
        `"${(item.modelName || "").replace(/"/g, '""')}"`,
        item.currentStock,
        item.minRequiredStock,
        isShort ? "부족" : "안정",
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    a.href = url;
    a.download = `AMK_Inventory_Status_${dateStr}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 현재고 빠른 수정 저장
  const handleQuickStockUpdate = async (item: AmkInventoryPart, newStock: number) => {
    if (isNaN(newStock)) return;
    const diff = newStock - item.currentStock;
    if (diff === 0) {
      setEditingStockId(null);
      return;
    }

    // 낙관적 UI
    setItems((prev) =>
      prev.map((it) =>
        it.id === item.id
          ? {
              ...it,
              currentStock: newStock,
              isLowStock: newStock < it.minRequiredStock,
              shortageAmount: Math.max(0, it.minRequiredStock - newStock),
            }
          : it
      )
    );
    setEditingStockId(null);

    try {
      await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partId: item.id,
          changeAmount: Math.abs(diff),
          logType: diff > 0 ? "IN" : "OUT",
          note: "AMK ERP 재고 현황 인라인 수정",
        }),
      });
    } catch (e) {
      console.error(e);
      fetchInventory(true);
    }
  };

  const lowStockCount = items.filter((i) => i.currentStock < i.minRequiredStock).length;

  return (
    <div className="space-y-4">
      {/* 1. amk-inventory 오리지널 메인 카드 쉘 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden print:shadow-none print:border-none print:w-full">
        {/* 오리지널 헤더: "실시간 부품 재고 현황" + 액션 버튼군 */}
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              실시간 부품 재고 현황
            </h2>
            {lowStockCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                <TrendingDown className="w-3.5 h-3.5" /> 안전재고 부족 {lowStockCount}개
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center space-x-2.5 print:hidden">
            {/* 인라인 수정 토글 */}
            <button
              onClick={() => setIsInlineEditMode(!isInlineEditMode)}
              className={`flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all border shadow-xs active:scale-95 ${
                isInlineEditMode
                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isInlineEditMode ? "수정 완료" : "인라인 수정"}</span>
            </button>

            {/* CSV 내보내기 */}
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1 text-xs font-bold text-gray-700 bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-xs active:scale-95"
              title="필터링된 부품 현황을 CSV 파일로 다운로드합니다"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV 저장</span>
            </button>

            {/* 인쇄 (PDF) */}
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1 text-xs font-bold text-gray-700 bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-xs active:scale-95"
              title="부품 테이블을 A4 인쇄 화면으로 출력하거나 PDF로 저장합니다"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF 인쇄</span>
            </button>

            {/* 새로고침 */}
            <button
              onClick={() => fetchInventory(true)}
              className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 shadow-xs"
              title="실시간 강제 새로고침"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
            </button>

            {/* 총 품목 뱃지 */}
            <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
              전체 {items.length}품목
            </span>
          </div>
        </div>

        {/* 2. 오리지널 검색창 및 카테고리 필터 바 */}
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 space-y-3.5 print:hidden">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="부품명 또는 모델명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border-gray-200 pl-10 pr-4 py-2.5 text-xs focus:ring-blue-500 focus:border-blue-500 border bg-white shadow-inner transition-all font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-gray-500 mr-1.5 flex items-center gap-1 select-none">
              <span>🏷️</span> 구분 필터:
            </span>

            <button
              type="button"
              onClick={() => setSelectedCategories([])}
              className={`px-3 py-1 rounded-full font-bold transition-all border ${
                selectedCategories.length === 0
                  ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              전체
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1 rounded-full font-bold transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-blue-50 border-blue-400 text-blue-700 shadow-xs"
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3 w-3 pointer-events-none"
                  />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. amk-inventory 원본 컬럼 구조 그대로의 메인 테이블 */}
        <div className="overflow-y-auto overflow-x-auto h-[600px] print:overflow-visible print:h-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-white text-gray-400 border-b border-gray-100 text-[10px] sm:text-xs uppercase tracking-wider sticky top-0 shadow-xs z-10 print:static print:shadow-none print:text-gray-600 print:border-b-2 print:border-gray-300">
              <tr>
                <th className="px-2 sm:px-4 py-3 font-bold whitespace-nowrap w-[4%] text-center">NO</th>
                <th className="px-2 sm:px-4 py-3 font-bold whitespace-nowrap w-[10%]">구분</th>
                <th className="px-2 sm:px-4 py-3 font-bold w-[34%]">부품명</th>
                <th className="px-2 sm:px-4 py-3 font-bold w-[18%]">제조사 / 모델명</th>
                <th className="px-2 sm:px-4 py-3 font-bold text-center whitespace-nowrap w-[8%]">IBEX 1대</th>
                <th className="px-2 sm:px-4 py-3 font-bold text-right whitespace-nowrap w-[8%]">현재고</th>
                <th className="px-2 sm:px-4 py-3 font-bold text-right whitespace-nowrap w-[8%]">안전재고</th>
                <th className="px-2 sm:px-4 py-3 font-bold text-center whitespace-nowrap w-[8%]">상태</th>
                <th className="px-2 sm:px-4 py-3 font-bold text-center whitespace-nowrap w-[10%] print:hidden">
                  ERP 일정연계
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 print:divide-gray-200">
              {filteredItems.map((item, idx) => {
                const isShortage = item.currentStock < item.minRequiredStock;
                const cats = item.category ? item.category.split(",").map((c) => c.trim()) : [];

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    {/* NO */}
                    <td className="px-2 sm:px-3 py-3 font-mono text-gray-400 text-xs whitespace-nowrap text-center">
                      {String(idx + 1).padStart(2, "0")}
                    </td>

                    {/* 구분 (카테고리 뱃지) */}
                    <td className="px-2 sm:px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {cats.map((c, i) => (
                          <span
                            key={i}
                            className={`px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap ${
                              c.includes("Front") || c.includes("완제품")
                                ? "bg-purple-100 text-purple-700 ring-1 ring-purple-300"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* 부품명 & 부품코드 */}
                    <td className="px-2 sm:px-3 py-3 font-bold text-gray-800 break-words text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span>{item.name}</span>
                          <div className="text-[10px] font-mono text-blue-500 font-normal">
                            코드: {item.partNumber}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 제조사 / 모델명 */}
                    <td className="px-2 sm:px-3 py-3 text-xs text-gray-500 break-words">
                      <div className="font-medium text-xs text-gray-500">{item.manufacturer || "-"}</div>
                      <div className="text-blue-600 font-bold font-mono text-xs mt-0.5">
                        {item.modelName || "-"}
                      </div>
                    </td>

                    {/* IBEX 1대 소요량 */}
                    <td className="px-2 sm:px-3 py-3 text-center whitespace-nowrap">
                      <span className="text-gray-400 font-mono text-xs">-</span>
                    </td>

                    {/* 현재고 (인라인 클릭 수정 지원) */}
                    <td
                      className={`px-2 sm:px-3 py-3 text-right font-black whitespace-nowrap text-base sm:text-lg ${
                        isShortage ? "text-rose-600" : "text-gray-900"
                      }`}
                    >
                      {editingStockId === item.id ? (
                        <div className="inline-flex items-center gap-1 justify-end">
                          <input
                            type="number"
                            className="w-16 px-1.5 py-0.5 text-xs text-right border border-blue-400 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none bg-blue-50/50 text-gray-900"
                            value={tempStockValue}
                            onChange={(e) => setTempStockValue(e.target.value === "" ? "" : Number(e.target.value))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleQuickStockUpdate(item, Number(tempStockValue));
                              if (e.key === "Escape") setEditingStockId(null);
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => handleQuickStockUpdate(item, Number(tempStockValue))}
                            className="p-0.5 text-emerald-600 hover:text-emerald-800 bg-emerald-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingStockId(null)}
                            className="p-0.5 text-rose-500 hover:text-rose-700 bg-rose-50 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            if (isInlineEditMode) {
                              setEditingStockId(item.id);
                              setTempStockValue(item.currentStock);
                            }
                          }}
                          className={`${
                            isInlineEditMode ? "cursor-pointer hover:bg-blue-50 px-2 py-0.5 rounded border border-dashed border-blue-300" : ""
                          }`}
                          title={isInlineEditMode ? "클릭하여 재고 즉시 수정" : ""}
                        >
                          {item.currentStock.toLocaleString()}
                        </div>
                      )}
                    </td>

                    {/* 안전재고 */}
                    <td className="px-2 sm:px-3 py-3 text-right text-gray-500 whitespace-nowrap font-mono">
                      {item.minRequiredStock.toLocaleString()}
                    </td>

                    {/* 상태 (안정 / 부족 오리지널 뱃지) */}
                    <td className="px-2 sm:px-3 py-3 text-center whitespace-nowrap">
                      {isShortage ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 ring-1 ring-rose-200">
                          <span>부족</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                          <span>안정</span>
                        </span>
                      )}
                    </td>

                    {/* ERP 연동 버튼 */}
                    <td className="px-2 sm:px-3 py-3 text-center whitespace-nowrap print:hidden">
                      <button
                        onClick={() => onCreateTaskWithItem && onCreateTaskWithItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-xs transition-colors border border-blue-200 shadow-2xs active:scale-95"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" />
                        <span>일정 연계</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};