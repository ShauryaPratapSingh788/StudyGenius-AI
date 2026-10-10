/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { VivaHelperModal } from './components/common/VivaHelperModal';
import { ShareModal } from './components/common/ShareModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { AssistantView } from './components/assistant/AssistantView';
import { NotesGeneratorView } from './components/notes/NotesGeneratorView';
import { NotesLibraryView } from './components/notes/NotesLibraryView';
import { QuizArenaView } from './components/quiz/QuizArenaView';
import { FlashcardsView } from './components/flashcards/FlashcardsView';
import { StudyPlannerView } from './components/planner/StudyPlannerView';
import {
  NavigationTab,
  StudyNote,
  Flashcard,
  StudyTask,
  QuizResult,
  ChatMessage,
  DailyStudyMetric
} from './types';
import {
  getStoredNotes,
  saveStoredNotes,
  getStoredFlashcards,
  saveStoredFlashcards,
  getStoredTasks,
  saveStoredTasks,
  getStoredQuizHistory,
  saveStoredQuizHistory,
  getStoredChatHistory,
  saveStoredChatHistory,
  getStoredDarkMode,
  saveStoredDarkMode
} from './utils/storage';
import { WEEKLY_STUDY_METRICS } from './data/initialData';
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  logoutUser,
  testFirestoreConnection,
  FirebaseUser
} from './lib/firebase';
import {
  syncNotesToCloud,
  fetchNotesFromCloud,
  syncFlashcardsToCloud,
  fetchFlashcardsFromCloud,
  syncTasksToCloud,
  fetchTasksFromCloud,
  syncQuizzesToCloud,
  fetchQuizzesFromCloud
} from './services/firestoreSync';

export default function App() {
  // Navigation & UI States
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isVivaModalOpen, setIsVivaModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(getStoredDarkMode);

  // Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Core Persistent State
  const [notes, setNotes] = useState<StudyNote[]>(getStoredNotes);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(getStoredFlashcards);
  const [tasks, setTasks] = useState<StudyTask[]>(getStoredTasks);
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>(getStoredQuizHistory);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(getStoredChatHistory);
  const [weeklyMetrics, setWeeklyMetrics] = useState<DailyStudyMetric[]>(WEEKLY_STUDY_METRICS);

  // Cross-component transition state (e.g. Note -> Flashcards)
  const [targetFlashcardTopic, setTargetFlashcardTopic] = useState<{ subject: string; topic: string } | null>(null);

  // Test Firestore connection on boot (Skill requirement)
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Listen to Auth state changes and sync with Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Fetch user data from Cloud Firestore
          const [cloudNotes, cloudFlashcards, cloudTasks, cloudQuizzes] = await Promise.all([
            fetchNotesFromCloud(user.uid),
            fetchFlashcardsFromCloud(user.uid),
            fetchTasksFromCloud(user.uid),
            fetchQuizzesFromCloud(user.uid),
          ]);

          if (cloudNotes.length > 0) {
            setNotes(cloudNotes);
            saveStoredNotes(cloudNotes);
          } else if (notes.length > 0) {
            syncNotesToCloud(user.uid, notes);
          }

          if (cloudFlashcards.length > 0) {
            setFlashcards(cloudFlashcards);
            saveStoredFlashcards(cloudFlashcards);
          } else if (flashcards.length > 0) {
            syncFlashcardsToCloud(user.uid, flashcards);
          }

          if (cloudTasks.length > 0) {
            setTasks(cloudTasks);
            saveStoredTasks(cloudTasks);
          } else if (tasks.length > 0) {
            syncTasksToCloud(user.uid, tasks);
          }

          if (cloudQuizzes.length > 0) {
            setQuizHistory(cloudQuizzes);
            saveStoredQuizHistory(cloudQuizzes);
          } else if (quizHistory.length > 0) {
            syncQuizzesToCloud(user.uid, quizHistory);
          }
        } catch (e) {
          console.error('Error synchronizing with Firestore:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync theme with DOM
  useEffect(() => {
    saveStoredDarkMode(isDarkMode);
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign In failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Sign Out failed:', err);
    }
  };

  // State handlers with automatic cloud backup if authenticated
  const handleSaveNewNote = (newNote: StudyNote) => {
    const updated = [newNote, ...notes];
    setNotes(updated);
    saveStoredNotes(updated);
    if (currentUser) {
      syncNotesToCloud(currentUser.uid, updated);
    }
  };

  const handleUpdateNote = (updatedNote: StudyNote) => {
    const updated = notes.map((n) => (n.id === updatedNote.id ? updatedNote : n));
    setNotes(updated);
    saveStoredNotes(updated);
    if (currentUser) {
      syncNotesToCloud(currentUser.uid, updated);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    const updated = notes.filter((n) => n.id !== noteId);
    setNotes(updated);
    saveStoredNotes(updated);
    if (currentUser) {
      syncNotesToCloud(currentUser.uid, updated);
    }
  };

  const handleSaveFlashcards = (updatedCards: Flashcard[]) => {
    setFlashcards(updatedCards);
    saveStoredFlashcards(updatedCards);
    if (currentUser) {
      syncFlashcardsToCloud(currentUser.uid, updatedCards);
    }
  };

  const handleSaveTasks = (updatedTasks: StudyTask[]) => {
    setTasks(updatedTasks);
    saveStoredTasks(updatedTasks);
    if (currentUser) {
      syncTasksToCloud(currentUser.uid, updatedTasks);
    }
  };

  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    setTasks(updated);
    saveStoredTasks(updated);
    if (currentUser) {
      syncTasksToCloud(currentUser.uid, updated);
    }
  };

  const handleSaveQuizResult = (result: QuizResult) => {
    const updated = [result, ...quizHistory];
    setQuizHistory(updated);
    saveStoredQuizHistory(updated);
    if (currentUser) {
      syncQuizzesToCloud(currentUser.uid, updated);
    }

    // Update today's quiz count metric
    setWeeklyMetrics((prev) => {
      const copy = [...prev];
      const todayMetric = copy[copy.length - 1];
      if (todayMetric) {
        todayMetric.quizzesTaken += 1;
      }
      return copy;
    });
  };

  const handleSaveChatHistory = (messages: ChatMessage[]) => {
    setChatHistory(messages);
    saveStoredChatHistory(messages);
  };

  const handleGenerateFlashcardsFromNote = (subject: string, topic: string) => {
    setTargetFlashcardTopic({ subject, topic });
    setCurrentTab('flashcards');
  };

  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col md:flex-row font-sans`}>
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenVivaModal={() => setIsVivaModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        pendingTasksCount={pendingTasksCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onNavigate={setCurrentTab}
          currentUser={currentUser}
          onSignInWithGoogle={handleSignIn}
          onSignOut={handleSignOut}
          onOpenShareModal={() => setIsShareModalOpen(true)}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              onToggleTask={handleToggleTask}
              quizHistory={quizHistory}
              notes={notes}
              flashcards={flashcards}
              weeklyMetrics={weeklyMetrics}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'assistant' && (
            <AssistantView
              chatHistory={chatHistory}
              onSaveChatHistory={handleSaveChatHistory}
            />
          )}

          {currentTab === 'notes' && (
            <NotesGeneratorView
              onSaveNote={handleSaveNewNote}
              onNavigate={setCurrentTab}
              onGenerateFlashcardsFromNote={handleGenerateFlashcardsFromNote}
            />
          )}

          {currentTab === 'library' && (
            <NotesLibraryView
              notes={notes}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onNavigate={setCurrentTab}
              onGenerateFlashcards={handleGenerateFlashcardsFromNote}
            />
          )}

          {currentTab === 'quiz' && (
            <QuizArenaView
              onSaveQuizResult={handleSaveQuizResult}
              quizHistory={quizHistory}
            />
          )}

          {currentTab === 'flashcards' && (
            <FlashcardsView
              flashcards={flashcards}
              onSaveFlashcards={handleSaveFlashcards}
              initialTopic={targetFlashcardTopic}
            />
          )}

          {currentTab === 'planner' && (
            <StudyPlannerView
              tasks={tasks}
              onSaveTasks={handleSaveTasks}
            />
          )}
        </main>
      </div>

      {/* College Semester Project Viva Helper Modal */}
      <VivaHelperModal
        isOpen={isVivaModalOpen}
        onClose={() => setIsVivaModalOpen(false)}
      />

      {/* Public Share & Standalone Website Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
