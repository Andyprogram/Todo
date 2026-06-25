import { useState } from 'react';
import type { TaskList, SmartView } from '../types';

interface SmartViewDef {
  key: SmartView;
  label: string;
  icon: string;
  color: string;
}

interface SidebarProps {
  lists: TaskList[];
  smartViews: SmartViewDef[];
  selectedSmartView: SmartView | null;
  selectedListId: string | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectSmartView: (view: SmartView) => void;
  onSelectList: (listId: string) => void;
  onCreateList: (name: string, color: string, icon: string) => void;
  onDeleteList: (id: string) => void;
  onUpdateList: (id: string, data: Partial<Pick<TaskList, 'name' | 'color' | 'icon'>>) => void;
  searchQuery: string;
  onSearch: (query: string) => void;
  onOpenSettings: () => void;
}

const LIST_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1',
];

const LIST_ICONS = ['📋', '💼', '📚', '🎯', '💡', '🛒', '🏠', '🎮', '🎵', '💪'];

export default function Sidebar({
  lists,
  smartViews,
  selectedSmartView,
  selectedListId,
  collapsed,
  onToggleCollapse,
  onSelectSmartView,
  onSelectList,
  onCreateList,
  onDeleteList,
  searchQuery,
  onSearch,
  onOpenSettings,
}: SidebarProps) {
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState('#3b82f6');
  const [newListIcon, setNewListIcon] = useState('📋');
  const [showIcons, setShowIcons] = useState(false);

  const handleCreateList = () => {
    if (newListName.trim()) {
      onCreateList(newListName.trim(), newListColor, newListIcon);
      setNewListName('');
      setNewListColor('#3b82f6');
      setNewListIcon('📋');
      setIsCreatingList(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateList();
    } else if (e.key === 'Escape') {
      setIsCreatingList(false);
      setNewListName('');
    }
  };

  if (collapsed) {
    return (
      <div className="w-14 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-2 titlebar-drag">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 titlebar-no-drag"
          onClick={onToggleCollapse}
          title="展开侧栏"
        >
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex-1 flex flex-col items-center gap-1 mt-4 titlebar-no-drag">
          {smartViews.map(view => (
            <button
              key={view.key}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-lg"
              onClick={() => onSelectSmartView(view.key)}
              title={view.label}
            >
              {view.icon}
            </button>
          ))}
          <div className="w-6 border-t border-gray-200 dark:border-gray-700 my-2" />
          {lists.map(list => (
            <button
              key={list.id}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-lg"
              onClick={() => onSelectList(list.id)}
              title={list.name}
            >
              {list.icon}
            </button>
          ))}
        </div>
        <button
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 titlebar-no-drag mt-2"
          onClick={onOpenSettings}
          title="设置"
        >
          <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col no-select transition-colors duration-200">
      {/* 标题栏占位 */}
      <div className="h-9 titlebar-drag flex items-center px-4">
        <span className="text-xs text-gray-400 dark:text-gray-500 titlebar-no-drag">Todo</span>
      </div>

      {/* 搜索框 */}
      <div className="px-3 mb-2 titlebar-no-drag">
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="搜索任务"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-base bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg outline-none focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-primary-300 transition-all"
          />
        </div>
      </div>

      {/* 折叠按钮 */}
      <div className="px-3 mb-1 titlebar-no-drag">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={onToggleCollapse}
          title="收起侧栏"
        >
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* 智能视图 */}
      <div className="px-2 titlebar-no-drag">
        {smartViews.map(view => (
          <button
            key={view.key}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              selectedSmartView === view.key
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
            onClick={() => onSelectSmartView(view.key)}
          >
            <span className="text-base">{view.icon}</span>
            <span>{view.label}</span>
          </button>
        ))}
      </div>

      {/* 分隔线 */}
      <div className="mx-4 my-2 border-t border-gray-100 dark:border-gray-700" />

      {/* 列表标题 */}
      <div className="px-4 py-1 flex items-center justify-between titlebar-no-drag">
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">我的列表</span>
        <button
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => setIsCreatingList(true)}
          title="新建列表"
        >
          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* 列表项 */}
      <div className="flex-1 overflow-y-auto px-2 titlebar-no-drag">
        {lists.map(list => (
          <div
            key={list.id}
            className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
              selectedListId === list.id
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
            onClick={() => onSelectList(list.id)}
          >
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: list.color }}
            />
            <span className="flex-1 truncate">{list.name}</span>
            <button
              className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`确定删除列表「${list.name}」及其所有任务吗？`)) {
                  onDeleteList(list.id);
                }
              }}
              title="删除列表"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        {/* 新建列表表单 */}
        {isCreatingList && (
          <div className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg mt-1 animate-fade-in">
            <input
              type="text"
              placeholder="列表名称"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-md outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-200"
              autoFocus
            />
            <div className="mt-2 flex items-center gap-1.5">
              {LIST_COLORS.map(color => (
                <button
                  key={color}
                  className={`w-5 h-5 rounded-full border-2 transition-transform ${
                    newListColor === color ? 'scale-125 border-gray-600 dark:border-gray-300' : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewListColor(color)}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center gap-1 relative">
              <button
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                onClick={() => setShowIcons(!showIcons)}
                title="选择图标"
              >
                {newListIcon}
              </button>
              {showIcons && (
                <div className="absolute top-8 left-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 z-50">
                  {LIST_ICONS.map(icon => (
                    <button
                      key={icon}
                      className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-lg ${
                        newListIcon === icon ? 'bg-primary-50 dark:bg-primary-900/30 ring-1 ring-primary-300' : ''
                      }`}
                      onClick={() => {
                        setNewListIcon(icon);
                        setShowIcons(false);
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex-1" />
              <button
                className="px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={() => {
                  setIsCreatingList(false);
                  setNewListName('');
                }}
              >
                取消
              </button>
              <button
                className="px-3 py-1.5 text-sm bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
                onClick={handleCreateList}
                disabled={!newListName.trim()}
              >
                创建
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 底部设置按钮 */}
      <div className="px-2 py-2 border-t border-gray-100 dark:border-gray-700 titlebar-no-drag">
        <button
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          onClick={onOpenSettings}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>设置</span>
        </button>
      </div>
    </div>
  );
}
