export type NavigationTab =
  | 'dashboard'
  | 'assistant'
  | 'notes'
  | 'library'
  | 'quiz'
  | 'flashcards'
  | 'planner';

export type TutorMode = 'standard' | 'feynman' | 'socratic' | 'exam' | 'stem' | 'science';

export type ModelTier = 'fast' | 'general' | 'complex';

export interface ProteinData {
  entryId: string;
  gene: string;
  uniprotAccession: string;
  uniprotId: string;
  uniprotDescription: string;
  organism: string;
  sequenceLength: number;
  globalPlddt: number;
  plddtBand: 'Very High' | 'Confident' | 'Low' | 'Very Low';
  cifUrl: string;
  pdbUrl: string;
  paeImageUrl?: string;
  paeDocUrl?: string;
}

export interface CompoundData {
  cid: number;
  name: string;
  molecularFormula: string;
  molecularWeight: string;
  canonicalSmiles: string;
  inChIKey?: string;
  xLogP?: number;
  tpsa?: number;
  hBondDonorCount?: number;
  hBondAcceptorCount?: number;
  complexity?: number;
  imageUrl: string;
}

export interface LiteratureArticle {
  pmid: string;
  title: string;
  authors: string[];
  source: string;
  pubdate: string;
  doi?: string;
  pubmedUrl: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  tutorMode?: TutorMode;
  modelTier?: ModelTier;
  subject?: string;
}

export interface DefinitionItem {
  term: string;
  definition: string;
}

export interface DeepDiveSection {
  heading: string;
  content: string;
  example?: string;
}

export interface StudyNote {
  id: string;
  title: string;
  subject: string;
  topic: string;
  academicLevel: string;
  createdAt: string;
  overview: string;
  definitions: DefinitionItem[];
  keyPoints: string[];
  deepDiveSections: DeepDiveSection[];
  commonExamMistakes?: string[];
  mnemonicOrMemoryHook?: string;
  summaryTakeaways: string[];
  tags?: string[];
  isFavorite?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  conceptTag?: string;
}

export interface Quiz {
  quizTitle: string;
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: QuizQuestion[];
}

export interface QuizResult {
  id: string;
  quizTitle: string;
  subject: string;
  topic: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
  answers: {
    questionIndex: number;
    selectedIndex: number;
    isCorrect: boolean;
  }[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tag?: string;
  deckId: string;
  deckName: string;
  subject: string;
  reviewStatus: 'new' | 'learning' | 'mastered';
  lastReviewed?: string;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  subject: string;
  description?: string;
  cardCount: number;
  masteredCount: number;
}

export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  priority: TaskPriority;
  completed: boolean;
  completedAt?: string;
  notes?: string;
}

export interface DailyStudyMetric {
  day: string; // e.g. 'Mon', 'Tue'
  date: string;
  hours: number;
  tasksCompleted: number;
  quizzesTaken: number;
}

export interface ServerStatus {
  status: string;
  hasKey: boolean;
  model: string;
  app: string;
  version: string;
}
