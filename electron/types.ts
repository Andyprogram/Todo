// 任务列表类型
export interface TaskList {
  id: string;
  name: string;
  color: string;
  icon: string;
  position: number;
  created_at: string;
  updated_at: string;
}

// 任务类型
export interface Task {
  id: string;
  list_id: string;
  title: string;
  note: string;
  due_date: string | null;
  reminder_date: string | null;
  is_important: number; // 0 or 1
  is_completed: number; // 0 or 1
  completed_at: string | null;
  position: number;
  repeat_type: string | null; // 'daily', 'weekly', 'monthly', 'yearly', null
  created_at: string;
  updated_at: string;
}

// 子步骤类型
export interface Step {
  id: string;
  task_id: string;
  title: string;
  is_completed: number; // 0 or 1
  position: number;
  created_at: string;
  updated_at: string;
}

// 智能视图类型
export type SmartView = 'myday' | 'important' | 'planned' | 'all' | 'completed';

// IPC 通道定义
export const IPC_CHANNELS = {
  // 任务列表
  GET_LISTS: 'db:getLists',
  CREATE_LIST: 'db:createList',
  UPDATE_LIST: 'db:updateList',
  DELETE_LIST: 'db:deleteList',

  // 任务
  GET_TASKS: 'db:getTasks',
  GET_TASKS_BY_LIST: 'db:getTasksByList',
  GET_TASKS_BY_SMART_VIEW: 'db:getTasksBySmartView',
  GET_TASK_BY_ID: 'db:getTaskById',
  CREATE_TASK: 'db:createTask',
  UPDATE_TASK: 'db:updateTask',
  DELETE_TASK: 'db:deleteTask',
  TOGGLE_TASK_COMPLETE: 'db:toggleTaskComplete',
  TOGGLE_TASK_IMPORTANT: 'db:toggleTaskImportant',
  SEARCH_TASKS: 'db:searchTasks',

  // 子步骤
  GET_STEPS: 'db:getSteps',
  CREATE_STEP: 'db:createStep',
  UPDATE_STEP: 'db:updateStep',
  DELETE_STEP: 'db:deleteStep',
  TOGGLE_STEP_COMPLETE: 'db:toggleStepComplete',

  // 设置
  GET_SETTING: 'db:getSetting',
  SET_SETTING: 'db:setSetting',
  GET_ALL_SETTINGS: 'db:getAllSettings',

  // 主题
  UPDATE_TITLE_BAR: 'app:updateTitleBar',
} as const;
