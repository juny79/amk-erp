import { NextResponse } from "next/server";
import { amkInventory } from "@/lib/inventory/amkInventoryClient";

// GET /api/inventory?query=...&lowStockOnly=true&analytics=true
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const lowStockOnly = searchParams.get("lowStockOnly") === "true";
  const getAnalytics = searchParams.get("analytics") === "true";
  const refresh = searchParams.get("refresh") === "true";

  try {
    if (getAnalytics) {
      const summary = await amkInventory.getAnalyticsSummary();
      return NextResponse.json({ success: true, data: summary });
    }

    if (query) {
      const results = await amkInventory.searchPart(query);
      return NextResponse.json({ success: true, count: results.length, data: results });
    }

    if (lowStockOnly) {
      const lowItems = await amkInventory.getLowStockItems();
      return NextResponse.json({ success: true, count: lowItems.length, data: lowItems });
    }

    const all = await amkInventory.getInventory(refresh);
    return NextResponse.json({ success: true, count: all.length, data: all });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message || "Failed to fetch from amk-inventory" }, { status: 500 });
  }
}

// POST /api/inventory - 입출고 트랜잭션 전송
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await amkInventory.createTransaction(body);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message || "Transaction error" }, { status: 500 });
  }
}