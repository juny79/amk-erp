export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO String (YYYY-MM-DD or YYYY-MM-DDTHH:mm)
  endDate: string;
  allDay: boolean;
  status: TaskStatus;
  priority: TaskPriority;
  color?: string;
  assigneeName?: string;
  department?: string;
  tags: string[];
  linkedItemCode?: string; // amk-inventory 연동 자재코드
}
