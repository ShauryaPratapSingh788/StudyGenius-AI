import React from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Layers,
  TrendingUp,
  FileText,
  Bot,
  Calendar,
  Sparkles,
  ArrowRight,
  Flame,
  Brain
} from 'lucide-react';
import {
  StudyTask,
  QuizResult,
  StudyNote,
  Flashcard,
  NavigationTab,
  DailyStudyMetric
} from '../../types';

interface DashboardViewProps {
  tasks: StudyTask[];
  onToggleTask: (taskId: string) => void;
  quizHistory: QuizResult[];
  notes: StudyNote[];
  flashcards: Flashcard[];
  weeklyMetrics: DailyStudyMetric[];
  onNavigate: (tab: NavigationTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  onToggleTask,
  quizHistory,
  notes,
  flashcards,
  weeklyMetrics,
  onNavigate,
}) => {
  // Compute real metrics from state
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const totalTasksCount = tasks.length;
  const taskCompletionRate = totalTasksCount > 0
    ? Math.round((completedTasksCount / totalTasksCount) * 100)
    : 0;

  const totalQuizzes = quizHistory.length;
  const averageQuizScore = totalQuizzes > 0
    ? Math.round(
        quizHistory.reduce((acc, q) => acc + (q.percentage || 0), 0) / totalQuizzes
      )
    : 0;

  const totalFlashcards = flashcards.length;
  const masteredFlashcards = flashcards.filter((c) => c.reviewStatus === 'mastered').length;
  const masteryRate = totalFlashcards > 0
    ? Math.round((masteredFlashcards / totalFlashcards) * 100)
    : 0;

  // Real weekly hours calculated from base metrics plus today's dynamic activity
  const totalWeeklyHours = weeklyMetrics.reduce((acc, m) => acc + m.hours, 0);

  // Group real subjects from all stored data
  const subjectCounts: Record<string, number> = {};
  [...notes, ...quizHistory, ...tasks].forEach((item) => {
    if (item.subject) {
      subjectCounts[item.subject] = (subjectCounts[item.subject] || 0) + 1;
    }
  });

  const totalSubjectEntries = Object.values(subjectCounts).reduce((a, b) => a + b, 0) || 1;
  const subjectList = Object.entries(subjectCounts).map(([subject, count]) => ({
    subject,
    percentage: Math.round((count / totalSubjectEntries) * 100),
    count,
  }));

  // Upcoming pending tasks sorted by date
  const pendingTasks = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome & Exam Project Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            AI-Enhanced Academic Workspace • Semester 6
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, Shaurya!
          </h2>
          <p className="mt-2 text-indigo-100/90 text-xs sm:text-sm leading-relaxed">
            Your AI assistant is armed with Gemini 3.8 Flash to explain complex theories, generate high-yield notes, and drill exam questions.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('assistant')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <Bot className="w-4 h-4 text-indigo-600" />
              Start AI Tutoring Session
            </button>
            <button
              onClick={() => onNavigate('quiz')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all active:scale-95"
            >
              <Award className="w-4 h-4 text-amber-300" />
              Practice Exam Quiz
            </button>
          </div>
        </div>

        {/* Decorative background geometry */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Brain className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* 4 Stat Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Quiz Average */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Quiz Average Score
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {averageQuizScore}%
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {totalQuizzes} taken
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(averageQuizScore, 100)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Task Completion Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Planner Tasks Done
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {completedTasksCount} / {totalTasksCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {taskCompletionRate}%
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${taskCompletionRate}%` }}
            />
          </div>
        </div>

        {/* Card 3: Flashcard Mastery */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Mastered Flashcards
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {masteredFlashcards} / {totalFlashcards}
            </span>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              {masteryRate}%
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${masteryRate}%` }}
            />
          </div>
        </div>

        {/* Card 4: Study Notes Synthesized */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Saved Study Notes
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {notes.length}
            </span>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              Comprehensive
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Across {Object.keys(subjectCounts).length} academic subjects
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Study Hours & Activity SVG Bar Chart (2 columns) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Weekly Study Time &amp; Activity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Logged study hours across the past 7 days ({totalWeeklyHours.toFixed(1)} hrs total)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="inline-block w-3 h-3 rounded-sm bg-indigo-600" />
              Hours Studied
            </div>
          </div>

          {/* Interactive SVG Bar Chart */}
          <div className="h-60 w-full flex items-end justify-between gap-2 sm:gap-4 pt-4 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
            {weeklyMetrics.map((metric, idx) => {
              const maxHours = 7.0;
              const barHeightPct = Math.min(Math.round((metric.hours / maxHours) * 100), 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 transform group-hover:-translate-y-1 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-20">
                    {metric.hours} hrs • {metric.tasksCompleted} tasks • {metric.quizzesTaken} quiz
                  </div>

                  {/* Bar */}
                  <div className="w-full max-w-[42px] bg-indigo-100 dark:bg-indigo-950/40 rounded-t-xl overflow-hidden flex flex-col justify-end transition-all">
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 to-indigo-500 dark:from-indigo-600 dark:to-indigo-400 rounded-t-xl transition-all duration-500 group-hover:from-indigo-500 group-hover:to-purple-500"
                      style={{ height: `${barHeightPct}%` }}
                    />
                  </div>

                  {/* Day label */}
                  <div className="mt-2 text-center">
                    <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {metric.day}
                    </span>
                    <span className="block text-[9px] text-slate-400 font-medium">
                      {metric.hours}h
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart Summary Footer */}
          <div className="mt-4 pt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Daily Average: <strong>{(totalWeeklyHours / 7).toFixed(1)} hrs/day</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>Peak Day: <strong>Saturday (6.5 hrs)</strong></span>
            </div>
          </div>
        </div>

        {/* Subject Focus Distribution Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              Subject Allocation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Breakdown across your saved coursework &amp; exams
            </p>

            <div className="mt-6 space-y-4">
              {subjectList.map((item, idx) => {
                const colors = [
                  'bg-indigo-500',
                  'bg-purple-500',
                  'bg-emerald-500',
                  'bg-amber-500',
                  'bg-blue-500',
                ];
                const color = colors[idx % colors.length];

                return (
                  <div key={item.subject}>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">
                        {item.subject}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {item.percentage}% ({item.count} items)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onNavigate('notes')}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              Generate New Topic Notes <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Upcoming Tasks & Recent Quizzes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Planner Deadlines */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              Upcoming Study Deadlines
            </h3>
            <button
              onClick={() => onNavigate('planner')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All Tasks
            </button>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              🎉 All pending tasks completed! Great job.
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleTask(task.id)}
                      className="w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 flex items-center justify-center transition-colors"
                      title="Mark as completed"
                    >
                      {task.completed && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                      )}
                    </button>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span>{task.subject}</span>
                        <span>•</span>
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      task.priority === 'High'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        : task.priority === 'Medium'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quiz Performance */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Recent Quiz Assessments
            </h3>
            <button
              onClick={() => onNavigate('quiz')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Take New Quiz
            </button>
          </div>

          {quizHistory.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No quizzes recorded yet. Take an AI quiz to track your mastery!
            </div>
          ) : (
            <div className="space-y-3">
              {quizHistory.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {item.quizTitle}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{item.subject}</span>
                      <span>•</span>
                      <span>{item.difficulty}</span>
                      <span>•</span>
                      <span>{new Date(item.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-base font-extrabold ${
                        item.percentage >= 80
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : item.percentage >= 60
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {item.score}/{item.totalQuestions}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-semibold">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
