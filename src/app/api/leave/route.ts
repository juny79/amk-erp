import { NextResponse } from "next/server";
import { INITIAL_LEAVES } from "@/lib/mockAttendance";
import { LeaveApplication } from "@/types/attendance";

let leaveStore: LeaveApplication[] = [...INITIAL_LEAVES];

export async function GET() {
  return NextResponse.json({ success: true, data: leaveStore });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newLeave: LeaveApplication = {
      id: `leave-${Date.now()}`,
      userId: body.userId || "USR-001",
      userName: body.userName || "홍길동",
      department: body.department || "생산팀",
      leaveType: body.leaveType || "ANNUAL",
      startDate: body.startDate,
      endDate: body.endDate,
      days: Number(body.days) || 1.0,
      reason: body.reason || "",
      status: "PENDING",
      appliedAt: new Date().toISOString().slice(0, 10),
    };

    leaveStore.unshift(newLeave);
    return NextResponse.json({ success: true, data: newLeave }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: "신청에 실패했습니다." }, { status: 400 });
  }
}

// 결재 승인 / 반려
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, approverName } = body;
    const leave = leaveStore.find((l) => l.id === id);
    if (!leave) {
      return NextResponse.json({ success: false, message: "신청서를 찾을 수 없습니다." }, { status: 404 });
    }

    leave.status = status;
    if (approverName) leave.approverName = approverName;

    return NextResponse.json({ success: true, data: leave });
  } catch {
    return NextResponse.json({ success: false, message: "처리 실패" }, { status: 400 });
  }
}