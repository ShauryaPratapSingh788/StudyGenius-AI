import { StudyNote, Flashcard, StudyTask, QuizResult, ChatMessage } from '../types';
import { INITIAL_NOTES, INITIAL_FLASHCARDS, INITIAL_TASKS, INITIAL_QUIZ_HISTORY } from '../data/initialData';

const KEYS = {
  NOTES: 'studygenius_notes',
  FLASHCARDS: 'studygenius_flashcards',
  TASKS: 'studygenius_tasks',
  QUIZ_HISTORY: 'studygenius_quiz_history',
  CHAT_HISTORY: 'studygenius_chat_history',
  DARK_MODE: 'studygenius_dark_mode',
  USER_PROFILE: 'studygenius_user_profile',
};

export const getStoredNotes = (): StudyNote[] => {
  try {
    const raw = localStorage.getItem(KEYS.NOTES);
    if (!raw) {
      localStorage.setItem(KEYS.NOTES, JSON.stringify(INITIAL_NOTES));
      return INITIAL_NOTES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_NOTES;
  }
};

export const saveStoredNotes = (notes: StudyNote[]) => {
  try {
    localStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
  } catch (err) {
    console.error('Error saving notes to localStorage', err);
  }
};

export const getStoredFlashcards = (): Flashcard[] => {
  try {
    const raw = localStorage.getItem(KEYS.FLASHCARDS);
    if (!raw) {
      localStorage.setItem(KEYS.FLASHCARDS, JSON.stringify(INITIAL_FLASHCARDS));
      return INITIAL_FLASHCARDS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_FLASHCARDS;
  }
};

export const saveStoredFlashcards = (cards: Flashcard[]) => {
  try {
    localStorage.setItem(KEYS.FLASHCARDS, JSON.stringify(cards));
  } catch (err) {
    console.error('Error saving flashcards to localStorage', err);
  }
};

export const getStoredTasks = (): StudyTask[] => {
  try {
    const raw = localStorage.getItem(KEYS.TASKS);
    if (!raw) {
      localStorage.setItem(KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
      return INITIAL_TASKS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TASKS;
  }
};

export const saveStoredTasks = (tasks: StudyTask[]) => {
  try {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Error saving tasks to localStorage', err);
  }
};

export const getStoredQuizHistory = (): QuizResult[] => {
  try {
    const raw = localStorage.getItem(KEYS.QUIZ_HISTORY);
    if (!raw) {
      localStorage.setItem(KEYS.QUIZ_HISTORY, JSON.stringify(INITIAL_QUIZ_HISTORY));
      return INITIAL_QUIZ_HISTORY;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_QUIZ_HISTORY;
  }
};

export const saveStoredQuizHistory = (history: QuizResult[]) => {
  try {
    localStorage.setItem(KEYS.QUIZ_HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error('Error saving quiz history to localStorage', err);
  }
};

export const getStoredChatHistory = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(KEYS.CHAT_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredChatHistory = (messages: ChatMessage[]) => {
  try {
    localStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(messages));
  } catch (err) {
    console.error('Error saving chat history to localStorage', err);
  }
};

export const getStoredDarkMode = (): boolean => {
  try {
    const raw = localStorage.getItem(KEYS.DARK_MODE);
    if (raw !== null) {
      return raw === 'true';
    }
    // Default to dark mode for a modern sleek AI SaaS aesthetic
    return true;
  } catch {
    return true;
  }
};

export const saveStoredDarkMode = (isDark: boolean) => {
  try {
    localStorage.setItem(KEYS.DARK_MODE, String(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (err) {
    console.error('Error saving dark mode', err);
  }
};
