import React from 'react';
import {
  LayoutDashboard,
  Bot,
  FileText,
  BookOpen,
  Award,
  Layers,
  CalendarCheck,
  Flame,
  Sun,
  Moon,
  Info,
  GraduationCap,
  Sparkles,
  ChevronRight,
  X,
  Share2
} from 'lucide-react';
import { NavigationTab } from '../../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenVivaModal: () => void;
  onOpenShareModal: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  pendingTasksCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isDarkMode,
  onToggleDarkMode,
  onOpenVivaModal,
  onOpenShareModal,
  isMobileOpen,
  onCloseMobile,
  pendingTasksCount,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Progress Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'assistant' as NavigationTab,
      label: 'AI Study Assistant',
      icon: Bot,
      badge: 'Gemini 3.8',
    },
    {
      id: 'notes' as NavigationTab,
      label: 'AI Notes Generator',
      icon: FileText,
      badge: 'Auto',
    },
    {
      id: 'library' as NavigationTab,
      label: 'Notes Library',
      icon: BookOpen,
      badge: null,
    },
    {
      id: 'quiz' as NavigationTab,
      label: 'AI Quiz Arena',
      icon: Award,
      badge: 'MCQ',
    },
    {
      id: 'flashcards' as NavigationTab,
      label: 'Flashcard Hub',
      icon: Layers,
      badge: null,
    },
    {
      id: 'planner' as NavigationTab,
      label: 'Study Planner',
      icon: CalendarCheck,
      badge: pendingTasksCount > 0 ? String(pendingTasksCount) : null,
    },
  ];

  const handleSelect = (tab: NavigationTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-72 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-300 bg-clip-text text-transparent">
                  StudyGenius
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                Academic Copilot
              </p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Study Workspace
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25 dark:bg-indigo-600 dark:text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'Gemini 3.8'
                        ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                        : 'bg-indigo-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Streak Widget */}
          <div className="pt-4 px-1">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-200/50 dark:border-amber-900/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-orange-500 text-white">
                    <Flame className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      5-Day Study Streak
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Keep momentum going!
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <span
                    key={i}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      i < 5
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Footer Area: Share Link + Viva Guide + Theme Toggle */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
          {/* Share Public Website Button */}
          <button
            onClick={() => {
              onCloseMobile();
              onOpenShareModal();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60 transition-colors text-left group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                <Share2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  Share Public Website
                </div>
                <div className="text-[10px] text-indigo-600/80 dark:text-indigo-400">
                  Direct link without dev panel
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Viva Architecture helper button */}
          <button
            onClick={onOpenVivaModal}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 transition-colors text-left group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Info className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Semester Viva Guide
                </div>
                <div className="text-[10px] text-slate-400">
                  Project Tech Architecture
                </div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Theme Switcher */}
          <div className="flex items-center justify-between px-2 pt-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Mode
            </span>
            <button
              onClick={onToggleDarkMode}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium text-[11px] transition-colors"
              title="Toggle Light / Dark mode"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Light
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" /> Dark
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
