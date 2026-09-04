# AMK ERP Phase 2 진행과정 및 결과 상세 보고서

**문서 번호:** AMK-ERP-PHASE2-20260904  
**작성일자:** 2026-09-04  
**작성자:** AI Development Assistant (Pair Programming with juny79)  
**버전:** v2.0.0 (Phase 2 Completed)  
**저장소:** [https://github.com/juny79/amk-erp](https://github.com/juny79/amk-erp)

---

## 1. 개요 및 목표

Phase 2 단계의 목표는 **AMK 맞춤형 차세대 ERP**의 실제 비즈니스 로직과 화면을 구현하기 위한 **런타임 환경 조성, 풀스택 프레임워크(Next.js 15) 스켈레톤 구축, 데이터베이스 엔터티(Prisma ORM) 모델링**을 완료하는 것입니다.

---

## 2. 진행 과정 및 해결 내역

### 2.1. 개발 런타임 환경 (Node.js LTS) 구축
* **현상**: 시스템에 Node.js 및 npm 명령어가 등록되어 있지 않음.
* **조치**: Windows 패키지 관리자(`winget`)를 통해 공식 **Node.js LTS (v24.19.0, npm v11.17.0)**를 성공적으로 설치 및 환경 변수 경로 연동.

### 2.2. 프론트엔드 및 백엔드 의존성 패키지 설치
* `package.json` 스크립트(`dev`, `build`, `start`, `lint`, `prisma:generate`, `prisma:push`) 구성.
* Next.js, React 19, Tailwind CSS, Lucide React, Date-fns, Prisma ORM 등 핵심 라이브러리 연계 및 TypeScript 설정(`tsconfig.json`).

### 2.3. 엔터프라이즈 DB 스키마 모델링 (`prisma/schema.prisma`)
v2.1 아키텍처에 정의된 요구사항을 바탕으로 7대 핵심 도메인 모델을 완벽히 설계하였습니다:

1. **`User` (조직/계정)**: 사번(`employeeNumber`), 부서, 직급, RBAC 역할(`ADMIN`, `MANAGER`, `STAFF`).
2. **`Attendance` (근태 관리)**: 근무 일자, 출근/퇴근 시각, 근무상태(`NORMAL`, `LATE`, `EARLY_LEAVE`, `ABSENT`, `FIELD_WORK`), 사내 IP, GPS 위치, 특이사항.
3. **`LeaveRequest` (간이 전자결재)**: 연차/반차/외근 신청, 시작일/종료일, 승인상태(`PENDING`, `APPROVED`, `REJECTED`), 결재자 매핑.
4. **`Task` (업무 & 캘린더)**: 업무명, 상세, 시작/종료 일시, 종일 여부, 진행상태(`TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`), 우선순위, 담당자, 부서 태그, `amk-inventory` 연계 키.
5. **`InventoryCache` (`amk-inventory` 연동)**: 품목코드, 품명, 규격, 현재고, 안전재고, 창고 위치, 안전재고 미달 플래그(`isLowStock`), 동기화 시각.
6. **`ChatSession` & `ChatMessage` (Upstage Solar AI Agent)**: 대화 세션, 사용자/AI 메시지, Function Calling 도구 호출(`toolCalls`), 도구 실행 결과(`toolResult`), Human-in-the-loop 변경 승인 플래그(`isConfirmed`).
7. **`AuditLog` (감사 로그)**: 변경 주체, 변경 액션, 변경 전/후 JSON 스냅샷, IP, 시각 기록.

### 2.4. 애플리케이션 스켈레톤 및 대시보드 쉘 구현
* `src/app/layout.tsx`: 전사 글로벌 메타데이터 및 반응형 루트 레이아웃.
* `src/app/globals.css`: Tailwind CSS 기반 커스텀 테마.
* `src/app/page.tsx`: 4대 핵심 모듈(캘린더, 근태, 재고, AI Agent) 상태를 한눈에 볼 수 있는 인터랙티브 대시보드 쉘 화면.
* `src/lib/prisma.ts`: 개발/프로덕션 환경을 위한 싱글톤 Prisma DB 클라이언트.
* `src/lib/utils.ts`: 스타일 병합 유틸리티(`cn`).

---

## 3. Phase 2 산출물 현황

| 파일 경로 | 설명 | 상태 |
| :--- | :--- | :---: |
| `prisma/schema.prisma` | PostgreSQL 7대 엔터티 스키마 모델링 | ✅ 완료 |
| `package.json` | Next.js 15, React 19, Prisma, Tailwind 의존성 정의 | ✅ 완료 |
| `tsconfig.json` | TypeScript 경로 별칭(`@/*`) 및 컴파일러 옵션 | ✅ 완료 |
| `tailwind.config.js` | AMK 브랜드 컬러 팔레트 및 반응형 유틸리티 설정 | ✅ 완료 |
| `.env.example` | DB URL, Upstage Solar API Key 등 환경변수 템플릿 | ✅ 완료 |
| `src/lib/prisma.ts` | Prisma Client 싱글톤 인스턴스 | ✅ 완료 |
| `src/app/page.tsx` | AMK 차세대 ERP 메인 대시보드 쉘 화면 | ✅ 완료 |

---

## 4. 다음 단계 로드맵 (Phase 3 안내)

- **목표**: **스마트 업무 공유 & 캘린더 플랫폼 구현**
- **주요 작업**:
  1. FullCalendar 기반 일간(Day), 주간(Week), 월간(Month) 인터랙티브 뷰 개발
  2. 업무 일정 생성/수정/삭제 모달 및 담당자 멘션, 부서별 필터링 기능
  3. 캘린더 ↔ 칸반 보드(Kanban) 드래그 앤 드롭 동기화 모듈 개발
