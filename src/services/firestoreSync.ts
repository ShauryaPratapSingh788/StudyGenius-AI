import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { StudyNote, Flashcard, StudyTask, QuizResult } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Sync Notes
export async function syncNotesToCloud(userId: string, notes: StudyNote[]) {
  const path = `users/${userId}/notes`;
  try {
    const batch = writeBatch(db);
    for (const note of notes) {
      const ref = doc(db, 'users', userId, 'notes', note.id);
      batch.set(ref, note, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchNotesFromCloud(userId: string): Promise<StudyNote[]> {
  const path = `users/${userId}/notes`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'notes'));
    const list: StudyNote[] = [];
    snap.forEach((d) => list.push(d.data() as StudyNote));
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

// Sync Flashcards
export async function syncFlashcardsToCloud(userId: string, cards: Flashcard[]) {
  const path = `users/${userId}/flashcards`;
  try {
    const batch = writeBatch(db);
    for (const card of cards) {
      const ref = doc(db, 'users', userId, 'flashcards', card.id);
      batch.set(ref, card, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchFlashcardsFromCloud(userId: string): Promise<Flashcard[]> {
  const path = `users/${userId}/flashcards`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'flashcards'));
    const list: Flashcard[] = [];
    snap.forEach((d) => list.push(d.data() as Flashcard));
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

// Sync Tasks
export async function syncTasksToCloud(userId: string, tasks: StudyTask[]) {
  const path = `users/${userId}/tasks`;
  try {
    const batch = writeBatch(db);
    for (const task of tasks) {
      const ref = doc(db, 'users', userId, 'tasks', task.id);
      batch.set(ref, task, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchTasksFromCloud(userId: string): Promise<StudyTask[]> {
  const path = `users/${userId}/tasks`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'tasks'));
    const list: StudyTask[] = [];
    snap.forEach((d) => list.push(d.data() as StudyTask));
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

// Sync Quizzes
export async function syncQuizzesToCloud(userId: string, quizzes: QuizResult[]) {
  const path = `users/${userId}/quizzes`;
  try {
    const batch = writeBatch(db);
    for (const q of quizzes) {
      const ref = doc(db, 'users', userId, 'quizzes', q.id);
      batch.set(ref, q, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchQuizzesFromCloud(userId: string): Promise<QuizResult[]> {
  const path = `users/${userId}/quizzes`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'quizzes'));
    const list: QuizResult[] = [];
    snap.forEach((d) => list.push(d.data() as QuizResult));
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}
