import React, { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Clock,
  Check,
  AlertTriangle,
  BookmarkCheck,
  TrendingUp,
  Brain,
  FlaskConical
} from 'lucide-react';
import { Quiz, QuizQuestion, QuizResult } from '../../types';
import { triggerQuizCelebration } from '../../utils/confetti';

interface QuizArenaViewProps {
  onSaveQuizResult: (result: QuizResult) => void;
  quizHistory: QuizResult[];
}

export const QuizArenaView: React.FC<QuizArenaViewProps> = ({
  onSaveQuizResult,
  quizHistory,
}) => {
  // Quiz Generator Form State
  const [subject, setSubject] = useState('Computer Science');
  const [topic, setTopic] = useState('Process Synchronization');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [useScienceMode, setUseScienceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Quiz Session State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [instantFeedbackMode, setInstantFeedbackMode] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Sample quick topics
  const sampleTopics = [
    { subject: 'Computer Science', topic: 'Process Synchronization & Semaphores' },
    { subject: 'Biology', topic: 'AlphaFold & Protein Structure Confidence Metrics' },
    { subject: 'Chemistry', topic: 'PubChem Molecular Properties & Pharmacokinetics' },
    { subject: 'Biomedicine', topic: 'CRISPR-Cas9 & Gene Editing Mechanisms' },
    { subject: 'Physics', topic: 'Special Relativity & Time Dilation' },
  ];

  // Timer for active quiz
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeQuiz && !isSubmitted) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeQuiz, isSubmitted]);

  const handleGenerateQuiz = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subject.trim() || !topic.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setCurrentQuestionIndex(0);
    setTimeElapsed(0);

    try {
      const response = await fetch('/api/gemini/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          difficulty,
          questionCount,
          useScienceMode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to generate quiz');
      }

      if (!data.quiz || !data.quiz.questions || data.quiz.questions.length === 0) {
        throw new Error('Received invalid quiz structure from server');
      }

      setActiveQuiz(data.quiz);
    } catch (err: unknown) {
      console.error('Quiz generation error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to generate quiz';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;

    let score = 0;
    const answerRecords = activeQuiz.questions.map((q, idx) => {
      const userSelected = selectedAnswers[idx] ?? -1;
      const isCorrect = userSelected === q.correctIndex;
      if (isCorrect) score += 1;
      return {
        questionIndex: idx,
        selectedIndex: userSelected,
        isCorrect,
      };
    });

    const total = activeQuiz.questions.length;
    const percentage = Math.round((score / total) * 100);

    const result: QuizResult = {
      id: `quiz-res-${Date.now()}`,
      quizTitle: activeQuiz.quizTitle || `${topic} Assessment`,
      subject: activeQuiz.subject || subject,
      topic: activeQuiz.topic || topic,
      difficulty: activeQuiz.difficulty || difficulty,
      score,
      totalQuestions: total,
      percentage,
      completedAt: new Date().toISOString(),
      answers: answerRecords,
    };

    setIsSubmitted(true);
    onSaveQuizResult(result);

    // Trigger celebration if passed with high score
    if (percentage >= 70) {
      triggerQuizCelebration();
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentQuestion: QuizQuestion | undefined = activeQuiz?.questions[currentQuestionIndex];
  const totalQuestions = activeQuiz?.questions.length || 0;
  const answeredCount = Object.keys(selectedAnswers).length;

  // Calculate score if submitted
  const score = isSubmitted && activeQuiz
    ? activeQuiz.questions.reduce((acc, q, i) => (selectedAnswers[i] === q.correctIndex ? acc + 1 : acc), 0)
    : 0;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Quiz Generator Setup (Show when no active quiz, or allow resetting) */}
      {!activeQuiz && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                AI Adaptive Quiz Generator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate high-caliber multiple-choice exam questions using Gemini 3.8 Flash to test your mastery.
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerateQuiz} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Academic Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Biology">Biology</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Economics">Economics</option>
                  <option value="General Science">General Science</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Quiz Topic or Exam Chapter <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Operating System Deadlocks, Graph Traversal, Krebs Cycle..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        difficulty === diff
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Total Questions
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 10].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        questionCount === count
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {count} Questions
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* DeepMind Science Skills Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setUseScienceMode(!useScienceMode)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  useScienceMode
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>DeepMind Science Mode (AlphaFold & Molecular Mechanics) {useScienceMode ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Suggested quick topics */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Quick Exam Topics:</span>
              {sampleTopics.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSubject(item.subject);
                    setTopic(item.topic);
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-colors"
                >
                  {item.topic.split(' ')[0]} {item.topic.split(' ')[1] || ''}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !topic.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Gemini is generating questions &amp; answers...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Launch AI Exam Quiz</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {errorMessage && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* 2. Active Quiz Session Container */}
      {activeQuiz && (
        <div className="space-y-6">
          {/* Active Quiz Header / Navigation Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  {activeQuiz.subject}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {activeQuiz.difficulty} Difficulty
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                {activeQuiz.quizTitle}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>{formatTimer(timeElapsed)}</span>
              </div>

              <button
                onClick={() => {
                  if (isSubmitted || window.confirm('Exit this quiz session? Progress will be lost.')) {
                    setActiveQuiz(null);
                  }
                }}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Exit Quiz
              </button>
            </div>
          </div>

          {/* Progress Bar & Question Jumpers */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
              <span>{answeredCount} of {totalQuestions} answered</span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>

            {/* Quick Question Jump Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {activeQuiz.questions.map((q, idx) => {
                const isCurrent = currentQuestionIndex === idx;
                const isAnswered = selectedAnswers[idx] !== undefined;
                const isCorrect = isSubmitted && selectedAnswers[idx] === q.correctIndex;
                const isWrong = isSubmitted && selectedAnswers[idx] !== undefined && !isCorrect;

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      isCurrent
                        ? 'ring-2 ring-indigo-500 ring-offset-1 font-black'
                        : ''
                    } ${
                      isSubmitted
                        ? isCorrect
                          ? 'bg-emerald-500 text-white'
                          : isWrong
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                        : isAnswered
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Card */}
          {currentQuestion && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
              {/* Question Stem */}
              <div>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Question {currentQuestionIndex + 1}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* 4 Multiple Choice Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                  const isCorrect = optIdx === currentQuestion.correctIndex;
                  const showFeedback = isSubmitted || (instantFeedbackMode && selectedAnswers[currentQuestionIndex] !== undefined);

                  let optionStyle = 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200';

                  if (showFeedback) {
                    if (isCorrect) {
                      optionStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                    }
                  } else if (isSelected) {
                    optionStyle = 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-500/30';
                  }

                  const optionLetters = ['A', 'B', 'C', 'D'];

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQuestionIndex, optIdx)}
                      disabled={isSubmitted}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 group ${optionStyle}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-slate-200'
                        }`}
                      >
                        {optionLetters[optIdx] || optIdx + 1}
                      </span>

                      <span className="text-xs sm:text-sm font-medium leading-relaxed pt-0.5">
                        {option}
                      </span>

                      {showFeedback && (
                        <div className="ml-auto shrink-0 pt-0.5">
                          {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                          {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Box (Visible if answered in instant mode, or after submit) */}
              {(isSubmitted || (instantFeedbackMode && selectedAnswers[currentQuestionIndex] !== undefined)) && (
                <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 mb-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                    Concept Explanation &amp; Rationale:
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Prev / Next / Submit Navigation Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={currentQuestionIndex === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous
                </button>

                <div className="flex items-center gap-2">
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => Math.min(prev + 1, totalQuestions - 1))}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                    >
                      Next <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    !isSubmitted && (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={answeredCount === 0}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4" /> Finish &amp; Grade Quiz
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. Quiz Score Card Summary (Visible when submitted) */}
          {isSubmitted && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 text-white shadow-xl space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    Official Exam Assessment Result
                  </span>
                  <h3 className="text-2xl font-black mt-1">
                    {percentage >= 80
                      ? 'Outstanding Mastery! 🎉'
                      : percentage >= 60
                      ? 'Solid Performance! 👍'
                      : 'Needs Further Revision 📚'}
                  </h3>
                  <p className="text-xs text-indigo-200 mt-1 max-w-md">
                    {percentage >= 80
                      ? 'You demonstrated comprehensive mastery of this chapter. High probability of success in final semester exams.'
                      : percentage >= 60
                      ? 'Good conceptual grasp. Review the question explanations above to iron out minor edge cases.'
                      : 'Review the generated study notes and flashcards for this topic to fortify foundational concepts.'}
                  </p>
                </div>

                {/* Circular Score Badge */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 min-w-[140px]">
                  <span className="text-4xl font-black tracking-tight">{percentage}%</span>
                  <span className="text-xs font-bold text-indigo-200 mt-0.5">
                    {score} of {totalQuestions} Correct
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-indigo-200">
                  Result logged to your <strong>Performance Dashboard</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setSelectedAnswers({});
                      setCurrentQuestionIndex(0);
                      setTimeElapsed(0);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retake This Quiz
                  </button>

                  <button
                    onClick={() => setActiveQuiz(null)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-bold shadow-md transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Create Another Quiz
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
