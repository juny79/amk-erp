import { NextResponse } from "next/server";
import { INITIAL_TASKS } from "@/lib/mockTasks";
import { TaskItem } from "@/types/task";

// 인메모리 스토리지 (DB 연동 전 단계 및 개발용)
let tasksStore: TaskItem[] = [...INITIAL_TASKS];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const department = searchParams.get("department");
  const status = searchParams.get("status");

  let filtered = [...tasksStore];
  if (department && department !== "ALL") {
    filtered = filtered.filter((t) => t.department === department);
  }
  if (status && status !== "ALL") {
    filtered = filtered.filter((t) => t.status === status);
  }

  return NextResponse.json({ success: true, data: filtered });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: body.title || "제목 없음",
      description: body.description || "",
      startDate: body.startDate || new Date().toISOString(),
      endDate: body.endDate || new Date().toISOString(),
      allDay: Boolean(body.allDay),
      status: body.status || "TODO",
      priority: body.priority || "MEDIUM",
      color: body.color || "#3b82f6",
      assigneeName: body.assigneeName || "미지정",
      department: body.department || "전사공통",
      tags: Array.isArray(body.tags) ? body.tags : [],
      linkedItemCode: body.linkedItemCode || undefined,
    };

    tasksStore.unshift(newTask);
    return NextResponse.json({ success: true, data: newTask }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const index = tasksStore.findIndex((t) => t.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: "Task not found" }, { status: 404 });
    }

    tasksStore[index] = { ...tasksStore[index], ...updates };
    return NextResponse.json({ success: true, data: tasksStore[index] });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to update" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    tasksStore = tasksStore.filter((t) => t.id !== id);
    return NextResponse.json({ success: true, message: "Deleted successfully" });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to delete" }, { status: 400 });
  }
}
