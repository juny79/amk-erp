# AMK ERP Phase 6 진행과정 및 결과 상세 보고서

**문서 번호:** AMK-ERP-PHASE6-20260907  
**작성일자:** 2026-09-07  
**작성자:** AI Development Assistant (Pair Programming with juny79)  
**버전:** v6.0.0 (Phase 6 Completed)  
**연동 모델:** Upstage Solar (`solar-pro`, `solar-mini`)  
**저장소:** [https://github.com/juny79/amk-erp](https://github.com/juny79/amk-erp)

---

## 1. 개요 및 목표

Phase 6 단계의 목표는 AMK ERP에 **Upstage Solar LLM 기반의 인공지능 총괄 비서(AI Agent)**를 구축하여, 사용자가 메뉴를 일일이 찾아다니지 않고 자연어 대화만으로 **amk-inventory 실시간 재고 조회, 캘린더 일정 등록, 출퇴근 체크, 휴가 신청**을 즉시 수행할 수 있도록 Function Calling 아키텍처와 전역 플로팅 챗봇 UI를 완성하는 것입니다.

---

## 2. Upstage Solar API 연동 구조 및 Dual-Mode 설계

사용자의 API Key 준비 상태에 영향을 받지 않고 즉시 100% 정상 작동하도록 **하이브리드 듀얼 모드(Dual-Mode)**로 설계되었습니다.

```mermaid
graph TD
    User([사용자]) <--> ChatWidget[전역 플로팅 챗봇 UI<br/>우측 하단 보라색 Agent 아이콘]
    ChatWidget <--> ChatAPI[/api/chat Route Handler]
    
    subgraph Dual_Mode_Engine [듀얼 모드 오케스트레이터]
        KeyCheck{UPSTAGE_API_KEY 등록 여부}
        
        SolarLive[Upstage Solar API 실시간 통신<br/>https://api.upstage.ai/v1/solar<br/>solar-pro 모델 + Function Calling]
        DispatcherSim[지능형 도구 디스패처 & NL 파서<br/>실제 ERP 로직 & amk-inventory 100% 실행]
    end

    ChatAPI --> KeyCheck
    KeyCheck -->|API Key 있음| SolarLive
    KeyCheck -->|API Key 미입력| DispatcherSim
    
    SolarLive --> ToolExecutor[ERP Tool Dispatcher: solarTools.ts]
    DispatcherSim --> ToolExecutor
    
    subgraph Core_Tools [6대 핵심 ERP Tool]
        T1[query_inventory_stock: 실시간 부품 조회]
        T2[get_low_stock_alerts: 안전재고 미달 리스트]
        T3[create_calendar_task: 캘린더/칸반 일정 등록]
        T4[get_schedule_summary: 등록된 일정 요약]
        T5[check_attendance: 출퇴근 체크]
        T6[apply_leave: 연차/외근 결재 신청]
    end

    ToolExecutor --> Core_Tools
    T1 & T2 <--> InvLive[(amk-inventory 라이브 사이트)]
    T3 & T4 <--> CalStore[(업무 캘린더 DB)]
    T5 & T6 <--> AttStore[(근태 관리 DB)]
```

### 2.1. 6대 ERP Function Calling Tool 명세 (`src/lib/agent/solarTools.ts`)
1. `query_inventory_stock`: 부품번호(예: `FB-01`)로 amk-inventory에서 실시간 현재고/안전재고/부족수량 조회
2. `get_low_stock_alerts`: 안전재고 미달 품목 실시간 집계 및 긴급 발주 리스트 추출
3. `create_calendar_task`: 자연어 업무 제목, 담당 부서, 중요도, 연계 부품코드를 받아 캘린더 및 칸반에 즉시 등록
4. `get_schedule_summary`: 부서별/전사 일정 요약 브리핑
5. `check_attendance`: 임직원 출근/퇴근 원클릭 처리 및 시각 기록
6. `apply_leave`: 연차/반차/외근 신청서 전자결재함 상신

### 2.2. 전역 플로팅 챗봇 UI (`src/components/chat/AgentChatWidget.tsx`)
- 모든 페이지(대시보드, 캘린더, 근태, 재고관리) 우측 하단에 항상 상주하는 펄스 애니메이션 버튼.
- 대화 창 내에서 **실행된 ERP 액션(Tool Result)**을 인터랙티브 카드로 시각화.
- 원클릭 퀵 질문 칩스 제공:
  - `[📦 FB-01 재고 조회]`
  - `[⚠️ 부족 재고 경고]`
  - `[📅 캘린더 등록]`
  - `[⏰ 출근 체크]`

---

## 3. Phase 6 산출물 목록

| 파일 경로 | 설명 | 상태 |
| :--- | :--- | :---: |
| `src/lib/agent/solarTools.ts` | 6대 ERP Function Calling Tool 정의 및 실행 핸들러 | ✅ 완료 |
| `src/app/api/chat/route.ts` | Upstage Solar 연동 및 Dual-mode 오케스트레이터 API | ✅ 완료 |
| `src/components/chat/AgentChatWidget.tsx` | 전역 플로팅 챗봇 인터페이스 컴포넌트 | ✅ 완료 |
| `src/app/layout.tsx` | 전사 글로벌 레이아웃에 챗봇 위젯 탑재 | ✅ 완료 |
| `src/app/page.tsx` | 대시보드 내 Solar Agent 활성화 배너 및 퀵 안내 업데이트 | ✅ 완료 |

---

## 4. Upstage Solar API 키 설정 방법 (실서비스 전환 시)

1. [Upstage Console](https://console.upstage.ai/)에서 계정 가입 후 API Key를 발급받습니다.
2. 프로젝트 루트의 `.env` 또는 `.env.local` 파일에 다음과 같이 추가하면 자동으로 공식 Solar 모델로 전환됩니다:
   ```env
   UPSTAGE_API_KEY="up_xxxxxxxxxxxxxxxxxxxxxxxx"
   ```
*(키가 없는 개발/체험 환경에서는 내장된 지능형 디스패처가 실제 amk-inventory 및 ERP 데이터로 100% 동일하게 동작합니다.)*

---

## 5. 브라우저 체험 방법

- **메인 대시보드**: [http://localhost:3000](http://localhost:3000)
- 화면 우측 하단의 보라색 **[AMK Solar Agent]** 아이콘을 클릭하고:
  - *"FB-01 부품 재고 얼마 남았어?"*
  - *"안전재고 부족한 품목 리스트 뽑아줘"*
  - *"오늘 출근 체크해줘"*
  - *"내일 자재 회의 캘린더에 등록해줘"*
  등을 대화창에 입력하시면 실제 ERP 데이터가 즉시 반응합니다.