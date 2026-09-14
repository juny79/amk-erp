import { AmkInventoryPart, InventoryAnalyticsSummary, InventoryTransactionLog } from "@/types/inventory";

const INVENTORY_BASE_URL = process.env.AMK_INVENTORY_BASE_URL || "https://amk-inventory.vercel.app";
const INVENTORY_ADMIN_EMAIL = process.env.AMK_INVENTORY_EMAIL || "admin@amk.com";
const INVENTORY_ADMIN_PASSWORD = process.env.AMK_INVENTORY_PASSWORD || "amk1234!";

export class AmkInventoryClient {
  private static instance: AmkInventoryClient;
  private sessionCookie: string | null = null;
  private cookieExpiresAt: number = 0;
  private cache: {
    items: AmkInventoryPart[];
    analytics: any;
    lastFetched: number;
  } | null = null;
  private readonly CACHE_TTL_MS = 1000 * 5; // 5초 캐시 (forceRefresh 시 무시)

  private constructor() {}

  public static getInstance(): AmkInventoryClient {
    if (!AmkInventoryClient.instance) {
      AmkInventoryClient.instance = new AmkInventoryClient();
    }
    return AmkInventoryClient.instance;
  }

  // amk-inventory 세션 쿠키 자동 획득 및 갱신
  private async getValidSessionCookie(): Promise<string> {
    const now = Date.now();
    if (this.sessionCookie && now < this.cookieExpiresAt) {
      return this.sessionCookie;
    }

    try {
      const res = await fetch(`${INVENTORY_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: INVENTORY_ADMIN_EMAIL,
          password: INVENTORY_ADMIN_PASSWORD,
        }),
      });

      if (!res.ok) {
        throw new Error(`Login failed with status ${res.status}`);
      }

      // Set-Cookie 추출
      const setCookie = res.headers.get("set-cookie");
      if (setCookie) {
        const match = setCookie.match(/amk_session=([^;]+)/);
        if (match) {
          this.sessionCookie = `amk_session=${match[1]}`;
          // 쿠키 유효기간 (기본 7일 중 6일 동안 유효)
          this.cookieExpiresAt = now + 1000 * 60 * 60 * 24 * 6;
          return this.sessionCookie;
        }
      }

      // 쿠키 헤더가 직접 파싱되지 않는 경우 대비
      return this.sessionCookie || "";
    } catch (e) {
      console.error("[AmkInventoryClient] Authentication error:", e);
      return this.sessionCookie || "";
    }
  }

  // 전체 재고 목록 실시간 조회 (강제 새로고침 시 no-cache)
  public async getInventory(forceRefresh = false): Promise<AmkInventoryPart[]> {
    const now = Date.now();
    if (!forceRefresh && this.cache && now - this.cache.lastFetched < this.CACHE_TTL_MS) {
      return this.cache.items;
    }

    try {
      const cookie = await this.getValidSessionCookie();
      const url = `${INVENTORY_BASE_URL}/api/inventory?_t=${now}`;

      const res = await fetch(url, {
        cache: "no-store",
        headers: {
          Cookie: cookie,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      if (res.status === 401) {
        // 토큰 만료 시 쿠키 리셋 후 재시도
        this.sessionCookie = null;
        const newCookie = await this.getValidSessionCookie();
        const retryRes = await fetch(url, {
          cache: "no-store",
          headers: { Cookie: newCookie },
        });
        if (!retryRes.ok) throw new Error(`amk-inventory API error: ${retryRes.statusText}`);
        return this.processInventoryResponse(await retryRes.json(), now);
      }

      if (!res.ok) throw new Error(`amk-inventory API error: ${res.statusText}`);
      const rawItems: AmkInventoryPart[] = await res.json();
      return this.processInventoryResponse(rawItems, now);
    } catch (e) {
      console.error("[AmkInventoryClient] Failed to fetch inventory:", e);
      if (this.cache?.items) return this.cache.items;
      return [];
    }
  }

  private processInventoryResponse(rawItems: AmkInventoryPart[], timestamp: number): AmkInventoryPart[] {
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
      lastFetched: timestamp,
    };

    return items;
  }

  // 안전재고 부족 품목만 필터링 조회
  public async getLowStockItems(forceRefresh = false): Promise<AmkInventoryPart[]> {
    const all = await this.getInventory(forceRefresh);
    return all.filter((item) => item.isLowStock);
  }

  // 특정 부품번호/명칭 단건 조회
  public async searchPart(query: string, forceRefresh = false): Promise<AmkInventoryPart[]> {
    const all = await this.getInventory(forceRefresh);
    const q = query.toLowerCase().trim();
    return all.filter(
      (item) =>
        item.partNumber.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        (item.modelName && item.modelName.toLowerCase().includes(q))
    );
  }

  // 재고 통계 및 최근 입출고 로그 조회
  public async getAnalyticsSummary(forceRefresh = false): Promise<InventoryAnalyticsSummary> {
    const items = await this.getInventory(forceRefresh);
    const now = Date.now();
    
    let recentLogs: InventoryTransactionLog[] = [];
    try {
      const cookie = await this.getValidSessionCookie();
      const res = await fetch(`${INVENTORY_BASE_URL}/api/analytics?_t=${now}`, {
        cache: "no-store",
        headers: {
          Cookie: cookie,
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
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

  // 입출고 트랜잭션 전송
  public async createTransaction(payload: {
    partId: string;
    changeAmount: number;
    logType: "IN" | "OUT" | "ADJUST";
    note?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const cookie = await this.getValidSessionCookie();
      const res = await fetch(`${INVENTORY_BASE_URL}/api/inventory/transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Transaction API failed");
      const data = await res.json();
      this.cache = null; // 트랜잭션 즉시 캐시 무효화
      return { success: true, message: data.message || "성공적으로 반영되었습니다." };
    } catch (e: any) {
      return { success: false, message: e.message || "트랜잭션 처리에 실패했습니다." };
    }
  }
}

export const amkInventory = AmkInventoryClient.getInstance();