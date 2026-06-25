import { useState, useEffect, useCallback } from 'react';
import type { TaskList, Task, Step, SmartView } from './types';
import Sidebar from './components/Sidebar';
import TaskListPanel from './components/TaskListPanel';
import TaskDetailPanel from './components/TaskDetailPanel';
import SettingsPanel from './components/SettingsPanel';

type Theme = 'light' | 'dark' | 'system';

const SMART_VIEWS: { key: SmartView; label: string; icon: string; color: string }[] = [
  { key: 'myday', label: '我的一天', icon: '☀️', color: '#f59e0b' },
  { key: 'important', label: '重要', icon: '⭐', color: '#ef4444' },
  { key: 'planned', label: '计划内', icon: '📅', color: '#8b5cf6' },
  { key: 'all', label: '全部', icon: '🏠', color: '#3b82f6' },
  { key: 'completed', label: '已完成', icon: '✅', color: '#10b981' },
];

function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

export default function App() {
  const [lists, setLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [selectedSmartView, setSelectedSmartView] = useState<SmartView>('myday');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const [showSettings, setShowSettings] = useState(false);

  const api = window.todoAPI;

  // 应用主题到 DOM 并更新标题栏
  const applyTheme = useCallback((t: Theme) => {
    const effective = getEffectiveTheme(t);
    if (effective === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // 同步更新 Electron 标题栏按钮颜色
    api.updateTitleBar(effective);
  }, [api]);

  // 加载主题设置
  useEffect(() => {
    api.getSetting('theme').then((savedTheme) => {
      const t = (savedTheme as Theme) || 'light';
      setTheme(t);
      applyTheme(t);
    });
  }, [api, applyTheme]);

  // 监听系统主题变化（当选择 system 时）
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme, applyTheme]);

  // 主题切换处理
  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    await api.setSetting('theme', newTheme);
  };

  // 加载列表
  const loadLists = useCallback(async () => {
    const result = await api.getLists();
    setLists(result);
  }, [api]);

  // 加载任务
  const loadTasks = useCallback(async () => {
    if (isSearching && searchQuery.trim()) {
      const result = await api.searchTasks(searchQuery);
      setTasks(result);
    } else if (selectedSmartView) {
      const result = await api.getTasksBySmartView(selectedSmartView);
      setTasks(result);
    } else if (selectedListId) {
      const result = await api.getTasksByList(selectedListId);
      setTasks(result);
    }
  }, [api, selectedListId, selectedSmartView, isSearching, searchQuery]);

  // 加载子步骤
  const loadSteps = useCallback(async () => {
    if (selectedTaskId) {
      const result = await api.getSteps(selectedTaskId);
      setSteps(result);
    } else {
      setSteps([]);
    }
  }, [api, selectedTaskId]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    loadSteps();
  }, [loadSteps]);

  // 选择智能视图
  const handleSelectSmartView = (view: SmartView) => {
    setSelectedSmartView(view);
    setSelectedListId(null);
    setSelectedTaskId(null);
    setIsSearching(false);
    setSearchQuery('');
  };

  // 选择列表
  const handleSelectList = (listId: string) => {
    setSelectedListId(listId);
    setSelectedSmartView(null);
    setSelectedTaskId(null);
    setIsSearching(false);
    setSearchQuery('');
  };

  // 选择任务
  const handleSelectTask = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  // 搜索
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      const result = await api.searchTasks(query);
      setTasks(result);
    } else {
      setIsSearching(false);
      loadTasks();
    }
  };

  // 创建列表
  const handleCreateList = async (name: string, color: string, icon: string) => {
    await api.createList({ name, color, icon });
    await loadLists();
  };

  // 更新列表
  const handleUpdateList = async (id: string, data: Partial<Pick<TaskList, 'name' | 'color' | 'icon'>>) => {
    await api.updateList(id, data);
    await loadLists();
  };

  // 删除列表
  const handleDeleteList = async (id: string) => {
    await api.deleteList(id);
    if (selectedListId === id) {
      setSelectedListId(null);
      setSelectedSmartView('myday');
    }
    await loadLists();
    await loadTasks();
  };

  // 创建任务
  const handleCreateTask = async (title: string) => {
    const listId = selectedListId || (lists.length > 0 ? lists[0].id : '');
    if (!listId) return;
    await api.createTask({ list_id: listId, title });
    await loadTasks();
  };

  // 切换完成状态
  const handleToggleComplete = async (taskId: string) => {
    await api.toggleTaskComplete(taskId);
    await loadTasks();
    if (selectedTaskId === taskId) {
      await loadSteps();
    }
  };

  // 切换重要状态
  const handleToggleImportant = async (taskId: string) => {
    await api.toggleTaskImportant(taskId);
    await loadTasks();
  };

  // 删除任务
  const handleDeleteTask = async (taskId: string) => {
    await api.deleteTask(taskId);
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
    await loadTasks();
  };

  // 更新任务
  const handleUpdateTask = async (taskId: string, data: Record<string, unknown>) => {
    await api.updateTask(taskId, data);
    await loadTasks();
  };

  // 添加子步骤
  const handleCreateStep = async (taskId: string, title: string) => {
    await api.createStep({ task_id: taskId, title });
    await loadSteps();
  };

  // 切换子步骤完成
  const handleToggleStep = async (stepId: string) => {
    await api.toggleStepComplete(stepId);
    await loadSteps();
  };

  // 删除子步骤
  const handleDeleteStep = async (stepId: string) => {
    await api.deleteStep(stepId);
    await loadSteps();
  };

  // 获取当前视图标题
  const getCurrentTitle = (): { title: string; color: string } => {
    if (isSearching) return { title: `搜索: ${searchQuery}`, color: '#64748b' };
    if (selectedSmartView) {
      const view = SMART_VIEWS.find(v => v.key === selectedSmartView);
      return { title: view?.label || '', color: view?.color || '#3b82f6' };
    }
    if (selectedListId) {
      const list = lists.find(l => l.id === selectedListId);
      return { title: list?.name || '', color: list?.color || '#3b82f6' };
    }
    return { title: '我的一天', color: '#f59e0b' };
  };

  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) || null : null;
  const { title: currentTitle, color: currentColor } = getCurrentTitle();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar
        lists={lists}
        smartViews={SMART_VIEWS}
        selectedSmartView={selectedSmartView}
        selectedListId={selectedListId}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onSelectSmartView={handleSelectSmartView}
        onSelectList={handleSelectList}
        onCreateList={handleCreateList}
        onDeleteList={handleDeleteList}
        onUpdateList={handleUpdateList}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onOpenSettings={() => setShowSettings(true)}
      />
      <TaskListPanel
        title={currentTitle}
        titleColor={currentColor}
        tasks={tasks}
        lists={lists}
        selectedTaskId={selectedTaskId}
        selectedListId={selectedListId}
        isSearching={isSearching}
        onToggleComplete={handleToggleComplete}
        onToggleImportant={handleToggleImportant}
        onSelectTask={handleSelectTask}
        onCreateTask={handleCreateTask}
        onDeleteTask={handleDeleteTask}
      />
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          steps={steps}
          lists={lists}
          onUpdateTask={handleUpdateTask}
          onToggleComplete={handleToggleComplete}
          onToggleImportant={handleToggleImportant}
          onDeleteTask={handleDeleteTask}
          onCreateStep={handleCreateStep}
          onToggleStep={handleToggleStep}
          onDeleteStep={handleDeleteStep}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
      {showSettings && (
        <SettingsPanel
          currentTheme={theme}
          onThemeChange={handleThemeChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
