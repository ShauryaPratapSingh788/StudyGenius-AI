import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Trash2,
  Edit3,
  Download,
  Copy,
  Check,
  Star,
  Plus,
  ArrowRight,
  Filter,
  X,
  FileText,
  Save,
  Clock,
  Layers
} from 'lucide-react';
import { StudyNote, NavigationTab } from '../../types';
import { downloadNoteAsMarkdown, noteToMarkdown } from '../../utils/export';

interface NotesLibraryViewProps {
  notes: StudyNote[];
  onUpdateNote: (note: StudyNote) => void;
  onDeleteNote: (noteId: string) => void;
  onNavigate: (tab: NavigationTab) => void;
  onGenerateFlashcards?: (subject: string, topic: string) => void;
}

export const NotesLibraryView: React.FC<NotesLibraryViewProps> = ({
  notes,
  onUpdateNote,
  onDeleteNote,
  onNavigate,
  onGenerateFlashcards,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [activeNoteModal, setActiveNoteModal] = useState<StudyNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState<StudyNote | null>(null);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // Extract unique subjects
  const subjects = useMemo(() => {
    const list = Array.from(new Set(notes.map((n) => n.subject).filter(Boolean)));
    return ['All', ...list];
  }, [notes]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesSubject = selectedSubject === 'All' || n.subject === selectedSubject;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        n.title.toLowerCase().includes(q) ||
        n.topic.toLowerCase().includes(q) ||
        n.overview.toLowerCase().includes(q) ||
        (n.tags && n.tags.some((t) => t.toLowerCase().includes(q)));
      return matchesSubject && matchesSearch;
    });
  }, [notes, selectedSubject, searchQuery]);

  const handleOpenNote = (note: StudyNote) => {
    setActiveNoteModal(note);
    setEditedNote(JSON.parse(JSON.stringify(note)));
    setIsEditing(false);
  };

  const handleToggleFavorite = (note: StudyNote, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateNote({
      ...note,
      isFavorite: !note.isFavorite,
    });
  };

  const handleSaveEdit = () => {
    if (!editedNote) return;
    onUpdateNote(editedNote);
    setActiveNoteModal(editedNote);
    setIsEditing(false);
  };

  const handleCopy = (note: StudyNote, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const md = noteToMarkdown(note);
    navigator.clipboard.writeText(md);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this study note from your library?')) {
      onDeleteNote(id);
      if (activeNoteModal?.id === id) {
        setActiveNoteModal(null);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Search & Filter Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by concept, title, or keywords..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Subject Filter Pills & Create Action */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedSubject === sub
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <button
            onClick={() => onNavigate('notes')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800 text-xs font-bold transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> New AI Note
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No study notes found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No notes matched "${searchQuery}". Try a different search query.`
              : 'Your library is currently empty. Synthesize high-yield notes using the AI Smart Notes Generator.'}
          </p>
          <button
            onClick={() => onNavigate('notes')}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Synthesize First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => {
            const isCopied = copiedNoteId === note.id;

            return (
              <div
                key={note.id}
                onClick={() => handleOpenNote(note)}
                className="group cursor-pointer rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Subject & Favorite */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {note.subject}
                    </span>

                    <button
                      onClick={(e) => handleToggleFavorite(note, e)}
                      className="p-1 rounded-md text-slate-300 hover:text-amber-500 transition-colors"
                      title={note.isFavorite ? 'Unfavorite' : 'Favorite'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          note.isFavorite
                            ? 'text-amber-400 fill-amber-400'
                            : 'hover:text-amber-400'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Title & Preview */}
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {note.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {note.overview}
                  </p>
                </div>

                {/* Card Meta & Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleCopy(note, e)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="Copy Markdown"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadNoteAsMarkdown(note);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      title="Download Markdown"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleDelete(note.id, e)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal / Detailed Note Viewer & Editor */}
      {activeNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-900 dark:text-slate-100">
            {/* Modal Controls */}
            <button
              onClick={() => setActiveNoteModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="pr-12 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {activeNoteModal.subject}
                </span>
                <span className="text-[10px] text-slate-400">
                  {activeNoteModal.academicLevel} • {new Date(activeNoteModal.createdAt).toLocaleDateString()}
                </span>
              </div>

              {isEditing && editedNote ? (
                <input
                  type="text"
                  value={editedNote.title}
                  onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
                  className="w-full text-lg sm:text-xl font-bold px-3 py-1.5 rounded-lg border border-indigo-400 bg-slate-50 dark:bg-slate-800"
                />
              ) : (
                <h2 className="text-xl sm:text-2xl font-black">{activeNoteModal.title}</h2>
              )}
            </div>

            {/* Modal Actions Bar */}
            <div className="py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <button
                    onClick={handleSaveEdit}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Note
                  </button>
                )}

                <button
                  onClick={() => handleCopy(activeNoteModal)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Markdown
                </button>

                <button
                  onClick={() => downloadNoteAsMarkdown(activeNoteModal)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" /> Download .md
                </button>
              </div>

              <div className="flex items-center gap-2">
                {onGenerateFlashcards && (
                  <button
                    onClick={() => {
                      onGenerateFlashcards(activeNoteModal.subject, activeNoteModal.topic);
                      setActiveNoteModal(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold"
                  >
                    <Layers className="w-3.5 h-3.5" /> Create Flashcards
                  </button>
                )}

                <button
                  onClick={() => handleDelete(activeNoteModal.id)}
                  className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Note Content Display / Editor Body */}
            <div className="mt-5 space-y-6 text-xs sm:text-sm">
              {/* Overview */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-1.5">
                  Executive Overview
                </h4>
                {isEditing && editedNote ? (
                  <textarea
                    rows={3}
                    value={editedNote.overview}
                    onChange={(e) => setEditedNote({ ...editedNote, overview: e.target.value })}
                    className="w-full p-3 rounded-xl border border-indigo-400 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                ) : (
                  <p className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activeNoteModal.overview}
                  </p>
                )}
              </div>

              {/* Core Definitions */}
              {activeNoteModal.definitions && activeNoteModal.definitions.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                    Core Definitions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeNoteModal.definitions.map((def, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                      >
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{def.term}: </span>
                        <span className="text-slate-600 dark:text-slate-300">{def.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Points */}
              {activeNoteModal.keyPoints && activeNoteModal.keyPoints.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                    Key Principles
                  </h4>
                  <ul className="space-y-1.5">
                    {activeNoteModal.keyPoints.map((kp, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Deep Dive Sections */}
              {activeNoteModal.deepDiveSections && activeNoteModal.deepDiveSections.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                    Deep Dive Analysis
                  </h4>
                  {activeNoteModal.deepDiveSections.map((sec, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850">
                      <h5 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                        {sec.heading}
                      </h5>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-2">
                        {sec.content}
                      </p>
                      {sec.example && (
                        <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/40 text-xs text-slate-700 dark:text-slate-300 border-l-2 border-indigo-500">
                          <strong>Example: </strong>{sec.example}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Memory Hook */}
              {activeNoteModal.mnemonicOrMemoryHook && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60">
                  <span className="font-bold text-amber-900 dark:text-amber-300">💡 Mnemonic: </span>
                  <span className="text-slate-700 dark:text-slate-300">{activeNoteModal.mnemonicOrMemoryHook}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
