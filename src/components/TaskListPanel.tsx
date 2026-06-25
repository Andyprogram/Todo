import { useState, useRef, useEffect } from 'react';
import type { Task, TaskList } from '../types';

interface TaskListPanelProps {
  title: string;
  titleColor: string;
  tasks: Task[];
  lists: TaskList[];
  selectedTaskId: string | null;
  selectedListId: string | null;
  isSearching: boolean;
  onToggleComplete: (taskId: string) => void;
  onToggleImportant: (taskId: string) => void;
  onSelectTask: (taskId: string) => void;
  onCreateTask: (title: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskListPanel({
  title,
  titleColor,
  tasks,
  lists,
  selectedTaskId,
  selectedListId,
  isSearching,
  onToggleComplete,
  onToggleImportant,
  onSelectTask,
  onCreateTask,
  onDeleteTask,
}: TaskListPanelProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  const handleCreateTask = () => {
    if (newTaskTitle.trim()) {
      onCreateTask(newTaskTitle.trim());
      setNewTaskTitle('');
      setShowInput(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateTask();
    } else if (e.key === 'Escape') {
      setShowInput(false);
      setNewTaskTitle('');
    }
  };

  const incompleteTasks = tasks.filter(t => !t.is_completed);
  const completedTasks = tasks.filter(t => t.is_completed);
  const [showCompleted, setShowCompleted] = useState(true);

  const formatDueDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly.getTime() === today.getTime()) return '今天';
    if (dateOnly.getTime() === tomorrow.getTime()) return '明天';
    if (dateOnly < today) return '已过期';

    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  };

  const getDueDateColor = (dateStr: string | null): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly < today) return 'text-red-500 dark:text-red-400';
    if (dateOnly.getTime() === today.getTime()) return 'text-primary-600 dark:text-primary-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const getListName = (listId: string): string => {
    const list = lists.find(l => l.id === listId);
    return list?.name || '';
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* 标题栏 */}
      <div className="h-14 flex items-center px-6 titlebar-drag border-b border-gray-100 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <h1 className="text-2xl font-bold titlebar-no-drag" style={{ color: titleColor }}>
          {title}
        </h1>
        <span className="ml-3 text-base text-gray-400 dark:text-gray-500 titlebar-no-drag">
          {incompleteTasks.length} 项任务
        </span>
      </div>

      {/* 添加任务按钮/输入框 */}
      <div className="px-4 pt-4 titlebar-no-drag">
        {!showInput ? (
          <button
            className="w-full flex items-center gap-2 px-4 py-2.5 text-base text-primary-600 dark:text-primary-400 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
            onClick={() => setShowInput(true)}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>添加任务</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
            <div className="w-5 h-5 rounded-full border-2 border-primary-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="输入任务名称"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newTaskTitle.trim()) {
                  setShowInput(false);
                }
              }}
              className="flex-1 text-base outline-none bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button
              className="px-4 py-1.5 text-sm bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 transition-colors"
              onClick={handleCreateTask}
              disabled={!newTaskTitle.trim()}
            >
              添加
            </button>
          </div>
        )}
      </div>

      {/* 任务列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-2 titlebar-no-drag">
        {incompleteTasks.length === 0 && completedTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500">
            <svg className="w-20 h-20 mb-4 text-gray-200 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-base">暂无任务</p>
            <p className="text-sm mt-1">点击上方按钮添加新任务</p>
          </div>
        )}

        {incompleteTasks.map(task => (
          <div
            key={task.id}
            className={`group flex items-start gap-3 p-3.5 bg-white dark:bg-gray-800 rounded-lg mb-1 cursor-pointer transition-all hover:shadow-sm ${
              selectedTaskId === task.id ? 'ring-2 ring-primary-300 dark:ring-primary-600 shadow-sm' : ''
            }`}
            onClick={() => onSelectTask(task.id)}
          >
            {/* 完成复选框 */}
            <button
              className={`task-checkbox ${task.is_important ? 'important' : 'unchecked'} flex-shrink-0 mt-0.5`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(task.id);
              }}
              title="标记完成"
            >
              {task.is_completed ? (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : task.is_important ? (
                <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ) : null}
            </button>

            {/* 任务内容 */}
            <div className="flex-1 min-w-0">
              <div className="text-base text-gray-800 dark:text-gray-200 truncate">{task.title}</div>
              <div className="flex items-center gap-2 mt-0.5">
                {task.due_date && (
                  <span className={`text-sm ${getDueDateColor(task.due_date)}`}>
                    {formatDueDate(task.due_date)}
                  </span>
                )}
                {task.repeat_type && (
                  <span className="text-sm text-gray-400 dark:text-gray-500">🔄</span>
                )}
                {isSearching && (
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    {getListName(task.list_id)}
                  </span>
                )}
              </div>
            </div>

            {/* 重要按钮 */}
            <button
              className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                task.is_important
                  ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'text-gray-300 dark:text-gray-600 hover:text-gray-400 dark:hover:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleImportant(task.id);
              }}
              title={task.is_important ? '取消重要' : '标记重要'}
            >
              <svg className="w-5 h-5" fill={task.is_important ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          </div>
        ))}

        {/* 已完成任务 */}
        {completedTasks.length > 0 && (
          <div className="mt-4">
            <button
              className="flex items-center gap-2 px-2 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              <svg className={`w-4 h-4 transition-transform ${showCompleted ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              已完成 ({completedTasks.length})
            </button>

            {showCompleted && completedTasks.map(task => (
              <div
                key={task.id}
                className={`group flex items-start gap-3 p-3.5 bg-white/50 dark:bg-gray-800/50 rounded-lg mb-1 cursor-pointer transition-all hover:bg-white dark:hover:bg-gray-800 ${
                  selectedTaskId === task.id ? 'ring-2 ring-primary-300 dark:ring-primary-600' : ''
                }`}
                onClick={() => onSelectTask(task.id)}
              >
                <button
                  className="task-checkbox checked flex-shrink-0 mt-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComplete(task.id);
                  }}
                  title="取消完成"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </button>

                <div className="flex-1 min-w-0">
                  <div className="text-base text-gray-400 dark:text-gray-500 line-through truncate">{task.title}</div>
                </div>

                <button
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-full text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('确定删除此任务吗？')) {
                      onDeleteTask(task.id);
                    }
                  }}
                  title="删除任务"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
