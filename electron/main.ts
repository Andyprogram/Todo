import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import * as db from './database';
import { IPC_CHANNELS } from './types';

// ESM 环境下 __dirname 不可用，需要手动构建
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 全局错误处理，防止主进程静默崩溃
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Todo',
    backgroundColor: '#f8fafc',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#ffffff',
      symbolColor: '#64748b',
      height: 36,
    },
  });

  // 开发环境加载 dev server，生产环境加载本地文件
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerIpcHandlers(): void {
  // 任务列表
  ipcMain.handle(IPC_CHANNELS.GET_LISTS, () => db.getLists());

  ipcMain.handle(IPC_CHANNELS.CREATE_LIST, (_e, data) => db.createList(data));

  ipcMain.handle(IPC_CHANNELS.UPDATE_LIST, (_e, id, data) => db.updateList(id, data));

  ipcMain.handle(IPC_CHANNELS.DELETE_LIST, (_e, id) => db.deleteList(id));

  // 任务
  ipcMain.handle(IPC_CHANNELS.GET_TASKS_BY_LIST, (_e, listId) => db.getTasksByList(listId));

  ipcMain.handle(IPC_CHANNELS.GET_TASKS_BY_SMART_VIEW, (_e, view) => db.getTasksBySmartView(view));

  ipcMain.handle(IPC_CHANNELS.GET_TASK_BY_ID, (_e, id) => db.getTaskById(id));

  ipcMain.handle(IPC_CHANNELS.CREATE_TASK, (_e, data) => db.createTask(data));

  ipcMain.handle(IPC_CHANNELS.UPDATE_TASK, (_e, id, data) => db.updateTask(id, data));

  ipcMain.handle(IPC_CHANNELS.DELETE_TASK, (_e, id) => db.deleteTask(id));

  ipcMain.handle(IPC_CHANNELS.TOGGLE_TASK_COMPLETE, (_e, id) => db.toggleTaskComplete(id));

  ipcMain.handle(IPC_CHANNELS.TOGGLE_TASK_IMPORTANT, (_e, id) => db.toggleTaskImportant(id));

  ipcMain.handle(IPC_CHANNELS.SEARCH_TASKS, (_e, query) => db.searchTasks(query));

  // 子步骤
  ipcMain.handle(IPC_CHANNELS.GET_STEPS, (_e, taskId) => db.getSteps(taskId));

  ipcMain.handle(IPC_CHANNELS.CREATE_STEP, (_e, data) => db.createStep(data));

  ipcMain.handle(IPC_CHANNELS.UPDATE_STEP, (_e, id, data) => db.updateStep(id, data));

  ipcMain.handle(IPC_CHANNELS.DELETE_STEP, (_e, id) => db.deleteStep(id));

  ipcMain.handle(IPC_CHANNELS.TOGGLE_STEP_COMPLETE, (_e, id) => db.toggleStepComplete(id));

  // 设置
  ipcMain.handle(IPC_CHANNELS.GET_SETTING, (_e, key) => db.getSetting(key));
  ipcMain.handle(IPC_CHANNELS.SET_SETTING, (_e, key, value) => db.setSetting(key, value));
  ipcMain.handle(IPC_CHANNELS.GET_ALL_SETTINGS, () => db.getAllSettings());

  // 主题 — 更新标题栏覆盖色
  ipcMain.handle(IPC_CHANNELS.UPDATE_TITLE_BAR, (_e, theme: string) => {
    if (mainWindow) {
      const isDark = theme === 'dark';
      mainWindow.setTitleBarOverlay({
        color: isDark ? '#1e293b' : '#ffffff',
        symbolColor: isDark ? '#94a3b8' : '#64748b',
        height: 36,
      });
    }
  });
}

app.whenReady().then(() => {
  db.initDatabase();
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  db.closeDatabase();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
