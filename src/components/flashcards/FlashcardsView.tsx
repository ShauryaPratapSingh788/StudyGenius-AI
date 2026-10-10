import React, { useState, useMemo } from 'react';
import {
  Layers,
  Sparkles,
  Plus,
  RotateCw,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Shuffle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  X,
  Save,
  Check,
  Search
} from 'lucide-react';
import { Flashcard, NavigationTab } from '../../types';

interface FlashcardsViewProps {
  flashcards: Flashcard[];
  onSaveFlashcards: (cards: Flashcard[]) => void;
  initialTopic?: { subject: string; topic: string } | null;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  flashcards,
  onSaveFlashcards,
  initialTopic,
}) => {
  // Mode: 'study' (interactive 3D flip study session) or 'manage' (grid list)
  const [viewMode, setViewMode] = useState<'study' | 'manage'>('study');
  const [selectedDeck, setSelectedDeck] = useState<string>('All');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAiGenModalOpen, setIsAiGenModalOpen] = useState(Boolean(initialTopic));
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  // Manual Create Card Form
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newDeck, setNewDeck] = useState('Computer Science');
  const [newSubject, setNewSubject] = useState('Computer Science');
  const [newTag, setNewTag] = useState('');

  // AI Generator Form
  const [aiSubject, setAiSubject] = useState(initialTopic?.subject || 'Computer Science');
  const [aiTopic, setAiTopic] = useState(initialTopic?.topic || '');
  const [aiCount, setAiCount] = useState(6);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Extract decks
  const decks = useMemo(() => {
    const list = Array.from(new Set(flashcards.map((c) => c.deckName || c.subject)));
    return ['All', ...list];
  }, [flashcards]);

  // Filtered flashcards by deck and search
  const activeDeckCards = useMemo(() => {
    return flashcards.filter((card) => {
      const matchesDeck = selectedDeck === 'All' || (card.deckName || card.subject) === selectedDeck;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        card.front.toLowerCase().includes(q) ||
        card.back.toLowerCase().includes(q) ||
        (card.tag && card.tag.toLowerCase().includes(q));
      return matchesDeck && matchesSearch;
    });
  }, [flashcards, selectedDeck, searchQuery]);

  const currentCard = activeDeckCards[currentCardIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % activeDeckCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + activeDeckCards.length) % activeDeckCards.length);
  };

  const handleSetMastery = (cardId: string, status: 'mastered' | 'learning') => {
    const updated = flashcards.map((c) => (c.id === cardId ? { ...c, reviewStatus: status } : c));
    onSaveFlashcards(updated);
    handleNext();
  };

  const handleShuffle = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    onSaveFlashcards(shuffled);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  // AI Flashcards Generator
  const handleGenerateAiDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiSubject || !aiTopic || isAiLoading) return;

    setIsAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch('/api/gemini/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: aiSubject,
          topic: aiTopic,
          count: aiCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to synthesize flashcards');
      }

      const generatedDeck = data.flashcards;
      const newCards: Flashcard[] = (generatedDeck.cards || []).map((c: any, idx: number) => ({
        id: `card-${Date.now()}-${idx}`,
        front: c.front,
        back: c.back,
        tag: c.tag || aiTopic,
        deckId: `deck-${Date.now()}`,
        deckName: generatedDeck.deckTitle || aiTopic,
        subject: aiSubject,
        reviewStatus: 'new',
      }));

      const updatedDeck = [...newCards, ...flashcards];
      onSaveFlashcards(updatedDeck);
      setSelectedDeck(generatedDeck.deckTitle || aiTopic);
      setCurrentCardIndex(0);
      setIsAiGenModalOpen(false);
      setAiTopic('');
    } catch (err: unknown) {
      console.error('AI Flashcard generation error:', err);
      const msg = err instanceof Error ? err.message : 'Error generating flashcards';
      setAiError(msg);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Create manual card
  const handleCreateManualCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      front: newFront.trim(),
      back: newBack.trim(),
      deckId: `deck-${newDeck.toLowerCase().replace(/\s+/g, '-')}`,
      deckName: newDeck.trim() || 'General',
      subject: newSubject.trim() || 'General',
      tag: newTag.trim() || undefined,
      reviewStatus: 'new',
    };

    onSaveFlashcards([newCard, ...flashcards]);
    setNewFront('');
    setNewBack('');
    setNewTag('');
    setIsCreateModalOpen(false);
  };

  // Edit card
  const handleSaveEditedCard = () => {
    if (!editingCard) return;
    const updated = flashcards.map((c) => (c.id === editingCard.id ? editingCard : c));
    onSaveFlashcards(updated);
    setEditingCard(null);
  };

  // Delete card
  const handleDeleteCard = (cardId: string) => {
    if (window.confirm('Delete this flashcard?')) {
      const updated = flashcards.filter((c) => c.id !== cardId);
      onSaveFlashcards(updated);
      if (currentCardIndex >= updated.length) {
        setCurrentCardIndex(Math.max(0, updated.length - 1));
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Deck Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Decks Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 shrink-0">Decks:</span>
          {decks.map((deck) => (
            <button
              key={deck}
              onClick={() => {
                setSelectedDeck(deck);
                setCurrentCardIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedDeck === deck
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {deck}
            </button>
          ))}
        </div>

        {/* Action Buttons & View Mode Switcher */}
        <div className="flex items-center gap-2">
          {/* Study vs Manage toggle */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('study')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'study'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Study Mode
            </button>
            <button
              onClick={() => setViewMode('manage')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'manage'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-300 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Cards ({activeDeckCards.length})
            </button>
          </div>

          {/* AI Generator button */}
          <button
            onClick={() => setIsAiGenModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800 text-xs font-bold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Generate
          </button>

          {/* New manual card */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Card
          </button>
        </div>
      </div>

      {/* Mode 1: 3D Flip Card Interactive Study Mode */}
      {viewMode === 'study' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {activeDeckCards.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8">
              <Layers className="w-10 h-10 text-purple-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No cards in this deck
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Generate flashcards using Gemini AI or add your own cards.
              </p>
              <button
                onClick={() => setIsAiGenModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md"
              >
                Synthesize Deck with AI
              </button>
            </div>
          ) : (
            <>
              {/* Progress counter & Shuffle */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Card {currentCardIndex + 1} of {activeDeckCards.length}</span>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      currentCard.reviewStatus === 'mastered'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                        : currentCard.reviewStatus === 'learning'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {currentCard.reviewStatus}
                  </span>

                  <button
                    onClick={handleShuffle}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    title="Shuffle Cards"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 3D Flip Card Container */}
              <div
                onClick={handleFlip}
                className="perspective-1000 w-full h-80 sm:h-96 cursor-pointer select-none group"
              >
                <div
                  className={`relative w-full h-full transform-style-3d transition-transform duration-500 rounded-3xl shadow-lg border border-slate-200/80 dark:border-slate-800 ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* FRONT FACE */}
                  <div className="absolute inset-0 backface-hidden p-8 rounded-3xl bg-white dark:bg-slate-900 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        {currentCard.subject} • {currentCard.deckName}
                      </span>
                      {currentCard.tag && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          #{currentCard.tag}
                        </span>
                      )}
                    </div>

                    <div className="my-auto text-center px-4">
                      <span className="block text-[11px] font-bold text-purple-500 uppercase tracking-widest mb-2">
                        Question / Prompt
                      </span>
                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-relaxed">
                        {currentCard.front}
                      </h3>
                    </div>

                    <div className="text-center">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 group-hover:underline">
                        <RotateCw className="w-3.5 h-3.5" /> Click card to reveal answer
                      </span>
                    </div>
                  </div>

                  {/* BACK FACE (Rotated 180) */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 text-white flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/20 text-white">
                        Concept Solution
                      </span>
                      <span className="text-[10px] text-indigo-300">
                        StudyGenius Flashcard
                      </span>
                    </div>

                    <div className="my-auto text-left px-2 sm:px-4 overflow-y-auto max-h-56">
                      <p className="text-sm sm:text-base text-indigo-50 leading-relaxed font-medium whitespace-pre-line">
                        {currentCard.back}
                      </p>
                    </div>

                    <div className="text-center pt-2">
                      <span className="text-xs text-indigo-300 font-semibold">
                        Click card to flip back
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Study Control Actions (Spaced Repetition Feedback) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3">
                <button
                  onClick={handlePrev}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSetMastery(currentCard.id, 'learning')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-900 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Need Review
                  </button>

                  <button
                    onClick={() => handleSetMastery(currentCard.id, 'mastered')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Mastered It!
                  </button>
                </div>

                <button
                  onClick={handleNext}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Mode 2: Card Management Grid */}
      {viewMode === 'manage' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter flashcards by question, answer, or tag..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-xs font-medium focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDeckCards.map((card) => (
              <div
                key={card.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-2">
                    <span className="text-purple-600 dark:text-purple-400">{card.deckName}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        card.reviewStatus === 'mastered'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                          : card.reviewStatus === 'learning'
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {card.reviewStatus}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2">
                    {card.front}
                  </h4>

                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {card.back}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {card.tag ? `#${card.tag}` : card.subject}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingCard(card)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit card"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                      title="Delete card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Generator Modal */}
      {isAiGenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setIsAiGenModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Generate AI Flashcard Deck</h3>
                <p className="text-[11px] text-slate-400">Synthesize active-recall cards using Gemini</p>
              </div>
            </div>

            <form onSubmit={handleGenerateAiDeck} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Academic Subject</label>
                <input
                  type="text"
                  value={aiSubject}
                  onChange={(e) => setAiSubject(e.target.value)}
                  required
                  placeholder="e.g. Computer Science, Organic Chemistry..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Chapter or Topic</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  required
                  placeholder="e.g. OSI Model Layers, Enzyme Inhibitors..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Number of Cards</label>
                <select
                  value={aiCount}
                  onChange={(e) => setAiCount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                >
                  <option value={4}>4 Cards (Quick Review)</option>
                  <option value={6}>6 Cards (Standard Deck)</option>
                  <option value={10}>10 Cards (Deep Recall)</option>
                </select>
              </div>

              {aiError && (
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs">
                  {aiError}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAiGenModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAiLoading || !aiTopic.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  {isAiLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Deck</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Create Card Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-sm mb-4">Create New Study Flashcard</h3>

            <form onSubmit={handleCreateManualCard} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Deck Name</label>
                <input
                  type="text"
                  value={newDeck}
                  onChange={(e) => setNewDeck(e.target.value)}
                  placeholder="e.g. Operating Systems"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Front (Question or Concept)</label>
                <textarea
                  rows={2}
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  required
                  placeholder="What is the concept or question to test?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Back (Explanation or Answer)</label>
                <textarea
                  rows={3}
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  required
                  placeholder="Provide the exact, high-yield explanation or definition..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md"
                >
                  Save Flashcard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Card Modal */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setEditingCard(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-bold text-sm mb-4">Edit Flashcard</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Front (Question)</label>
                <textarea
                  rows={2}
                  value={editingCard.front}
                  onChange={(e) => setEditingCard({ ...editingCard, front: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Back (Answer)</label>
                <textarea
                  rows={3}
                  value={editingCard.back}
                  onChange={(e) => setEditingCard({ ...editingCard, back: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setEditingCard(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditedCard}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
