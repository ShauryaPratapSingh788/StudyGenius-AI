import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Globe,
  Share2,
  Users,
  ShieldCheck,
  UploadCloud,
  Terminal,
  GitBranch,
  KeyRound,
  CheckCircle2,
  FolderArchive
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'link' | 'vercel'>('link');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  if (!isOpen) return null;

  // The direct standalone web link that opens directly without AI Studio builder
  const standaloneUrl = 'https://ais-pre-p2enk4syrbyxq4z6axbysb-624369810073.asia-east1.run.app';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(standaloneUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyCode = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommand(id);
      setTimeout(() => setCopiedCommand(null), 2500);
    } catch {
      setCopiedCommand(id);
      setTimeout(() => setCopiedCommand(null), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'StudyGenius AI - Academic Copilot',
          text: 'Check out StudyGenius AI for college notes, smart flashcards, quizzes and study planning!',
          url: standaloneUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 text-slate-800 dark:text-slate-100 relative overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-xs">
              {activeTab === 'link' ? <Globe className="w-5 h-5" /> : <UploadCloud className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {activeTab === 'link' ? 'Share Website Link' : 'Deploy to Vercel (All At Once)'}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  {activeTab === 'link' ? 'Live Now' : 'Zero File-by-File'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeTab === 'link'
                  ? 'Real website experience without the Gemini chat panel'
                  : 'Upload your entire project at once to Vercel in 1 click'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-xl mb-4 shrink-0">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'link'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" /> Instant Live Link (Ready Now)
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'vercel'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" /> Vercel Deployment Guide
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1 text-xs">
          {activeTab === 'link' ? (
            <>
              {/* Informational callout */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Real Website Experience:</strong> Anyone opening this link will see the full StudyGenius AI application directly in their browser. They will <em>not</em> see the Google AI Studio sidebar or Gemini chat on the left.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>No Deployment Needed:</strong> This link is already live and hosted. You can share it immediately with your classmates, professors, or evaluators.
                  </span>
                </div>
              </div>

              {/* Link display & Copy Button */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Direct Shareable URL:
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-indigo-600 dark:text-indigo-400 select-all overflow-x-auto whitespace-nowrap">
                    {standaloneUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 shrink-0 ${
                      copiedLink
                        ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3.5">
              {/* Direct answer to user's question */}
              <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-200 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Yes! You upload EVERYTHING AT ONCE!
                </div>
                <p className="leading-relaxed">
                  You <strong>do not need to copy or upload code file by file or line by line</strong>. In modern web development, Vercel imports the complete project all at once.
                </p>
              </div>

              {/* Option 1: GitHub to Vercel (Recommended) */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <GitBranch className="w-4 h-4 text-indigo-500" />
                    Option 1: Upload via GitHub (Easiest & Automatic)
                  </div>
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold px-2 py-0.5 rounded-md">
                    Recommended
                  </span>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300">
                  <li>
                    <strong>Download or push whole project:</strong> Push this repository to a GitHub repository all at once with git:
                  </li>
                  <div className="bg-slate-900 text-slate-100 rounded-lg p-2.5 font-mono text-[11px] flex items-center justify-between">
                    <code>git add . && git commit -m "StudyGenius" && git push</code>
                    <button
                      onClick={() => handleCopyCode('git add . && git commit -m "StudyGenius" && git push', 'git')}
                      className="text-slate-400 hover:text-white p-1"
                    >
                      {copiedCommand === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <li>Go to <strong>vercel.com</strong> and click <strong>"Add New" &rarr; "Project"</strong>.</li>
                  <li>Select your GitHub repository &mdash; Vercel automatically detects Vite!</li>
                  <li>Click <strong>Deploy</strong> &mdash; Vercel builds the entire app in ~45 seconds!</li>
                </ol>
              </div>

              {/* Option 2: 1-Command CLI */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <Terminal className="w-4 h-4 text-emerald-500" />
                  Option 2: 1-Line Command via Vercel CLI
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  In your project folder on your computer, open your terminal and run this single command to upload the whole folder:
                </p>
                <div className="bg-slate-900 text-slate-100 rounded-lg p-2.5 font-mono text-[11px] flex items-center justify-between">
                  <code>npx vercel</code>
                  <button
                    onClick={() => handleCopyCode('npx vercel', 'npx')}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    {copiedCommand === 'npx' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Follow the 3 prompts (hit Enter to accept defaults). Vercel uploads the entire directory at once.
                </p>
              </div>

              {/* Environment Variable Note */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 space-y-1.5 text-amber-800 dark:text-amber-200">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Important: Add Your Gemini API Key in Vercel
                </div>
                <p className="text-[11px] leading-relaxed">
                  In your Vercel Project Settings &rarr; <strong>Environment Variables</strong>, add:
                  <br />
                  <code className="font-mono font-bold bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded text-amber-900 dark:text-amber-100">
                    GEMINI_API_KEY
                  </code>{' '}
                  with your Google Gemini API key.
                </p>
              </div>

              {/* Ready Config Notice */}
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 text-indigo-800 dark:text-indigo-200 text-[11px] flex items-center gap-2">
                <FolderArchive className="w-4 h-4 shrink-0 text-indigo-500" />
                <span>
                  We have already prepared <code className="font-mono font-bold">vercel.json</code> and <code className="font-mono font-bold">api/index.ts</code> in the root folder for you, so both the React UI and AI backend endpoints will work seamlessly!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 shrink-0">
          {activeTab === 'link' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Share via App
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {activeTab === 'link' ? (
              <a
                href={standaloneUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Standalone View
              </a>
            ) : (
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Vercel Dashboard
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
