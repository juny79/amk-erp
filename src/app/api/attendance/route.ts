import { NextResponse } from "next/server";
import { INITIAL_ATTENDANCE } from "@/lib/mockAttendance";
import { AttendanceRecord, AttendanceStatus } from "@/types/attendance";

let attendanceStore: AttendanceRecord[] = [...INITIAL_ATTENDANCE];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const department = searchParams.get("department");

  let list = [...attendanceStore];
  if (department && department !== "ALL") {
    list = list.filter((a) => a.department === department);
  }

  // 근태 통계 집계
  const stats = {
    totalEmployees: 12,
    present: list.filter((a) => a.status === "NORMAL" || a.status === "LATE").length,
    late: list.filter((a) => a.status === "LATE").length,
    fieldWork: list.filter((a) => a.status === "FIELD_WORK").length,
    onLeave: list.filter((a) => a.status === "ON_LEAVE").length,
  };

  return NextResponse.json({ success: true, data: list, stats });
}

// 출근 또는 퇴근 체크
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, userName, department, position, location, note } = body;
    const today = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toTimeString().slice(0, 8);

    let record = attendanceStore.find((a) => a.userId === userId && a.date === today);

    if (action === "CHECK_IN") {
      // 09:00 이후 출근 시 지각 판정
      const [h, m] = nowTime.split(":").map(Number);
      const isLate = h > 9 || (h === 9 && m > 0);
      const status: AttendanceStatus = isLate ? "LATE" : "NORMAL";

      if (record) {
        record.checkIn = nowTime;
        record.status = status;
        if (location) record.location = location;
      } else {
        record = {
          id: `att-${Date.now()}`,
          userId: userId || "USR-001",
          userName: userName || "홍길동",
          department: department || "생산팀",
          position: position || "과장",
          date: today,
          checkIn: nowTime,
          status,
          ipAddress: "192.168.0.21 (사내망 인증)",
          location: location || "AMK 본사",
          note: note || undefined,
        };
        attendanceStore.unshift(record);
      }
      return NextResponse.json({ success: true, message: "출근 체크가 완료되었습니다.", data: record });
    } else if (action === "CHECK_OUT") {
      if (!record) {
        return NextResponse.json({ success: false, message: "오늘 출근 기록이 없습니다." }, { status: 400 });
      }
      record.checkOut = nowTime;
      // 근무시간 간이 계산 (h)
      if (record.checkIn) {
        const [inH, inM] = record.checkIn.split(":").map(Number);
        const [outH, outM] = nowTime.split(":").map(Number);
        const diffHours = (outH * 60 + outM - (inH * 60 + inM)) / 60;
        record.workHours = Math.max(0, Math.round(diffHours * 10) / 10);
      }
      return NextResponse.json({ success: true, message: "퇴근 체크가 완료되었습니다.", data: record });
    }

    return NextResponse.json({ success: false, message: "올바르지 않은 요청입니다." }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, message: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}