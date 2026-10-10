import React, { useEffect, useState } from 'react';
import {
  Menu,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Cloud,
  LogOut,
  LogIn,
  User as UserIcon,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { NavigationTab, ServerStatus } from '../../types';
import { FirebaseUser } from '../../lib/firebase';

interface HeaderProps {
  currentTab: NavigationTab;
  onOpenMobileSidebar: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigate: (tab: NavigationTab) => void;
  currentUser: FirebaseUser | null;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
  onOpenShareModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenMobileSidebar,
  isDarkMode,
  onToggleDarkMode,
  onNavigate,
  currentUser,
  onSignInWithGoogle,
  onSignOut,
  onOpenShareModal,
}) => {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/gemini/status')
      .then((res) => res.json())
      .then((data: ServerStatus) => {
        if (isMounted) {
          setServerStatus(data);
          setIsChecking(false);
        }
      })
      .catch((err) => {
        console.error('Failed to verify Gemini status:', err);
        if (isMounted) {
          setServerStatus({
            status: 'error',
            hasKey: false,
            model: 'gemini-3.8-flash',
            app: 'StudyGenius AI',
            version: '1.0.0',
          });
          setIsChecking(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getTabTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'dashboard':
        return {
          title: 'Academic Performance Dashboard',
          subtitle: 'Real-time learning metrics, study hours, quiz mastery & upcoming targets',
        };
      case 'assistant':
        return {
          title: 'AI Academic Assistant & Science Copilot',
          subtitle: 'Multi-turn tutor with Google Search Grounding & DeepMind Science Skills',
        };
      case 'notes':
        return {
          title: 'AI Smart Notes Generator',
          subtitle: 'Synthesize comprehensive notes with search grounding & visual study diagrams',
        };
      case 'library':
        return {
          title: 'Course Notes Library',
          subtitle: 'Cloud-synced repository of your generated notes, summaries, and revisions',
        };
      case 'quiz':
        return {
          title: 'AI Adaptive Quiz Arena',
          subtitle: 'Fast multiple-choice testing with instant reasoning & mastery grading',
        };
      case 'flashcards':
        return {
          title: 'Spaced-Repetition Flashcards',
          subtitle: 'Active recall training with 3D cards and AI deck synthesis',
        };
      case 'planner':
        return {
          title: 'Semester Study Planner',
          subtitle: 'Keep assignments, exam deadlines, and daily revision on track',
        };
      default:
        return {
          title: 'StudyGenius AI',
          subtitle: 'College semester study portal',
        };
    }
  };

  const { title, subtitle } = getTabTitle(currentTab);

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
        {/* Left: Mobile Toggle & View Titles */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden"
            aria-label="Open navigation sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {title}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: API Status, Auth & Cloud Sync */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Firestore Cloud Sync Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
            <Cloud className="w-3.5 h-3.5 text-indigo-500" />
            <span>{currentUser ? 'Firestore Synced' : 'Guest Mode (Local)'}</span>
          </div>

          {/* Quick Action Button */}
          {currentTab !== 'assistant' && (
            <button
              onClick={() => onNavigate('assistant')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Ask AI
            </button>
          )}

          {/* Share Public Website Button */}
          <button
            onClick={onOpenShareModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80 transition-colors"
            title="Get shareable public website link (without Gemini chat on left)"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Share Web Link</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle color theme"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          {/* User Auth Pill / Google Sign-in */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-8 h-8 rounded-full border border-indigo-400 shadow-xs object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                </div>
              )}
              <div className="hidden xl:block text-left">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight truncate max-w-[120px]">
                  {currentUser.displayName || 'Authenticated User'}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Firebase Verified
                </div>
              </div>
              <button
                onClick={onSignOut}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Sign out of Firebase"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignInWithGoogle}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-xs transition-all active:scale-95"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
