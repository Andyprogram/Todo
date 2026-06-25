import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import { v4 as uuidv4 } from 'uuid';
import type { TaskList, Task, Step } from './types';

let db: Database.Database;

export function initDatabase(): void {
  const dbPath = path.join(app.getPath('userData'), 'todo.db');
  db = new Database(dbPath);

  // 启用 WAL 模式提高并发性能
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  createTables();
  ensureDefaultList();
}

function createTables(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS task_lists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#3b82f6',
      icon TEXT NOT NULL DEFAULT '📋',
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      list_id TEXT NOT NULL,
      title TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      due_date TEXT,
      reminder_date TEXT,
      is_important INTEGER NOT NULL DEFAULT 0,
      is_completed INTEGER NOT NULL DEFAULT 0,
      completed_at TEXT,
      position INTEGER NOT NULL DEFAULT 0,
      repeat_type TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (list_id) REFERENCES task_lists(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS steps (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      title TEXT NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 0,
      position INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_list_id ON tasks(list_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON tasks(is_completed);
    CREATE INDEX IF NOT EXISTS idx_tasks_is_important ON tasks(is_important);
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_steps_task_id ON steps(task_id);

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    INSERT OR IGNORE INTO settings (key, value) VALUES ('theme', 'light');
  `);
}

function ensureDefaultList(): void {
  const count = db.prepare('SELECT COUNT(*) as count FROM task_lists').get() as { count: number };
  if (count.count === 0) {
    createList({
      name: '任务',
      color: '#3b82f6',
      icon: '📋',
    });
  }
}

// ========== 任务列表 CRUD ==========

export function getLists(): TaskList[] {
  return db.prepare('SELECT * FROM task_lists ORDER BY position ASC, created_at ASC').all() as TaskList[];
}

export function createList(data: { name: string; color?: string; icon?: string }): TaskList {
  const id = uuidv4();
  const maxPos = db.prepare('SELECT MAX(position) as max_pos FROM task_lists').get() as { max_pos: number | null };
  const position = (maxPos.max_pos ?? -1) + 1;

  const now = new Date().toISOString();
  const list: TaskList = {
    id,
    name: data.name,
    color: data.color || '#3b82f6',
    icon: data.icon || '📋',
    position,
    created_at: now,
    updated_at: now,
  };

  db.prepare(`
    INSERT INTO task_lists (id, name, color, icon, position, created_at, updated_at)
    VALUES (@id, @name, @color, @icon, @position, @created_at, @updated_at)
  `).run(list);

  return list;
}

export function updateList(id: string, data: Partial<Pick<TaskList, 'name' | 'color' | 'icon' | 'position'>>): TaskList | null {
  const existing = db.prepare('SELECT * FROM task_lists WHERE id = ?').get(id) as TaskList | undefined;
  if (!existing) return null;

  const updates: string[] = [];
  const params: Record<string, unknown> = { id };

  if (data.name !== undefined) { updates.push('name = @name'); params.name = data.name; }
  if (data.color !== undefined) { updates.push('color = @color'); params.color = data.color; }
  if (data.icon !== undefined) { updates.push('icon = @icon'); params.icon = data.icon; }
  if (data.position !== undefined) { updates.push('position = @position'); params.position = data.position; }

  if (updates.length === 0) return existing;

  updates.push("updated_at = datetime('now', 'localtime')");
  db.prepare(`UPDATE task_lists SET ${updates.join(', ')} WHERE id = @id`).run(params);

  return db.prepare('SELECT * FROM task_lists WHERE id = ?').get(id) as TaskList;
}

export function deleteList(id: string): boolean {
  const result = db.prepare('DELETE FROM task_lists WHERE id = ?').run(id);
  return result.changes > 0;
}

// ========== 任务 CRUD ==========

export function getTasksByList(listId: string): Task[] {
  return db.prepare(
    'SELECT * FROM tasks WHERE list_id = ? ORDER BY is_completed ASC, position ASC, created_at DESC'
  ).all(listId) as Task[];
}

export function getTasksBySmartView(view: string): Task[] {
  const today = new Date().toISOString().split('T')[0];

  switch (view) {
    case 'myday':
      return db.prepare(
        "SELECT * FROM tasks WHERE due_date = ? ORDER BY is_completed ASC, is_important DESC, position ASC"
      ).all(today) as Task[];

    case 'important':
      return db.prepare(
        'SELECT * FROM tasks WHERE is_important = 1 ORDER BY is_completed ASC, position ASC, created_at DESC'
      ).all() as Task[];

    case 'planned':
      return db.prepare(
        'SELECT * FROM tasks WHERE due_date IS NOT NULL ORDER BY is_completed ASC, due_date ASC, position ASC'
      ).all() as Task[];

    case 'all':
      return db.prepare(
        'SELECT * FROM tasks ORDER BY is_completed ASC, is_important DESC, created_at DESC'
      ).all() as Task[];

    case 'completed':
      return db.prepare(
        "SELECT * FROM tasks WHERE is_completed = 1 ORDER BY completed_at DESC"
      ).all() as Task[];

    default:
      return [];
  }
}

export function getTaskById(id: string): Task | null {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | null;
}

export function createTask(data: {
  list_id: string;
  title: string;
  note?: string;
  due_date?: string | null;
  reminder_date?: string | null;
  is_important?: boolean;
  repeat_type?: string | null;
}): Task {
  const id = uuidv4();
  const maxPos = db.prepare('SELECT MAX(position) as max_pos FROM tasks WHERE list_id = ?').get(data.list_id) as { max_pos: number | null };
  const position = (maxPos.max_pos ?? -1) + 1;

  const now = new Date().toISOString();
  const task: Task = {
    id,
    list_id: data.list_id,
    title: data.title,
    note: data.note || '',
    due_date: data.due_date ?? null,
    reminder_date: data.reminder_date ?? null,
    is_important: data.is_important ? 1 : 0,
    is_completed: 0,
    completed_at: null,
    position,
    repeat_type: data.repeat_type ?? null,
    created_at: now,
    updated_at: now,
  };

  db.prepare(`
    INSERT INTO tasks (id, list_id, title, note, due_date, reminder_date, is_important, is_completed, completed_at, position, repeat_type, created_at, updated_at)
    VALUES (@id, @list_id, @title, @note, @due_date, @reminder_date, @is_important, @is_completed, @completed_at, @position, @repeat_type, @created_at, @updated_at)
  `).run(task);

  return task;
}

export function updateTask(id: string, data: Partial<Pick<Task, 'title' | 'note' | 'due_date' | 'reminder_date' | 'is_important' | 'is_completed' | 'repeat_type' | 'list_id' | 'position'>>): Task | null {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined;
  if (!existing) return null;

  const updates: string[] = [];
  const params: Record<string, unknown> = { id };

  const fields = ['title', 'note', 'due_date', 'reminder_date', 'is_important', 'is_completed', 'repeat_type', 'list_id', 'position'] as const;
  for (const field of fields) {
    if (data[field] !== undefined) {
      updates.push(`${field} = @${field}`);
      params[field] = data[field];
    }
  }

  if (updates.length === 0) return existing;

  updates.push("updated_at = datetime('now', 'localtime')");
  db.prepare(`UPDATE tasks SET ${updates.join(', ')} WHERE id = @id`).run(params);

  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task;
}

export function deleteTask(id: string): boolean {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
  return result.changes > 0;
}

export function toggleTaskComplete(id: string): Task | null {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined;
  if (!task) return null;

  const newCompleted = task.is_completed ? 0 : 1;
  const completedAt = newCompleted ? new Date().toISOString() : null;

  db.prepare(`
    UPDATE tasks SET is_completed = ?, completed_at = ?, updated_at = datetime('now', 'localtime') WHERE id = ?
  `).run(newCompleted, completedAt, id);

  // 如果是重复任务且标记完成，创建下一次
  if (newCompleted && task.repeat_type && task.due_date) {
    const nextDate = getNextRepeatDate(task.due_date, task.repeat_type);
    createTask({
      list_id: task.list_id,
      title: task.title,
      note: task.note,
      due_date: nextDate,
      is_important: task.is_important === 1,
      repeat_type: task.repeat_type,
    });
  }

  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task;
}

export function toggleTaskImportant(id: string): Task | null {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined;
  if (!task) return null;

  const newImportant = task.is_important ? 0 : 1;
  db.prepare(`
    UPDATE tasks SET is_important = ?, updated_at = datetime('now', 'localtime') WHERE id = ?
  `).run(newImportant, id);

  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task;
}

export function searchTasks(query: string): Task[] {
  const searchTerm = `%${query}%`;
  return db.prepare(`
    SELECT * FROM tasks
    WHERE title LIKE ? OR note LIKE ?
    ORDER BY is_completed ASC, is_important DESC, created_at DESC
  `).all(searchTerm, searchTerm) as Task[];
}

function getNextRepeatDate(dateStr: string, repeatType: string): string {
  const date = new Date(dateStr);
  switch (repeatType) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date.toISOString().split('T')[0];
}

// ========== 子步骤 CRUD ==========

export function getSteps(taskId: string): Step[] {
  return db.prepare('SELECT * FROM steps WHERE task_id = ? ORDER BY position ASC, created_at ASC').all(taskId) as Step[];
}

export function createStep(data: { task_id: string; title: string }): Step {
  const id = uuidv4();
  const maxPos = db.prepare('SELECT MAX(position) as max_pos FROM steps WHERE task_id = ?').get(data.task_id) as { max_pos: number | null };
  const position = (maxPos.max_pos ?? -1) + 1;

  const now = new Date().toISOString();
  const step: Step = {
    id,
    task_id: data.task_id,
    title: data.title,
    is_completed: 0,
    position,
    created_at: now,
    updated_at: now,
  };

  db.prepare(`
    INSERT INTO steps (id, task_id, title, is_completed, position, created_at, updated_at)
    VALUES (@id, @task_id, @title, @is_completed, @position, @created_at, @updated_at)
  `).run(step);

  return step;
}

export function updateStep(id: string, data: Partial<Pick<Step, 'title' | 'is_completed' | 'position'>>): Step | null {
  const existing = db.prepare('SELECT * FROM steps WHERE id = ?').get(id) as Step | undefined;
  if (!existing) return null;

  const updates: string[] = [];
  const params: Record<string, unknown> = { id };

  if (data.title !== undefined) { updates.push('title = @title'); params.title = data.title; }
  if (data.is_completed !== undefined) { updates.push('is_completed = @is_completed'); params.is_completed = data.is_completed; }
  if (data.position !== undefined) { updates.push('position = @position'); params.position = data.position; }

  if (updates.length === 0) return existing;

  updates.push("updated_at = datetime('now', 'localtime')");
  db.prepare(`UPDATE steps SET ${updates.join(', ')} WHERE id = @id`).run(params);

  return db.prepare('SELECT * FROM steps WHERE id = ?').get(id) as Step;
}

export function deleteStep(id: string): boolean {
  const result = db.prepare('DELETE FROM steps WHERE id = ?').run(id);
  return result.changes > 0;
}

export function toggleStepComplete(id: string): Step | null {
  const step = db.prepare('SELECT * FROM steps WHERE id = ?').get(id) as Step | undefined;
  if (!step) return null;

  const newCompleted = step.is_completed ? 0 : 1;
  db.prepare(`
    UPDATE steps SET is_completed = ?, updated_at = datetime('now', 'localtime') WHERE id = ?
  `).run(newCompleted, id);

  return db.prepare('SELECT * FROM steps WHERE id = ?').get(id) as Step;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
  }
}

// ========== 设置 ==========

export function getSetting(key: string): string | null {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  db.prepare(`
    INSERT INTO settings (key, value, updated_at) VALUES (@key, @value, datetime('now', 'localtime'))
    ON CONFLICT(key) DO UPDATE SET value = @value, updated_at = datetime('now', 'localtime')
  `).run({ key, value });
}

export function getAllSettings(): Record<string, string> {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}
