import { useState, useRef, useEffect } from 'react';
import type { Task, Step, TaskList } from '../types';

interface TaskDetailPanelProps {
  task: Task;
  steps: Step[];
  lists: TaskList[];
  onUpdateTask: (taskId: string, data: Record<string, unknown>) => void;
  onToggleComplete: (taskId: string) => void;
  onToggleImportant: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateStep: (taskId: string, title: string) => void;
  onToggleStep: (stepId: string) => void;
  onDeleteStep: (stepId: string) => void;
  onClose: () => void;
}

const REPEAT_OPTIONS = [
  { value: '', label: '不重复' },
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
  { value: 'yearly', label: '每年' },
];

export default function TaskDetailPanel({
  task,
  steps,
  lists,
  onUpdateTask,
  onToggleComplete,
  onToggleImportant,
  onDeleteTask,
  onCreateStep,
  onToggleStep,
  onDeleteStep,
  onClose,
}: TaskDetailPanelProps) {
  const [newStepTitle, setNewStepTitle] = useState('');
  const [showStepInput, setShowStepInput] = useState(false);
  const stepInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task.title);
  const [noteValue, setNoteValue] = useState(task.note);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setTitleValue(task.title);
    setNoteValue(task.note);
  }, [task.id, task.title, task.note]);

  useEffect(() => {
    if (showStepInput && stepInputRef.current) {
      stepInputRef.current.focus();
    }
  }, [showStepInput]);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  const handleTitleBlur = () => {
    setEditingTitle(false);
    if (titleValue.trim() && titleValue !== task.title) {
      onUpdateTask(task.id, { title: titleValue.trim() });
    } else {
      setTitleValue(task.title);
    }
  };

  const handleNoteBlur = () => {
    if (noteValue !== task.note) {
      onUpdateTask(task.id, { note: noteValue });
    }
  };

  const handleDueDateChange = (dateStr: string) => {
    onUpdateTask(task.id, { due_date: dateStr || null });
  };

  const handleRepeatChange = (repeatType: string) => {
    onUpdateTask(task.id, { repeat_type: repeatType || null });
  };

  const handleMoveToList = (listId: string) => {
    onUpdateTask(task.id, { list_id: listId });
  };

  const handleCreateStep = () => {
    if (newStepTitle.trim()) {
      onCreateStep(task.id, newStepTitle.trim());
      setNewStepTitle('');
      setTimeout(() => stepInputRef.current?.focus(), 50);
    }
  };

  const completedSteps = steps.filter(s => s.is_completed);
  const incompleteSteps = steps.filter(s => !s.is_completed);
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedSteps.length / totalSteps) * 100 : 0;

  return (
    <div className="w-[420px] border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col animate-slide-in no-select transition-colors duration-200">
      {/* 头部 */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-gray-100 dark:border-gray-700 titlebar-drag">
        <button
          className="titlebar-no-drag flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1.5 rounded-lg transition-colors"
          onClick={onClose}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>返回</span>
        </button>
        <span className="text-sm text-gray-400 dark:text-gray-500 titlebar-no-drag">任务详情</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 任务标题 + 完成按钮 */}
        <div className="px-6 pt-6 titlebar-no-drag">
          <div className="flex items-start gap-4">
            <button
              className={`task-checkbox-lg ${task.is_completed ? 'checked' : task.is_important ? 'important' : 'unchecked'} flex-shrink-0 mt-0.5`}
              onClick={() => onToggleComplete(task.id)}
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

            {editingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleBlur();
                  if (e.key === 'Escape') {
                    setTitleValue(task.title);
                    setEditingTitle(false);
                  }
                }}
                className="flex-1 text-xl font-semibold outline-none border-b-2 border-primary-300 dark:border-primary-600 bg-transparent text-gray-800 dark:text-gray-100 pb-0.5"
              />
            ) : (
              <h2
                className={`flex-1 text-xl font-semibold cursor-text ${
                  task.is_completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-100'
                }`}
                onClick={() => setEditingTitle(true)}
                title="点击编辑标题"
              >
                {task.title}
              </h2>
            )}
          </div>
        </div>

        {/* 重要 + 删除 */}
        <div className="px-6 mt-4 flex items-center gap-2 titlebar-no-drag">
          <button
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors ${
              task.is_important
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30'
                : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
            onClick={() => onToggleImportant(task.id)}
          >
            <svg className="w-4 h-4" fill={task.is_important ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {task.is_important ? '重要' : '标记重要'}
          </button>

          {!showDeleteConfirm ? (
            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              删除
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-red-500 dark:text-red-400">确定删除？</span>
              <button
                className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => onDeleteTask(task.id)}
              >
                删除
              </button>
              <button
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={() => setShowDeleteConfirm(false)}
              >
                取消
              </button>
            </div>
          )}
        </div>

        {/* 子步骤 */}
        <div className="px-6 mt-6 titlebar-no-drag">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              子步骤 {totalSteps > 0 && `(${completedSteps.length}/${totalSteps})`}
            </h3>
            {!showStepInput && (
              <button
                className="text-sm text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 font-medium"
                onClick={() => setShowStepInput(true)}
              >
                + 添加
              </button>
            )}
          </div>

          {totalSteps > 0 && (
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full mb-3 overflow-hidden">
              <div
                className="h-full bg-primary-400 dark:bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {incompleteSteps.map(step => (
            <div key={step.id} className="flex items-center gap-3 py-2 group">
              <button
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  step.is_completed
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
                }`}
                onClick={() => onToggleStep(step.id)}
              >
                {step.is_completed && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className={`flex-1 text-sm ${step.is_completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                {step.title}
              </span>
              <button
                className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded text-gray-300 dark:text-gray-600 hover:text-red-500 transition-all"
                onClick={() => onDeleteStep(step.id)}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {completedSteps.length > 0 && incompleteSteps.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-700 my-1.5" />
          )}

          {completedSteps.map(step => (
            <div key={step.id} className="flex items-center gap-3 py-2 group">
              <button
                className="w-5 h-5 rounded border-2 bg-primary-500 border-primary-500 flex items-center justify-center flex-shrink-0"
                onClick={() => onToggleStep(step.id)}
              >
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <span className="flex-1 text-sm line-through text-gray-400 dark:text-gray-500">{step.title}</span>
              <button
                className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded text-gray-300 dark:text-gray-600 hover:text-red-500 transition-all"
                onClick={() => onDeleteStep(step.id)}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {showStepInput && (
            <div className="flex items-center gap-3 mt-1">
              <div className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
              <input
                ref={stepInputRef}
                type="text"
                placeholder="添加子步骤"
                value={newStepTitle}
                onChange={(e) => setNewStepTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateStep();
                  if (e.key === 'Escape') {
                    setShowStepInput(false);
                    setNewStepTitle('');
                  }
                }}
                onBlur={() => {
                  if (!newStepTitle.trim()) {
                    setShowStepInput(false);
                  }
                }}
                className="flex-1 text-sm outline-none bg-transparent text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          )}
        </div>

        {/* 到期日 */}
        <div className="px-6 mt-5 titlebar-no-drag">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">到期日</h3>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="date"
              value={task.due_date || ''}
              onChange={(e) => handleDueDateChange(e.target.value)}
              className="text-base text-gray-600 dark:text-gray-300 outline-none bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-primary-400 dark:focus:border-primary-500 transition-colors"
            />
            {task.due_date && (
              <button
                className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => handleDueDateChange('')}
                title="清除日期"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 重复 */}
        <div className="px-6 mt-5 titlebar-no-drag">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">重复</h3>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <select
              value={task.repeat_type || ''}
              onChange={(e) => handleRepeatChange(e.target.value)}
              className="text-base text-gray-600 dark:text-gray-300 outline-none bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-primary-400 dark:focus:border-primary-500 transition-colors cursor-pointer"
            >
              {REPEAT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 移动到列表 */}
        <div className="px-6 mt-5 titlebar-no-drag">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">列表</h3>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <select
              value={task.list_id}
              onChange={(e) => handleMoveToList(e.target.value)}
              className="text-base text-gray-600 dark:text-gray-300 outline-none bg-transparent border-b border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-primary-400 dark:focus:border-primary-500 transition-colors cursor-pointer"
            >
              {lists.map(list => (
                <option key={list.id} value={list.id}>{list.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 备注 */}
        <div className="px-6 mt-6 titlebar-no-drag">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">备注</h3>
          <textarea
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            onBlur={handleNoteBlur}
            placeholder="添加备注..."
            className="w-full min-h-[130px] text-sm text-gray-600 dark:text-gray-300 outline-none resize-y border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-transparent focus:border-primary-300 dark:focus:border-primary-500 focus:ring-1 focus:ring-primary-200 dark:focus:ring-primary-800 transition-all placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* 创建时间 */}
        <div className="px-6 mt-5 mb-5 titlebar-no-drag">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            创建于 {new Date(task.created_at).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
