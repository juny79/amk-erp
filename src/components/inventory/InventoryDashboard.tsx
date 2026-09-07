"use client";

import React, { useState, useEffect } from "react";
import { AmkInventoryPart, InventoryAnalyticsSummary } from "@/types/inventory";
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  RefreshCw,
  Search,
  ExternalLink,
  CalendarPlus,
  ArrowUpDown,
} from "lucide-react";

interface InventoryDashboardProps {
  onCreateTaskWithItem?: (item: AmkInventoryPart) => void;
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ onCreateTaskWithItem }) => {
  const [items, setItems] = useState<AmkInventoryPart[]>([]);
  const [analytics, setAnalytics] = useState<InventoryAnalyticsSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInventoryData = async (forceRefresh = false) => {
    setIsLoading(true);
    try {
      // 1. 통계 데이터
      const anaRes = await fetch("/api/inventory?analytics=true");
      const anaJson = await anaRes.json();
      if (anaJson.success) setAnalytics(anaJson.data);

      // 2. 부품 목록 데이터
      const q = forceRefresh ? "?refresh=true" : "";
      const invRes = await fetch(`/api/inventory${q}`);
      const invJson = await invRes.json();
      if (invJson.success) setItems(invJson.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  // 필터링 적용
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.modelName && item.modelName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;
    const matchesLowStock = !onlyLowStock || item.isLowStock;

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const categories = analytics ? Object.keys(analytics.categories) : [];

  return (
    <div className="space-y-6">
      {/* 1. 실시간 연동 KPI 통계 요약 바 (시나리오 1 대응) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">관리 품목 총수</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">
              {analytics?.totalItems || 0}
              <span className="text-xs text-slate-400 font-normal ml-1">종</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-xs flex items-center gap-4 bg-red-50/20">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-red-600 font-bold flex items-center gap-1">
              안전재고 부족 경고
            </div>
            <div className="text-xl font-black text-red-600 mt-0.5">
              {analytics?.lowStockItemsCount || 0}
              <span className="text-xs text-red-400 font-normal ml-1">품목 미달</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">정상 재고 품목</div>
            <div className="text-xl font-black text-emerald-600 mt-0.5">
              {analytics?.normalItemsCount || 0}
              <span className="text-xs text-slate-400 font-normal ml-1">품목 안정</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">동기화 상태</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">실시간 연결됨</div>
            <div className="text-[10px] text-slate-400">{analytics?.lastSyncedAt || "방금 전"}</div>
          </div>
        </div>
      </div>

      {/* 2. 안전재고 부족 품목 긴급 발주 추천 배너 */}
      {analytics && analytics.lowStockItemsCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-red-600 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xs">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-sm">
                amk-inventory 안전재고 미달 품목 {analytics.lowStockItemsCount}건 감지됨
              </div>
              <p className="text-xs text-white/85 mt-0.5">
                생산 차질을 방지하기 위해 해당 품목의 긴급 발주 일정 또는 조립 일정을 캘린더에 연계하세요.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => setOnlyLowStock(!onlyLowStock)}
              className="px-4 py-2 bg-white text-red-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all shadow-xs"
            >
              {onlyLowStock ? "전체 품목 보기" : "부족 품목만 모아보기"}
            </button>
            <a
              href="https://amk-inventory.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-4 py-2 bg-black/25 hover:bg-black/40 text-white font-bold text-xs rounded-xl transition-all"
            >
              amk-inventory 열기 <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* 3. 검색 및 필터 컨트롤 바 */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 bg-slate-100 px-3.5 py-2 rounded-xl text-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="품목명, 부품번호(FB-01 등), 모델명 검색..."
            className="w-full bg-transparent focus:outline-none text-slate-800"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* 카테고리 필터 */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-semibold focus:outline-none"
          >
            <option value="ALL">전체 카테고리</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c} ({analytics?.categories[c]})
              </option>
            ))}
          </select>

          {/* 새로고침 */}
          <button
            onClick={() => fetchInventoryData(true)}
            className="p-2 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            title="실시간 강제 새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* 4. 실시간 재고 테이블 (시나리오 1 & 2 대응) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">실시간 부품 및 자재 재고 현황</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              amk-inventory 실시간 API 동기화 (총 {filteredItems.length}건 검색됨)
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-lg">
            https://amk-inventory.vercel.app 연동
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-4">부품번호</th>
                <th className="py-3.5 px-4">품명 / 모델명</th>
                <th className="py-3.5 px-4">카테고리</th>
                <th className="py-3.5 px-4 text-right">현재고</th>
                <th className="py-3.5 px-4 text-right">안전재고</th>
                <th className="py-3.5 px-4">재고율 (상태)</th>
                <th className="py-3.5 px-4 text-center">ERP 연계 액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.slice(0, 50).map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                    {item.partNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">{item.name}</div>
                    {item.modelName && (
                      <div className="text-[10px] text-slate-400">{item.modelName}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                      {item.category || "일반"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900">
                    {item.currentStock.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                    {item.minRequiredStock.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    {item.isLowStock ? (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" /> 부족 (-{item.shortageAmount}개)
                        </span>
                        <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-red-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, item.stockRate || 0)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> 정상 ({item.stockRate}%)
                        </span>
                        <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, item.stockRate || 0)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => onCreateTaskWithItem && onCreateTaskWithItem(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-[11px] transition-colors border border-blue-200"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" /> 캘린더 일정 연계
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};