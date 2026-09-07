export interface AmkInventoryPart {
  id: string;
  name: string;
  category: string;
  manufacturer?: string;
  modelName?: string;
  partNumber: string;
  currentStock: number;
  minRequiredStock: number;
  createdAt?: string;
  updatedAt?: string;
  parentBoms?: any[];
  // ERP 확장 필드
  isLowStock?: boolean;
  shortageAmount?: number;
  stockRate?: number; // (current / minRequired) * 100
}

export interface InventoryTransactionLog {
  id: string;
  partId: string;
  partNumber?: string;
  partName?: string;
  changeAmount: number;
  logType: "IN" | "OUT" | "ADJUST";
  isOfficial?: boolean;
  note?: string;
  createdAt: string;
}

export interface InventoryAnalyticsSummary {
  totalItems: number;
  lowStockItemsCount: number;
  normalItemsCount: number;
  outOfStockCount: number;
  categories: { [key: string]: number };
  recentLogs: InventoryTransactionLog[];
  lastSyncedAt: string;
}