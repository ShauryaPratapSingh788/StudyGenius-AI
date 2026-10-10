import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Lightbulb,
  GraduationCap,
  Calculator,
  AlertTriangle,
  Zap,
  Cpu,
  Brain,
  FlaskConical,
  Dna,
  ExternalLink,
  Search,
  FileText,
  ChevronRight,
  Info,
  Database
} from 'lucide-react';
import {
  ChatMessage,
  TutorMode,
  ModelTier,
  ProteinData,
  CompoundData,
  LiteratureArticle
} from '../../types';

interface AssistantViewProps {
  chatHistory: ChatMessage[];
  onSaveChatHistory: (messages: ChatMessage[]) => void;
}

export const AssistantView: React.FC<AssistantViewProps> = ({
  chatHistory,
  onSaveChatHistory,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (chatHistory && chatHistory.length > 0) return chatHistory;
    return [
      {
        id: 'msg-welcome',
        role: 'model',
        text: `Hello! I am your **StudyGenius AI Assistant**, powered by **Google Gemini** with integrated **DeepMind Science Skills**.\n\nI can help you:
- **Deconstruct complex academic topics** using the Feynman Technique or Socratic dialogue
- **Solve STEM equations & derivations** step-by-step
- **Explore biological macromolecules** with AlphaFold 3D structure predictions & pLDDT confidence scores
- **Analyze chemical molecules** with PubChem 2D diagrams & physicochemical properties
- **Ground research in peer-reviewed literature** via PubMed citations & abstracts

Select a tutoring style, pick your model speed/depth, or open the **Science Lab Tools** below!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelTier: 'general',
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tutorMode, setTutorMode] = useState<TutorMode>('standard');
  const [modelTier, setModelTier] = useState<ModelTier>('general');
  const [subject, setSubject] = useState('General');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Science Tools Panel State
  const [isSciencePanelOpen, setIsSciencePanelOpen] = useState(false);
  const [scienceTab, setScienceTab] = useState<'proteins' | 'compounds' | 'literature'>('proteins');

  // Protein Tool State
  const [proteinQuery, setProteinQuery] = useState('TP53');
  const [proteinData, setProteinData] = useState<ProteinData | null>(null);
  const [isProteinLoading, setIsProteinLoading] = useState(false);
  const [proteinError, setProteinError] = useState<string | null>(null);

  // Compound Tool State
  const [compoundQuery, setCompoundQuery] = useState('Aspirin');
  const [compoundData, setCompoundData] = useState<CompoundData | null>(null);
  const [isCompoundLoading, setIsCompoundLoading] = useState(false);
  const [compoundError, setCompoundError] = useState<string | null>(null);

  // Literature Tool State
  const [literatureQuery, setLiteratureQuery] = useState('CRISPR Cas9');
  const [articles, setArticles] = useState<LiteratureArticle[]>([]);
  const [isLitLoading, setIsLitLoading] = useState(false);
  const [litError, setLitError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    onSaveChatHistory(messages);
  }, [messages]);

  // Initial load of science tool examples so user never sees empty state
  useEffect(() => {
    fetchProtein('TP53');
    fetchCompound('Aspirin');
    fetchLiterature('CRISPR Cas9');
  }, []);

  const fetchProtein = async (geneOrAccession: string) => {
    const q = geneOrAccession.trim();
    if (!q) return;
    setIsProteinLoading(true);
    setProteinError(null);
    try {
      const res = await fetch(`/api/science/protein/${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch protein structure');
      setProteinData(data.protein);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching protein';
      setProteinError(msg);
      setProteinData(null);
    } finally {
      setIsProteinLoading(false);
    }
  };

  const fetchCompound = async (name: string) => {
    const q = name.trim();
    if (!q) return;
    setIsCompoundLoading(true);
    setCompoundError(null);
    try {
      const res = await fetch(`/api/science/compound/${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch chemical compound');
      setCompoundData(data.compound);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error fetching compound';
      setCompoundError(msg);
      setCompoundData(null);
    } finally {
      setIsCompoundLoading(false);
    }
  };

  const fetchLiterature = async (queryTerm: string) => {
    const q = queryTerm.trim();
    if (!q) return;
    setIsLitLoading(true);
    setLitError(null);
    try {
      const res = await fetch(`/api/science/literature?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to search PubMed');
      setArticles(data.articles || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error searching PubMed';
      setLitError(msg);
      setArticles([]);
    } finally {
      setIsLitLoading(false);
    }
  };

  const promptSuggestions = [
    {
      title: "AlphaFold pLDDT Analysis",
      prompt: "Explain how AlphaFold calculates the pLDDT confidence metric and how to distinguish well-folded domains from intrinsically disordered regions.",
      subject: "Biology",
    },
    {
      title: "AVL Tree Rotations",
      prompt: "Explain how AVL tree double rotations (Left-Right and Right-Left) work with balance factor math.",
      subject: "Computer Science",
    },
    {
      title: "Derive Bayes' Theorem",
      prompt: "Derive Bayes' Theorem from conditional probability and explain its intuitive meaning using a medical test example.",
      subject: "Mathematics",
    },
    {
      title: "Drug-Target Binding",
      prompt: "Explain how small molecules like Aspirin or Imatinib bind to their target active sites, including hydrogen bonding and Lipinski rules.",
      subject: "Chemistry",
    },
  ];

  const handleSend = async (textToSend?: string, scientificContext?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setErrorMessage(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tutorMode,
      modelTier,
      subject,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const historyPayload = updatedMessages.map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload.slice(-8),
          tutorMode,
          modelTier,
          subject,
          scientificContext,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to get AI response');
      }

      const botMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tutorMode,
        modelTier,
        subject,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: unknown) {
      console.error('Chat error:', err);
      const msg = err instanceof Error ? err.message : 'Network error';
      setErrorMessage(msg);

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'model',
          text: `⚠️ **Unable to complete request:** ${msg}\n\n*Tip:* Please check your network connection or verify that \`GEMINI_API_KEY\` is configured in your AI Studio project secrets.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm('Clear current tutoring conversation history?')) {
      const resetMessage: ChatMessage = {
        id: 'msg-reset',
        role: 'model',
        text: 'Conversation reset. What academic or scientific topic would you like to explore next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelTier,
      };
      setMessages([resetMessage]);
    }
  };

  // Helper to format text
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mt-2">
                {line.replace('### ', '')}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-extrabold text-slate-900 dark:text-white text-base mt-3">
                {line.replace('## ', '')}
              </h3>
            );
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 ml-1">
                <span className="text-indigo-500 font-bold">•</span>
                <span>{renderInlineFormatting(line.substring(2))}</span>
              </div>
            );
          }
          if (!line.trim()) {
            return <div key={idx} className="h-1.5" />;
          }
          return <p key={idx}>{renderInlineFormatting(line)}</p>;
        })}
      </div>
    );
  };

  const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded font-mono text-[11px] sm:text-xs bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Canonical pLDDT badge styling from Science skill
  const getPlddtBadge = (score: number, band: string) => {
    let colorClass = 'bg-[#FF7D45] text-white'; // Very Low
    if (score >= 90) colorClass = 'bg-[#0053D6] text-white'; // Very High
    else if (score >= 70) colorClass = 'bg-[#65CBF3] text-slate-900'; // Confident
    else if (score >= 50) colorClass = 'bg-[#FFDB13] text-slate-900'; // Low

    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${colorClass}`}>
        pLDDT {score} • {band}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Control Bar: Tutor Persona & Model Tier & Science Toggle */}
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60 flex flex-wrap items-center justify-between gap-3">
        {/* Model Tier Selector (Fast, General, Complex) */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" /> Model:
          </span>
          <div className="flex rounded-xl bg-white dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setModelTier('fast')}
              title="gemini-3.1-flash-lite: Low-latency, fast answers"
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                modelTier === 'fast'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3 h-3" /> Fast (Flash Lite)
            </button>
            <button
              onClick={() => setModelTier('general')}
              title="gemini-3.8-flash: High-accuracy balanced academic mentor"
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                modelTier === 'general'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3 h-3" /> General (Flash 3.8)
            </button>
            <button
              onClick={() => setModelTier('complex')}
              title="High-reasoning mode: Complex STEM proofs, comprehensive derivations, and deep analysis"
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                modelTier === 'complex'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Brain className="w-3 h-3" /> Deep Reasoning
            </button>
          </div>
        </div>

        {/* Science Tools Dock Trigger & Chat Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSciencePanelOpen(!isSciencePanelOpen)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isSciencePanelOpen
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Science Skills Lab</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20">AlphaFold/PubChem</span>
          </button>

          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Reset Chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tutor Style Roles Bar */}
      <div className="px-3 sm:px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Role:
        </span>
        {[
          { id: 'standard' as TutorMode, label: 'Comprehensive', icon: GraduationCap },
          { id: 'feynman' as TutorMode, label: 'Feynman (ELI5)', icon: Lightbulb },
          { id: 'socratic' as TutorMode, label: 'Socratic Tutor', icon: HelpCircle },
          { id: 'exam' as TutorMode, label: 'Exam Focus', icon: BookOpen },
          { id: 'stem' as TutorMode, label: 'STEM & Math', icon: Calculator },
          { id: 'science' as TutorMode, label: 'DeepMind Science', icon: Dna },
        ].map((mode) => {
          const Icon = mode.icon;
          const isSelected = tutorMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setTutorMode(mode.id)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Science Skills Dock Panel (Expandable Workbench) */}
      {isSciencePanelOpen && (
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/80 p-4 animate-in slide-in-from-top-2 duration-200 max-h-72 overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-emerald-500" />
                Science Skills Discovery Workbench
              </span>
              <span className="text-[10px] text-slate-400">
                (Real-time data from AlphaFold DB, PubChem &amp; PubMed)
              </span>
            </div>

            {/* Science Tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setScienceTab('proteins')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  scienceTab === 'proteins'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                🧬 AlphaFold Proteins
              </button>
              <button
                onClick={() => setScienceTab('compounds')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  scienceTab === 'compounds'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                🧪 PubChem Molecules
              </button>
              <button
                onClick={() => setScienceTab('literature')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  scienceTab === 'literature'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                📄 PubMed Research
              </button>
            </div>
          </div>

          {/* TAB 1: AlphaFold Proteins */}
          {scienceTab === 'proteins' && (
            <div className="pt-3 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={proteinQuery}
                    onChange={(e) => setProteinQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchProtein(proteinQuery)}
                    placeholder="Search gene/protein (e.g. TP53, BRCA1, EGFR, P04637)..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-hidden"
                  />
                </div>
                <button
                  onClick={() => fetchProtein(proteinQuery)}
                  disabled={isProteinLoading}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0"
                >
                  {isProteinLoading ? 'Searching...' : 'Fetch AlphaFold'}
                </button>

                {/* Pre-loaded quick example chips as mandated by Science Skill */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-semibold">Examples:</span>
                  {['TP53', 'BRCA1', 'EGFR', 'INS', 'P04637'].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => {
                        setProteinQuery(chip);
                        fetchProtein(chip);
                      }}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-emerald-100 dark:hover:bg-emerald-950"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {proteinError && (
                <div className="text-xs text-rose-500 font-medium">{proteinError}</div>
              )}

              {proteinData && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {proteinData.gene} ({proteinData.uniprotId})
                      </span>
                      {getPlddtBadge(proteinData.globalPlddt, proteinData.plddtBand)}
                      <span className="text-[10px] text-slate-400 font-mono">
                        UniProt: {proteinData.uniprotAccession}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                      {proteinData.uniprotDescription} • {proteinData.organism} • {proteinData.sequenceLength} aa
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`https://alphafold.ebi.ac.uk/entry/${proteinData.uniprotAccession}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                    >
                      AlphaFold 3D <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() =>
                        handleSend(
                          `Explain the structural and biological function of the ${proteinData.gene} protein (${proteinData.uniprotAccession}) and what its AlphaFold pLDDT score of ${proteinData.globalPlddt} (${proteinData.plddtBand}) signifies.`,
                          `Protein: ${proteinData.gene}, UniProt Accession: ${proteinData.uniprotAccession}, Length: ${proteinData.sequenceLength} aa, Global pLDDT: ${proteinData.globalPlddt} (${proteinData.plddtBand}), Organism: ${proteinData.organism}`
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-xs"
                    >
                      Ask AI to Analyze
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PubChem Molecules */}
          {scienceTab === 'compounds' && (
            <div className="pt-3 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={compoundQuery}
                    onChange={(e) => setCompoundQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchCompound(compoundQuery)}
                    placeholder="Search chemical compound (e.g. Aspirin, Caffeine, Dopamine, Ibuprofen)..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-hidden"
                  />
                </div>
                <button
                  onClick={() => fetchCompound(compoundQuery)}
                  disabled={isCompoundLoading}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0"
                >
                  {isCompoundLoading ? 'Searching...' : 'Fetch PubChem'}
                </button>

                {/* Pre-loaded quick example chips */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-semibold">Examples:</span>
                  {['Aspirin', 'Caffeine', 'Dopamine', 'Glucose', 'Ibuprofen'].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => {
                        setCompoundQuery(chip);
                        fetchCompound(chip);
                      }}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-emerald-100 dark:hover:bg-emerald-950"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {compoundError && (
                <div className="text-xs text-rose-500 font-medium">{compoundError}</div>
              )}

              {compoundData && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={compoundData.imageUrl}
                      alt={compoundData.name}
                      className="w-16 h-16 object-contain bg-white rounded-lg p-1 border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white capitalize">
                          {compoundData.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                          CID: {compoundData.cid}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Formula: <strong>{compoundData.molecularFormula}</strong> • MW: <strong>{compoundData.molecularWeight} g/mol</strong> • XLogP: <strong>{compoundData.xLogP ?? 'N/A'}</strong>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1 line-clamp-1">
                        SMILES: {compoundData.canonicalSmiles}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compoundData.cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                    >
                      PubChem <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() =>
                        handleSend(
                          `Explain the chemical properties, pharmacological mechanism of action, and biological targets of ${compoundData.name} (${compoundData.molecularFormula}, MW ${compoundData.molecularWeight}).`,
                          `Compound: ${compoundData.name}, CID: ${compoundData.cid}, Formula: ${compoundData.molecularFormula}, MW: ${compoundData.molecularWeight}, Canonical SMILES: ${compoundData.canonicalSmiles}, XLogP: ${compoundData.xLogP}, TPSA: ${compoundData.tpsa}`
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-xs"
                    >
                      Ask AI Mechanism
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PubMed Research Literature */}
          {scienceTab === 'literature' && (
            <div className="pt-3 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={literatureQuery}
                    onChange={(e) => setLiteratureQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchLiterature(literatureQuery)}
                    placeholder="Search PubMed papers (e.g. CRISPR Cas9, CAR-T, AlphaFold)..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-hidden"
                  />
                </div>
                <button
                  onClick={() => fetchLiterature(literatureQuery)}
                  disabled={isLitLoading}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0"
                >
                  {isLitLoading ? 'Searching...' : 'Search PubMed'}
                </button>

                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-semibold">Examples:</span>
                  {['CRISPR Cas9', 'AlphaFold', 'mRNA Vaccines'].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => {
                        setLiteratureQuery(chip);
                        fetchLiterature(chip);
                      }}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-emerald-100"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {litError && (
                <div className="text-xs text-rose-500 font-medium">{litError}</div>
              )}

              {articles.length > 0 && (
                <div className="space-y-2">
                  {articles.map((art) => (
                    <div
                      key={art.pmid}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between gap-3"
                    >
                      <div>
                        <h5 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                          {art.title}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {art.authors.join(', ')} • <em>{art.source}</em> ({art.pubdate}) • PMID: {art.pmid}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={art.pubmedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                        >
                          PubMed <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          onClick={() =>
                            handleSend(
                              `Synthesize and explain the key findings, methodologies, and clinical relevance of this paper: "${art.title}" (PMID: ${art.pmid}, Journal: ${art.source}).`,
                              `Paper: "${art.title}", PMID: ${art.pmid}, Source: ${art.source}, Date: ${art.pubdate}, Authors: ${art.authors.join(', ')}`
                            )
                          }
                          className="px-2 py-0.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px]"
                        >
                          Summarize
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Messages Thread Container (Multi-Turn Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {/* Prompt Suggestions when chat has few messages */}
        {messages.length <= 2 && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 mb-6">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Suggested Prompts &amp; Research Queries:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {promptSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.prompt)}
                  className="p-2.5 text-left rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all group"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    <span>{item.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{item.subject}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {item.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Multi-Turn Message Bubbles */}
        {messages.map((message) => {
          const isUser = message.role === 'user';
          const isCopied = copiedId === message.id;

          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs ${
                  isUser
                    ? 'bg-gradient-to-tr from-indigo-600 to-indigo-700'
                    : 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 rounded-tl-xs shadow-xs'
                }`}
              >
                {/* Meta Header for Bot turns */}
                {!isUser && (
                  <div className="mb-2 flex items-center gap-1.5 flex-wrap">
                    {message.tutorMode && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                        {message.tutorMode} mode
                      </span>
                    )}
                    {message.modelTier && (
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-700/60 px-1.5 py-0.5 rounded">
                        {message.modelTier === 'fast'
                          ? '⚡ Flash Lite'
                          : message.modelTier === 'complex'
                          ? '🧠 Pro Reasoning'
                          : '🎯 Flash 3.8'}
                      </span>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="prose-study">
                  {renderFormattedText(message.text)}
                </div>

                {/* Footer info & Copy Action */}
                <div
                  className={`mt-2 flex items-center justify-between text-[10px] ${
                    isUser ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  <span>{message.timestamp}</span>

                  {!isUser && (
                    <button
                      onClick={() => handleCopy(message.id, message.text)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-opacity flex items-center gap-1 text-[10px]"
                      title="Copy response"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {modelTier === 'fast'
                    ? 'Gemini 3.1 Flash Lite is responding instantly...'
                    : modelTier === 'complex'
                    ? 'Gemini 3.1 Pro is performing deep multi-step reasoning...'
                    : 'Gemini 3.8 Flash is analyzing your academic question...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Area */}
      <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="relative flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask StudyGenius AI anything (Enter to send, Shift+Enter for new line)...`}
            rows={2}
            className="flex-1 resize-none p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="h-11 px-4 sm:px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25 transition-all shrink-0 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <div className="flex items-center gap-2">
            <span>Model Tier: <strong className="capitalize">{modelTier}</strong></span>
            <span>•</span>
            <span>Role: <strong className="capitalize">{tutorMode}</strong></span>
          </div>
          <button
            onClick={() => setIsSciencePanelOpen(!isSciencePanelOpen)}
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
          >
            <FlaskConical className="w-3 h-3" />
            {isSciencePanelOpen ? 'Hide Science Lab' : 'Show Science Lab'}
          </button>
        </div>
      </div>
    </div>
  );
};
