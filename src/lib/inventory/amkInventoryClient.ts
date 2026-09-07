import { AmkInventoryPart, InventoryAnalyticsSummary, InventoryTransactionLog } from "@/types/inventory";

const INVENTORY_BASE_URL = process.env.AMK_INVENTORY_BASE_URL || "https://amk-inventory.vercel.app";

export class AmkInventoryClient {
  private static instance: AmkInventoryClient;
  private cache: {
    items: AmkInventoryPart[];
    analytics: any;
    lastFetched: number;
  } | null = null;
  private readonly CACHE_TTL_MS = 1000 * 30; // 30초 인메모리 캐시

  private constructor() {}

  public static getInstance(): AmkInventoryClient {
    if (!AmkInventoryClient.instance) {
      AmkInventoryClient.instance = new AmkInventoryClient();
    }
    return AmkInventoryClient.instance;
  }

  // 전체 재고 목록 실시간 조회
  public async getInventory(forceRefresh = false): Promise<AmkInventoryPart[]> {
    const now = Date.now();
    if (!forceRefresh && this.cache && now - this.cache.lastFetched < this.CACHE_TTL_MS) {
      return this.cache.items;
    }

    try {
      const res = await fetch(`${INVENTORY_BASE_URL}/api/inventory`, {
        next: { revalidate: 30 },
      });
      if (!res.ok) throw new Error(`amk-inventory API error: ${res.statusText}`);
      
      const rawItems: AmkInventoryPart[] = await res.json();
      
      const items = rawItems.map((item) => {
        const isLow = item.currentStock <= item.minRequiredStock;
        const shortage = isLow ? Math.max(0, item.minRequiredStock - item.currentStock) : 0;
        const stockRate = item.minRequiredStock > 0 ? Math.round((item.currentStock / item.minRequiredStock) * 100) : 100;

        return {
          ...item,
          isLowStock: isLow,
          shortageAmount: shortage,
          stockRate,
        };
      });

      this.cache = {
        items,
        analytics: this.cache?.analytics || null,
        lastFetched: now,
      };

      return items;
    } catch (e) {
      console.error("[AmkInventoryClient] Failed to fetch inventory:", e);
      if (this.cache?.items) return this.cache.items;
      return [];
    }
  }

  // 안전재고 부족 품목만 필터링 조회 (시나리오 1 & 시나리오 3 대응)
  public async getLowStockItems(): Promise<AmkInventoryPart[]> {
    const all = await this.getInventory();
    return all.filter((item) => item.isLowStock);
  }

  // 특정 부품번호/명칭 단건 조회 (시나리오 3: AI Agent 대화형 검색 대응)
  public async searchPart(query: string): Promise<AmkInventoryPart[]> {
    const all = await this.getInventory();
    const q = query.toLowerCase().trim();
    return all.filter(
      (item) =>
        item.partNumber.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        (item.modelName && item.modelName.toLowerCase().includes(q))
    );
  }

  // 재고 통계 및 최근 입출고 로그 조회
  public async getAnalyticsSummary(): Promise<InventoryAnalyticsSummary> {
    const items = await this.getInventory();
    
    let recentLogs: InventoryTransactionLog[] = [];
    try {
      const res = await fetch(`${INVENTORY_BASE_URL}/api/analytics`, {
        next: { revalidate: 30 },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.recentLogs && Array.isArray(json.recentLogs)) {
          recentLogs = json.recentLogs;
        }
      }
    } catch (e) {
      console.warn("[AmkInventoryClient] Failed to fetch analytics logs:", e);
    }

    const categories: { [key: string]: number } = {};
    let lowStockCount = 0;
    let outOfStockCount = 0;

    items.forEach((item) => {
      const cat = item.category || "기타";
      categories[cat] = (categories[cat] || 0) + 1;
      if (item.currentStock <= 0) outOfStockCount++;
      if (item.isLowStock) lowStockCount++;
    });

    return {
      totalItems: items.length,
      lowStockItemsCount: lowStockCount,
      normalItemsCount: items.length - lowStockCount,
      outOfStockCount,
      categories,
      recentLogs,
      lastSyncedAt: new Date().toLocaleTimeString("ko-KR"),
    };
  }

  // 입출고 트랜잭션 전송 (시나리오 3: AI Agent or 간이 발주 대응)
  public async createTransaction(payload: {
    partId: string;
    changeAmount: number;
    logType: "IN" | "OUT" | "ADJUST";
    note?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${INVENTORY_BASE_URL}/api/inventory/transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Transaction API failed");
      const data = await res.json();
      return { success: true, message: data.message || "성공적으로 반영되었습니다." };
    } catch (e: any) {
      return { success: false, message: e.message || "트랜잭션 처리에 실패했습니다." };
    }
  }
}

export const amkInventory = AmkInventoryClient.getInstance();