# AMK 맞춤형 차세대 ERP 플랫폼 구축 종합 진행 현황 보고서

**문서 번호:** AMK-ERP-MASTER-STATUS-20260908  
**작성일자:** 2026-09-08  
**작성자:** AI Development Assistant (Pair Programming with juny79)  
**소프트웨어 버전:** v6.5.0 (Phase 1 ~ Phase 6 전 모듈 통합 완료)  
**원격 리포지토리:** [https://github.com/juny79/amk-erp](https://github.com/juny79/amk-erp)  
**연동 재고관리 사이트:** [https://amk-inventory.vercel.app](https://amk-inventory.vercel.app)

---

## 1. 프로젝트 개요 및 추진 목적

본 프로젝트는 **AMK(회사)**의 고유한 생산/자재/영업 프로세스에 최적화된 **올인원 맞춤형 ERP 웹 플랫폼**을 구축하는 프로젝트입니다.
기존에 분산되어 있던 사내 업무 공유 체계, 출퇴근 근태 관리, 기존 재고관리 웹 애플리케이션(`amk-inventory`)을 단일 대시보드로 통합하고, **한국어 도메인 특화 LLM인 Upstage Solar AI Agent**를 코어로 탑재하여 자연어 대화만으로 전사 업무를 조회·조작할 수 있는 차세대 지능형 ERP를 구현하는 것을 목표로 합니다.

---

## 2. 전체 시스템 구성 및 통합 아키텍처

```mermaid
graph TD
    User([임직원 / 관리자]) --> Presentation[모던 반응형 웹 프레젠테이션 계층<br/>Next.js 16 + React 19 + Tailwind CSS + Lucide]
    
    subgraph Presentation [클라이언트 프레젠테이션]
        P1[📊 통합 대시보드 /]
        P2[📅 스마트 업무 캘린더 & 칸반 /calendar]
        P3[⏰ 스마트 근태 & 전자결재 /attendance]
        P4[📦 amk-inventory 재고관리 /inventory]
        P5[🤖 전역 플로팅 AI Agent 챗봇 위젯]
    end

    subgraph App_Server [Next.js 풀스택 비즈니스 로직 계층]
        APITask[/api/tasks: 업무 CRUD & 부서 필터]
        APIAtt[/api/attendance & /api/leave: 근태/결재]
        APIInv[/api/inventory: 실시간 재고 프록시]
        APIChat[/api/chat: Upstage Solar Function Calling]
    end

    subgraph External_Integration [데이터 연동 및 외부 시스템]
        Prisma[(PostgreSQL & Prisma ORM 스키마 v2.1)]
        InvClient[AmkInventoryClient 30s Cache Adapter]
        SolarLive[Upstage Solar API Endpoint: solar-pro / mini]
    end

    Presentation <--> App_Server
    APITask <--> Prisma
    APIAtt <--> Prisma
    APIInv <--> InvClient <-->|실시간 API 동기화| InvWeb[(amk-inventory Live Vercel)]
    APIChat <--> SolarLive
    APIChat --> APITask & APIAtt & APIInv
```

---

## 3. Phase별 추진 경과 및 핵심 완료 산출물 (종합 타임라인)

### 📌 Phase 1. 기반 구축 및 GitHub 원격 연동 (2026-09-02 ~ 2026-09-04)
- **주요 내용**:
  - 프로젝트 종합 계획 수립 및 아키텍처 확정 (ADR 보고서 작성)
  - 로컬 Git 리포지토리 초기화 및 GitHub 원격 저장소(`juny79/amk-erp`) 최초 연동 및 동기화
  - GitHub Actions CI/CD 자동화 파이프라인(`.github/workflows/ci-cd.yml`) 구성
- **관련 문서**:
  - `docs/ARCHITECTURE_RATIONALE_REPORT_v1.0.0_20260904.md`
  - `docs/COMPREHENSIVE_PLAN_AND_ARCHITECTURE_v2.1.0_20260904.md`

### 📌 Phase 2. 개발 런타임 환경 & Prisma DB 모델링 (2026-09-04)
- **주요 내용**:
  - Windows 패키지 매니저(`winget`)를 통한 공식 Node.js LTS (v24.19.0, npm v11.17.0) 설치
  - Next.js 16 (Turbopack), React 19, Tailwind CSS, Lucide React, Prisma ORM 프로젝트 초기화
  - PostgreSQL 7대 핵심 엔터티 모델링(`prisma/schema.prisma`):
    1. `User` (사번, 부서, 직급, RBAC 권한: ADMIN/MANAGER/STAFF)
    2. `Attendance` (출퇴근 시각, 지각/조퇴/외근 판정, 사내 IP 및 GPS 위치)
    3. `LeaveRequest` (연차/반차/외근/출장 간이 전자결재)
    4. `Task` (업무명, 시작/종료일시, 칸반 상태: TODO/IN_PROGRESS/REVIEW/DONE, 자재 연계키)
    5. `InventoryCache` (amk-inventory 연동 캐시, 안전재고 미달 플래그)
    6. `ChatSession` & `ChatMessage` (Solar AI Agent 대화 이력 및 Function Calling 입출력)
    7. `AuditLog` (엔터프라이즈 데이터 감사 추적)
- **관련 문서**: `docs/PHASE2_PROGRESS_AND_RESULT_REPORT_v2.0.0_20260904.md`

### 📌 Phase 3. 스마트 업무 공유 캘린더 & 칸반 보드 (2026-09-07)
- **주요 내용**:
  - 일간(Day), 주간(Week), 월간(Month) 멀티뷰 인터랙티브 캘린더 엔진 개발
  - HTML5 드래그 앤 드롭 업무 상태 이동 칸반 보드(To-Do $\rightarrow$ In Progress $\rightarrow$ Review $\rightarrow$ Done)
  - 부서별(생산팀, 자재팀, 영업팀, 품질팀, 인사총무) 실시간 필터링
  - `amk-inventory` 자재코드(`MAT-BOLT-M4` 등) 연동 태그 및 업무 등록/수정 모달 구현
- **관련 문서**: `docs/PHASE3_PROGRESS_AND_RESULT_REPORT_v3.0.0_20260907.md`

### 📌 Phase 4. 스마트 근태 관리 및 간이 전자결재 (2026-09-07)
- **주요 내용**:
  - 사내 네트워크 IP(`192.168.0.21`) 및 위치 검증 기반 원클릭 출퇴근 체크 카드
  - `09:00:00` 기준 **지각(Late) / 정상(Normal)** 자동 판정 및 퇴근 시 당일 근무시간 자동 산출
  - 당일 출근율(`%`), 지각자, 외근자, 휴가자 실시간 통계 KPI 위젯 및 전사 근무 현황판
  - 연차(1일), 오전/오후 반차(0.5일), 외근/출장 간이 결재 상신 및 팀장 `[승인]` / `[반려]` 워크플로우
- **관련 문서**: `docs/PHASE4_PROGRESS_AND_RESULT_REPORT_v4.0.0_20260907.md`

### 📌 Phase 5. `amk-inventory` 실시간 데이터 파이프라인 연동 (2026-09-07)
- **주요 내용**:
  - 실제 배포 운영 중인 [https://amk-inventory.vercel.app](https://amk-inventory.vercel.app)과 실시간 통신
  - 전체 137개 부품 실시간 데이터 동기화 및 30초 인메모리 캐싱 어댑터(`AmkInventoryClient`) 구축
  - **4대 연계 시나리오 완성**:
    1. **안전재고 부족 경고**: 기준 미달 85개 품목 자동 감지 및 긴급 경고 배너 시각화
    2. **캘린더 원클릭 연계**: 부품 클릭 시 발주/조립 일정을 AMK 캘린더에 자동 등록
    3. **AI Agent 인터페이스 제공**: 부품 실시간 검색 및 수량 조회 파이프라인 개방
    4. **현장 업무 일원화**: 대시보드에서 출퇴근 후 당일 투입 자재 즉시 확인
  - **사용자 요청 반영**: 기존 `amk-inventory`의 **"실시간 부품 재고 현황"** 화면 레이아웃, 검색/구분 필터, CSV 다운로드, PDF 인쇄, 인라인 수정 기능 100% 동일 구현
- **관련 문서**: `docs/PHASE5_PROGRESS_AND_RESULT_REPORT_v5.0.0_20260907.md`

### 📌 Phase 6. Upstage Solar AI Agent 챗봇 탑재 (2026-09-07 ~ 2026-09-08)
- **주요 내용**:
  - 공식 **Upstage Solar LLM(`solar-pro`, `solar-mini`)** 연동 파이프라인 구축
  - 6대 핵심 ERP Function Calling 도구(재고 조회, 부족재고 경고, 캘린더 등록, 일정 요약, 출퇴근 체크, 휴가 신청) 구현
  - **실제 API Key 연동 완료**: 발급받은 `UPSTAGE_API_KEY`를 환경설정(`.env.local` / `.env`)에 등록하여 공식 `solar-pro` 실시간 통신 및 Tool Calling 검증 완료
  - **전역 플로팅 챗봇 UI 최적화**:
    - 모든 페이지 우측 하단 상주(`z-index: 999999`) 및 인터랙티브 대화 창
    - 브라우저 확장 프로그램 간섭(Hydration Error) 방지 가드 적용
    - **가독성 개편**: 거슬리는 마크다운 별표(`**`) 기호를 제거하고 주요 품목/수량/상태를 **고대비 볼드 뱃지(Highlight Badge)**로 깔끔하게 렌더링
- **관련 문서**: `docs/PHASE6_PROGRESS_AND_RESULT_REPORT_v6.0.0_20260907.md`

---

## 4. 모듈별 기능 매트릭스 및 구현 상태표

| 대분류 | 핵심 기능 | 구현 상세 | 상태 |
| :--- | :--- | :--- | :---: |
| **통합 대시보드** | 메인 포털 | 4대 모듈 퀵 네비게이션, 시스템 가동 상태 배너 | ✅ 완료 |
| **업무 & 캘린더** | 멀티뷰 캘린더 | 일간, 주간, 월간 인터랙티브 뷰 (date-fns 기반) | ✅ 완료 |
| | 칸반 보드 | HTML5 Drag & Drop (To-Do, In Progress, Review, Done) | ✅ 완료 |
| | 자재코드 연계 | `linkedItemCode` 기반 자재 조립/발주 태그 표시 | ✅ 완료 |
| **근태 관리** | 스마트 출퇴근 | 사내 IP 감지, 09:00 지각 자동 판정, 근무시간 산출 | ✅ 완료 |
| | 근무 현황판 | 전사 임직원 실시간 근무 상태 테이블 및 통계 KPI | ✅ 완료 |
| | 간이 전자결재 | 연차, 오전/오후 반차, 외근 신청 및 팀장 승인/반려 | ✅ 완료 |
| **재고 연동** | 실시간 파이프라인 | amk-inventory 라이브 사이트(137개 품목) 실시간 조회 | ✅ 완료 |
| | 안전재고 경고 | 기준치 미달 85건 자동 추출 및 발주 캘린더 연계 | ✅ 완료 |
| | UI 일치화 | 기존 사이트의 헤더, 구분 필터, CSV/PDF 저장 동일 지원 | ✅ 완료 |
| **Solar AI Agent** | LLM 오케스트레이터 | Upstage Solar 공식 API (`solar-pro`) 실시간 연결 | ✅ 완료 |
| | Function Calling | 6대 ERP 도구 자동 판별 및 실제 데이터 제어 | ✅ 완료 |
| | 전역 플로팅 UI | 전 페이지 우측 하단 상주, 퀵 질문 칩스, 가독성 뱃지 | ✅ 완료 |
| **형상 및 인프라** | GitHub 연동 | `juny79/amk-erp` 원격 저장소 동기화 (전 커밋 푸시 완료) | ✅ 완료 |
| | CI/CD | GitHub Actions Node.js 20 자동 린트 및 빌드 검증 | ✅ 완료 |

---

## 5. 로컬 실행 및 브라우저 접속 가이드

1. **개발 서버 구동 확인**:
   - 현재 로컬 백그라운드 프로세스로 `http://localhost:3000`에서 가동 중입니다.
2. **주요 페이지 바로가기**:
   - **통합 메인 대시보드**: [http://localhost:3000](http://localhost:3000)
   - **스마트 업무 캘린더 & 칸반**: [http://localhost:3000/calendar](http://localhost:3000/calendar)
   - **스마트 근태 관리 & 전자결재**: [http://localhost:3000/attendance](http://localhost:3000/attendance)
   - **실시간 재고 관리 (amk-inventory)**: [http://localhost:3000/inventory](http://localhost:3000/inventory)
   - **AI Agent 챗봇**: 모든 페이지 우측 하단 **[AMK Solar Agent]** 아이콘 클릭

---

## 6. 향후 발전 과제 (Next Steps)

1. **모바일 PWA (Progressive Web App) 패키징**:
   - 스마트폰 홈 화면 추가 기능(Web Manifest) 및 오프라인 캐시 적용으로 현장 출퇴근/재고 확인 편의성 극대화.
2. **사내 온프레미스 / 클라우드(Vercel, AWS) 프로덕션 배포**:
   - Docker 컨테이너라이징 및 Vercel 원클릭 프로덕션 배포 설정.
3. **사내 매뉴얼 RAG(검색 증강 생성) 지식베이스 확장**:
   - Upstage Document Parse 및 `pgvector`를 결합하여 사내 취업규칙 및 부품 사양서 PDF 질의응답 확장.