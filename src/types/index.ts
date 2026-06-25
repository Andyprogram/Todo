export interface TaskList {
  id: string;
  name: string;
  color: string;
  icon: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  list_id: string;
  title: string;
  note: string;
  due_date: string | null;
  reminder_date: string | null;
  is_important: number;
  is_completed: number;
  completed_at: string | null;
  position: number;
  repeat_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface Step {
  id: string;
  task_id: string;
  title: string;
  is_completed: number;
  position: number;
  created_at: string;
  updated_at: string;
}

export type SmartView = 'myday' | 'important' | 'planned' | 'all' | 'completed';

export interface TodoAPI {
  getLists: () => Promise<TaskList[]>;
  createList: (data: { name: string; color?: string; icon?: string }) => Promise<TaskList>;
  updateList: (id: string, data: { name?: string; color?: string; icon?: string; position?: number }) => Promise<TaskList | null>;
  deleteList: (id: string) => Promise<boolean>;
  getTasksByList: (listId: string) => Promise<Task[]>;
  getTasksBySmartView: (view: string) => Promise<Task[]>;
  getTaskById: (id: string) => Promise<Task | null>;
  createTask: (data: {
    list_id: string;
    title: string;
    note?: string;
    due_date?: string | null;
    reminder_date?: string | null;
    is_important?: boolean;
    repeat_type?: string | null;
  }) => Promise<Task>;
  updateTask: (id: string, data: Record<string, unknown>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  toggleTaskComplete: (id: string) => Promise<Task | null>;
  toggleTaskImportant: (id: string) => Promise<Task | null>;
  searchTasks: (query: string) => Promise<Task[]>;
  getSteps: (taskId: string) => Promise<Step[]>;
  createStep: (data: { task_id: string; title: string }) => Promise<Step>;
  updateStep: (id: string, data: Record<string, unknown>) => Promise<Step | null>;
  deleteStep: (id: string) => Promise<boolean>;
  toggleStepComplete: (id: string) => Promise<Step | null>;
  getSetting: (key: string) => Promise<string | null>;
  setSetting: (key: string, value: string) => Promise<void>;
  getAllSettings: () => Promise<Record<string, string>>;
  updateTitleBar: (theme: string) => Promise<void>;
}

declare global {
  interface Window {
    todoAPI: TodoAPI;
  }
}
