import React from 'react';
import { X, Code, Cpu, Server, ShieldCheck, Database, Sparkles, BookOpen } from 'lucide-react';

interface VivaHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VivaHelperModal: React.FC<VivaHelperModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 text-slate-800 dark:text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">College Semester Project Viva Guide</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              StudyGenius AI Technical Architecture & Implementation Documentation
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-6 text-sm">
          {/* Key Overview */}
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
            <h3 className="font-semibold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" /> Project Thesis
            </h3>
            <p className="mt-1 text-slate-600 dark:text-slate-300 text-xs md:text-sm leading-relaxed">
              <strong>StudyGenius AI</strong> is an enterprise-grade academic copilot engineered for university coursework. It combines server-side large language model reasoning (Google Gemini 3.8 Flash) with client-side reactive state management and spaced-repetition pedagogical systems.
            </p>
          </div>

          {/* Architecture Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold mb-1">
                <Code className="w-4 h-4" /> 1. Frontend Architecture
              </div>
              <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <li>• <strong>Framework:</strong> React 19 + TypeScript (Strict typing)</li>
                <li>• <strong>Styling:</strong> Tailwind CSS 4 with custom 3D CSS transforms</li>
                <li>• <strong>Icons & UX:</strong> Lucide React + Canvas Confetti animations</li>
                <li>• <strong>State & Storage:</strong> Reactive hooks + LocalStorage persistence</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                <Server className="w-4 h-4" /> 2. Server Runtime & Proxy
              </div>
              <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <li>• <strong>Server:</strong> Express.js running with Vite middlewares</li>
                <li>• <strong>Port:</strong> Dual-mode HTTP server on port 3000</li>
                <li>• <strong>REST Endpoints:</strong> <code>/api/gemini/chat</code>, <code>/api/gemini/notes</code>, <code>/api/gemini/quiz</code>, <code>/api/gemini/flashcards</code></li>
                <li>• <strong>Security:</strong> API keys isolated strictly in server-side memory</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold mb-1">
                <Cpu className="w-4 h-4" /> 3. Gemini Multi-Model Tiers
              </div>
              <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <li>• <strong>Fast:</strong> <code>gemini-3.1-flash-lite</code> (sub-second responses)</li>
                <li>• <strong>General:</strong> <code>gemini-3.8-flash</code> (balanced tutoring &amp; notes)</li>
                <li>• <strong>Complex:</strong> <code>gemini-3.1-pro-preview</code> (STEM derivations &amp; proofs)</li>
                <li>• <strong>Resilience:</strong> Automatic fallback to maintain 100% uptime</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
                <Database className="w-4 h-4" /> 4. DeepMind Science Skills
              </div>
              <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <li>• <strong>AlphaFold DB:</strong> 3D structure predictions &amp; pLDDT score metrics</li>
                <li>• <strong>PubChem:</strong> 2D molecular structures, SMILES &amp; properties</li>
                <li>• <strong>PubMed:</strong> Real peer-reviewed biomedical literature citations</li>
                <li>• <strong>Grounding:</strong> Direct structural &amp; chemical context in chat</li>
              </ul>
            </div>
          </div>

          {/* Common Viva Questions */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Typical Examiner Viva Questions & Answers
            </h4>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/60">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Q: How do you prevent API key leaks to the client browser?</span>
                <p className="mt-1">
                  A: The client never directly calls the Google Gemini API. All AI requests route through Express server proxy endpoints (e.g. <code>/api/gemini/*</code>) where <code>process.env.GEMINI_API_KEY</code> is injected server-side.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/60">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Q: How does the application guarantee valid quiz formatting from the LLM?</span>
                <p className="mt-1">
                  A: We enforce a strict Gemini response schema using <code>responseMimeType: 'application/json'</code> and SDK <code>responseSchema</code> with typed properties (question stem, 4 options, integer correctIndex, and explanation).
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/60">
                <span className="font-semibold text-slate-900 dark:text-slate-100">Q: What educational methodologies are implemented?</span>
                <p className="mt-1">
                  A: We implement Active Recall (Flashcards &amp; Quizzes), the Feynman Technique (ELI5 conceptual simplification), Socratic questioning, and spaced-repetition status tracking (New, Learning, Mastered).
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-md transition-colors"
          >
            Got it, back to app
          </button>
        </div>
      </div>
    </div>
  );
};
