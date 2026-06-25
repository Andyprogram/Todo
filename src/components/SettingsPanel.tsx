import { useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface SettingsPanelProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  onClose: () => void;
}

const THEME_OPTIONS: { value: Theme; label: string; icon: string; desc: string }[] = [
  { value: 'light', label: '明亮', icon: '☀️', desc: '始终使用明亮主题' },
  { value: 'dark', label: '黑暗', icon: '🌙', desc: '始终使用黑暗主题' },
  { value: 'system', label: '跟随系统', icon: '💻', desc: '自动匹配系统设置' },
];

export default function SettingsPanel({ currentTheme, onThemeChange, onClose }: SettingsPanelProps) {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(currentTheme);

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme);
    onThemeChange(theme);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in" onClick={onClose}>
      <div
        className="w-[420px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">设置</h2>
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            onClick={onClose}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 主题设置 */}
        <div className="px-6 py-5">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">界面风格</h3>
          <div className="space-y-2">
            {THEME_OPTIONS.map(option => (
              <button
                key={option.value}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  selectedTheme === option.value
                    ? 'bg-primary-50 dark:bg-primary-900/30 ring-2 ring-primary-400 dark:ring-primary-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
                onClick={() => handleThemeChange(option.value)}
              >
                <span className="text-2xl">{option.icon}</span>
                <div className="text-left">
                  <div className={`text-sm font-medium ${
                    selectedTheme === option.value
                      ? 'text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-200'
                  }`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">{option.desc}</div>
                </div>
                {selectedTheme === option.value && (
                  <svg className="w-5 h-5 ml-auto text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 预览区域 */}
        <div className="px-6 pb-5">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">预览</h3>
          <div className={`rounded-xl border overflow-hidden ${
            selectedTheme === 'dark'
              ? 'bg-gray-900 border-gray-700'
              : 'bg-white border-gray-200'
          }`}>
            {/* 模拟任务卡片 */}
            <div className={`p-3 border-b ${
              selectedTheme === 'dark' ? 'border-gray-700' : 'border-gray-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 ${
                  selectedTheme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                }`} />
                <span className={`text-sm ${
                  selectedTheme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                }`}>完成项目报告</span>
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-primary-500 bg-primary-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className={`text-sm line-through ${
                  selectedTheme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>整理会议记录</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
