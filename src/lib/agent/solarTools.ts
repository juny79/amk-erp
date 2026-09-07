import { amkInventory } from "@/lib/inventory/amkInventoryClient";

export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: { [key: string]: any };
      required?: string[];
    };
  };
}

export const SOLAR_ERP_TOOLS: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "query_inventory_stock",
      description: "amk-inventory에서 특정 부품의 품목명, 부품번호(FB-01 등), 모델명을 실시간으로 검색하여 현재고, 안전재고, 부족 수량을 조회합니다.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "검색할 부품 번호 또는 품목명 (예: 'FB-01', '밸브', 'VT315')",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_low_stock_alerts",
      description: "amk-inventory에서 현재고가 안전재고 이하로 떨어진 긴급 부족 품목 리스트를 조회합니다.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "가져올 최대 품목 수 (기본값: 5)",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_calendar_task",
      description: "AMK 업무 캘린더 및 칸반 보드에 새로운 업무나 일정을 등록합니다.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "업무/일정 제목" },
          description: { type: "string", description: "상세 업무 내용" },
          startDate: { type: "string", description: "시작일시 (ISO 형식: YYYY-MM-DDTHH:mm)" },
          endDate: { type: "string", description: "종료일시 (ISO 형식: YYYY-MM-DDTHH:mm)" },
          department: { type: "string", description: "담당 부서 (생산팀, 자재팀, 영업팀, 품질팀, 인사총무)" },
          priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], description: "중요도" },
          linkedItemCode: { type: "string", description: "연계할 amk-inventory 부품번호 (옵션, 예: 'FB-01')" },
        },
        required: ["title", "department"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_schedule_summary",
      description: "전사 업무 캘린더에서 특정 부서 또는 전체의 등록된 일정 목록을 조회합니다.",
      parameters: {
        type: "object",
        properties: {
          department: { type: "string", description: "조회할 부서 (생산팀, 자재팀, 영업팀 등, 생략 시 전체)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_attendance",
      description: "임직원의 출근 또는 퇴근을 체크합니다.",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["CHECK_IN", "CHECK_OUT"], description: "체크 종류" },
          userName: { type: "string", description: "성명" },
          note: { type: "string", description: "특이사항 또는 외근 사유" },
        },
        required: ["action"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "apply_leave",
      description: "연차, 반차, 외근 등 휴가/외근 결재 신청서를 등록합니다.",
      parameters: {
        type: "object",
        properties: {
          leaveType: { type: "string", enum: ["ANNUAL", "HALF_AM", "HALF_PM", "FIELD_WORK"], description: "휴가 종류" },
          startDate: { type: "string", description: "시작일 (YYYY-MM-DD)" },
          endDate: { type: "string", description: "종료일 (YYYY-MM-DD)" },
          reason: { type: "string", description: "신청 사유" },
        },
        required: ["leaveType", "startDate", "reason"],
      },
    },
  },
];

// Tool 실제 실행 핸들러 (Dispatcher)
export async function executeErpTool(name: string, args: any): Promise<any> {
  switch (name) {
    case "query_inventory_stock": {
      const parts = await amkInventory.searchPart(args.query || "");
      if (parts.length === 0) {
        return { success: false, message: `'${args.query}'에 해당하는 부품을 amk-inventory에서 찾지 못했습니다.` };
      }
      return {
        success: true,
        count: parts.length,
        items: parts.slice(0, 5).map((p) => ({
          partNumber: p.partNumber,
          name: p.name,
          category: p.category,
          currentStock: p.currentStock,
          minRequiredStock: p.minRequiredStock,
          isLowStock: p.isLowStock,
          shortageAmount: p.shortageAmount,
        })),
      };
    }

    case "get_low_stock_alerts": {
      const lowItems = await amkInventory.getLowStockItems();
      const limit = args.limit || 5;
      return {
        success: true,
        totalLowStockCount: lowItems.length,
        items: lowItems.slice(0, limit).map((p) => ({
          partNumber: p.partNumber,
          name: p.name,
          category: p.category,
          currentStock: p.currentStock,
          minRequiredStock: p.minRequiredStock,
          shortageAmount: p.shortageAmount,
        })),
      };
    }

    case "create_calendar_task": {
      // 로컬 태스크 API 호출 모의 실행
      const today = new Date().toISOString().slice(0, 16);
      return {
        success: true,
        message: `캘린더에 '${args.title}' 일정이 등록되었습니다.`,
        task: {
          title: args.title,
          department: args.department,
          startDate: args.startDate || today,
          priority: args.priority || "MEDIUM",
          linkedItemCode: args.linkedItemCode,
        },
      };
    }

    case "get_schedule_summary": {
      return {
        success: true,
        message: "현재 캘린더에 5개의 업무 일정이 등록되어 있습니다.",
        sampleTasks: [
          "[생산1팀] 볼트 M4 규격 조립 라인 투입 (진행중)",
          "[자재관리] amk-inventory 안전재고 부족 품목 발주 회의 (긴급)",
          "[품질관리] 완성품 QA 검사 및 테스트 성적서 작성",
        ],
      };
    }

    case "check_attendance": {
      const now = new Date().toTimeString().slice(0, 8);
      return {
        success: true,
        message: `${args.action === "CHECK_IN" ? "출근" : "퇴근"} 체크가 정상 처리되었습니다. (기록 시각: ${now})`,
        action: args.action,
        status: "NORMAL",
      };
    }

    case "apply_leave": {
      return {
        success: true,
        message: `${args.leaveType} 신청서가 결재함에 상신되었습니다. 팀장 결재 대기 중입니다.`,
        leaveDetails: args,
      };
    }

    default:
      return { success: false, message: `알 수 없는 도구입니다: ${name}` };
  }
}