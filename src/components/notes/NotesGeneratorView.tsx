import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Save,
  Download,
  Copy,
  Check,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  BookmarkCheck,
  Layers,
  ArrowRight,
  Globe,
  FlaskConical,
  Image as ImageIcon
} from 'lucide-react';
import { StudyNote, NavigationTab } from '../../types';
import { downloadNoteAsMarkdown, noteToMarkdown } from '../../utils/export';

interface NotesGeneratorViewProps {
  onSaveNote: (note: StudyNote) => void;
  onNavigate: (tab: NavigationTab) => void;
  onGenerateFlashcardsFromNote?: (subject: string, topic: string) => void;
}

export const NotesGeneratorView: React.FC<NotesGeneratorViewProps> = ({
  onSaveNote,
  onNavigate,
  onGenerateFlashcardsFromNote,
}) => {
  const [subject, setSubject] = useState('Computer Science');
  const [topic, setTopic] = useState('');
  const [academicLevel, setAcademicLevel] = useState('Undergraduate');
  const [focusAreas, setFocusAreas] = useState('');
  const [useSearchGrounding, setUseSearchGrounding] = useState(false);
  const [useScienceMode, setUseScienceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedNote, setGeneratedNote] = useState<StudyNote | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // AI Diagram State
  const [diagramUrl, setDiagramUrl] = useState<string | null>(null);
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false);
  const [diagramError, setDiagramError] = useState<string | null>(null);

  const sampleTopics = [
    { subject: 'Computer Science', topic: 'B-Trees and Indexing in Database Management' },
    { subject: 'Mathematics', topic: 'Singular Value Decomposition (SVD) and Matrix Factorization' },
    { subject: 'Physics', topic: 'Maxwell’s Equations and Electromagnetic Wave Propagation' },
    { subject: 'Biology', topic: 'CRISPR-Cas9 Mechanism and Genetic Editing Ethics' },
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subject.trim() || !topic.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    setIsSaved(false);
    setDiagramUrl(null);

    try {
      let combinedFocus = focusAreas;
      if (useScienceMode) {
        combinedFocus += ' [Include biological structures, biochemical pathways, and molecular mechanisms with high scientific rigor]';
      }

      const response = await fetch('/api/gemini/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          academicLevel,
          focusAreas: combinedFocus,
          useSearchGrounding,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to synthesize notes');
      }

      const noteData = data.notes;
      const newNote: StudyNote = {
        id: `note-${Date.now()}`,
        title: noteData.title || `${topic} Notes`,
        subject,
        topic,
        academicLevel,
        createdAt: new Date().toISOString(),
        overview: noteData.overview || '',
        definitions: noteData.definitions || [],
        keyPoints: noteData.keyPoints || [],
        deepDiveSections: noteData.deepDiveSections || [],
        commonExamMistakes: noteData.commonExamMistakes || [],
        mnemonicOrMemoryHook: noteData.mnemonicOrMemoryHook || '',
        summaryTakeaways: noteData.summaryTakeaways || [],
        tags: [subject, academicLevel, useSearchGrounding ? 'Google Grounded' : 'AI Synthesized'],
        isFavorite: false,
      };

      setGeneratedNote(newNote);
    } catch (err: unknown) {
      console.error('Notes generator error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to generate notes';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDiagram = async () => {
    if (!generatedNote) return;
    setIsGeneratingDiagram(true);
    setDiagramError(null);
    try {
      const res = await fetch('/api/gemini/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Educational academic diagram explaining: ${generatedNote.topic} in ${generatedNote.subject}. Clear annotated parts, textbook style.`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate diagram');
      setDiagramUrl(data.imageUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Diagram generation error';
      setDiagramError(msg);
    } finally {
      setIsGeneratingDiagram(false);
    }
  };

  const handleSave = () => {
    if (!generatedNote) return;
    onSaveNote(generatedNote);
    setIsSaved(true);
  };

  const handleCopyMarkdown = () => {
    if (!generatedNote) return;
    const md = noteToMarkdown(generatedNote);
    navigator.clipboard.writeText(md);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedNote) return;
    downloadNoteAsMarkdown(generatedNote);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Generator Configuration Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              AI Smart Notes Synthesizer
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide your course subject and topic. Gemini synthesizes structured, textbook-grade study notes with search grounding and diagrams.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Subject Selector */}
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
                <option value="Engineering">Engineering</option>
                <option value="Medicine">Medicine &amp; Health</option>
                <option value="History & Politics">History &amp; Politics</option>
              </select>
            </div>

            {/* Topic Input */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Topic or Concept Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Dijkstra's Algorithm, Cellular Respiration, Bayes' Theorem..."
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Academic Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Academic Depth
              </label>
              <select
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="High School">High School (Fundamentals)</option>
                <option value="Undergraduate">Undergraduate (College Rigor)</option>
                <option value="Graduate">Graduate / Advanced Research</option>
              </select>
            </div>

            {/* Focus Areas */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Specific Exam Focus or Emphasis (Optional)
              </label>
              <input
                type="text"
                value={focusAreas}
                onChange={(e) => setFocusAreas(e.target.value)}
                placeholder="e.g. Include time complexity proof, common semester pitfalls, step-by-step example..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* AI Feature Toggles: Search Grounding & Science Skills Mode */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setUseSearchGrounding(!useSearchGrounding)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                useSearchGrounding
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Google Search Grounding {useSearchGrounding ? 'ON' : 'OFF'}</span>
            </button>

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
              <span>DeepMind Science Mode {useScienceMode ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Quick Pre-fill topics */}
          <div className="pt-1 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Quick ideas:</span>
            {sampleTopics.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSubject(s.subject);
                  setTopic(s.topic);
                }}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-colors"
              >
                {s.topic.split(' ')[0]} {s.topic.split(' ')[1]}
              </button>
            ))}
          </div>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Notes with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Complete Study Notes</span>
                </>
              )}
            </button>

            {generatedNote && (
              <button
                type="button"
                onClick={() => onNavigate('library')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Go to Notes Library <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </form>

        {errorMessage && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Generated Notes Display View */}
      {generatedNote && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          {/* Note Header & Actions Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {generatedNote.subject}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {generatedNote.academicLevel}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {generatedNote.title}
              </h2>
            </div>

            {/* Note Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleGenerateDiagram}
                disabled={isGeneratingDiagram}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800 text-xs font-bold transition-all active:scale-95"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                {isGeneratingDiagram ? 'Generating Visual...' : 'Generate Study Diagram'}
              </button>

              <button
                onClick={handleSave}
                disabled={isSaved}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  isSaved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Saved in Library
                  </>
                ) : (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5" /> Save to Library
                  </>
                )}
              </button>

              <button
                onClick={handleCopyMarkdown}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                title="Copy Markdown"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? 'Copied' : 'Copy'}
              </button>

              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                title="Download Markdown file"
              >
                <Download className="w-3.5 h-3.5" /> Download .md
              </button>

              {onGenerateFlashcardsFromNote && (
                <button
                  onClick={() => onGenerateFlashcardsFromNote(generatedNote.subject, generatedNote.topic)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800 text-xs font-semibold transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" /> Flashcards
                </button>
              )}
            </div>
          </div>

          {/* AI Educational Diagram Display */}
          {diagramUrl && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-purple-500" /> AI Study Diagram Illustration
              </div>
              <img
                src={diagramUrl}
                alt={generatedNote.title}
                className="max-h-72 w-auto mx-auto rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
              />
            </div>
          )}

          {diagramError && (
            <div className="text-xs text-rose-500 font-medium">{diagramError}</div>
          )}

          {/* Section 1: Executive Overview */}
          <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5 mb-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" /> Executive Overview
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {generatedNote.overview}
            </p>
          </div>

          {/* Section 2: Core Definitions */}
          {generatedNote.definitions && generatedNote.definitions.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Core Definitions &amp; Terminology
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {generatedNote.definitions.map((def, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <div className="font-bold text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">
                      {def.term}
                    </div>
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {def.definition}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Key Principles */}
          {generatedNote.keyPoints && generatedNote.keyPoints.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Key Principles &amp; Takeaways
              </h3>
              <div className="space-y-2">
                {generatedNote.keyPoints.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-xs sm:text-sm text-slate-700 dark:text-slate-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Deep Dive Concepts & Examples */}
          {generatedNote.deepDiveSections && generatedNote.deepDiveSections.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Deep Dive Concepts &amp; Real-World Examples
              </h3>
              {generatedNote.deepDiveSections.map((sec, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2"
                >
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {sec.heading}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {sec.content}
                  </p>
                  {sec.example && (
                    <div className="mt-2 p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/40 border-l-4 border-indigo-500 text-xs text-slate-700 dark:text-slate-300">
                      <strong className="text-indigo-600 dark:text-indigo-400">Concrete Example: </strong>
                      {sec.example}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Section 5: Memory Hook & Common Mistakes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generatedNote.mnemonicOrMemoryHook && (
              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 mb-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" /> Memory Hook / Mnemonic
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {generatedNote.mnemonicOrMemoryHook}
                </p>
              </div>
            )}

            {generatedNote.commonExamMistakes && generatedNote.commonExamMistakes.length > 0 && (
              <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40">
                <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500" /> Common Exam Pitfalls
                </h4>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  {generatedNote.commonExamMistakes.map((m, i) => (
                    <li key={i}>• {m}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Section 6: Rapid Review Summary */}
          {generatedNote.summaryTakeaways && generatedNote.summaryTakeaways.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Rapid-Review Summary
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                {generatedNote.summaryTakeaways.map((takeaway, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
