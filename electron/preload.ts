import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from './types';

const api = {
  // 任务列表
  getLists: () => ipcRenderer.invoke(IPC_CHANNELS.GET_LISTS),
  createList: (data: { name: string; color?: string; icon?: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.CREATE_LIST, data),
  updateList: (id: string, data: { name?: string; color?: string; icon?: string; position?: number }) =>
    ipcRenderer.invoke(IPC_CHANNELS.UPDATE_LIST, id, data),
  deleteList: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.DELETE_LIST, id),

  // 任务
  getTasksByList: (listId: string) => ipcRenderer.invoke(IPC_CHANNELS.GET_TASKS_BY_LIST, listId),
  getTasksBySmartView: (view: string) => ipcRenderer.invoke(IPC_CHANNELS.GET_TASKS_BY_SMART_VIEW, view),
  getTaskById: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.GET_TASK_BY_ID, id),
  createTask: (data: {
    list_id: string;
    title: string;
    note?: string;
    due_date?: string | null;
    reminder_date?: string | null;
    is_important?: boolean;
    repeat_type?: string | null;
  }) => ipcRenderer.invoke(IPC_CHANNELS.CREATE_TASK, data),
  updateTask: (id: string, data: Record<string, unknown>) =>
    ipcRenderer.invoke(IPC_CHANNELS.UPDATE_TASK, id, data),
  deleteTask: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.DELETE_TASK, id),
  toggleTaskComplete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.TOGGLE_TASK_COMPLETE, id),
  toggleTaskImportant: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.TOGGLE_TASK_IMPORTANT, id),
  searchTasks: (query: string) => ipcRenderer.invoke(IPC_CHANNELS.SEARCH_TASKS, query),

  // 子步骤
  getSteps: (taskId: string) => ipcRenderer.invoke(IPC_CHANNELS.GET_STEPS, taskId),
  createStep: (data: { task_id: string; title: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.CREATE_STEP, data),
  updateStep: (id: string, data: Record<string, unknown>) =>
    ipcRenderer.invoke(IPC_CHANNELS.UPDATE_STEP, id, data),
  deleteStep: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.DELETE_STEP, id),
  toggleStepComplete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.TOGGLE_STEP_COMPLETE, id),

  // 设置
  getSetting: (key: string) => ipcRenderer.invoke(IPC_CHANNELS.GET_SETTING, key),
  setSetting: (key: string, value: string) => ipcRenderer.invoke(IPC_CHANNELS.SET_SETTING, key, value),
  getAllSettings: () => ipcRenderer.invoke(IPC_CHANNELS.GET_ALL_SETTINGS),

  // 主题
  updateTitleBar: (theme: string) => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_TITLE_BAR, theme),
};

contextBridge.exposeInMainWorld('todoAPI', api);
