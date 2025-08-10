import React from 'react';

const OptionsPage = ({ setPage }) => (
  <div className="app-shell min-h-screen px-6 py-14">
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
      <div className="text-center space-y-4">
        <h1 className="heading-display text-5xl md:text-6xl text-slate-900 dark:text-slate-100 tracking-tight">📚 Study Hub</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm md:text-base">Choose how you want to learn today. Build new study sets or dive into your library to reinforce knowledge.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <button onClick={() => setPage('createQuiz')} className="card group relative overflow-hidden p-10 text-left">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
            <div className="flex items-start justify-between mb-6">
              <div className="h-12 w-12 rounded-xl bg-accent text-white flex items-center justify-center text-2xl font-semibold shadow-glow">✏️</div>
              <span className="badge-soft text-[10px] uppercase tracking-wide">Create</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Create Study Set</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Generate interactive quizzes and flashcards from text, URLs, PDFs, or images using AI.</p>
            <div className="mt-6 flex items-center gap-2 text-accent font-medium text-sm">Start Building <span className="transition group-hover:translate-x-1">→</span></div>
        </button>
        <button onClick={() => setPage('quizCategories')} className="card group relative overflow-hidden p-10 text-left">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
            <div className="flex items-start justify-between mb-6">
              <div className="h-12 w-12 rounded-xl bg-accent text-white flex items-center justify-center text-2xl font-semibold shadow-glow">📚</div>
              <span className="badge-soft text-[10px] uppercase tracking-wide">Library</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Study Library</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">Browse and study from your saved study sets with quiz and flashcard modes.</p>
            <div className="mt-6 flex items-center gap-2 text-accent font-medium text-sm">Browse Sets <span className="transition group-hover:translate-x-1">→</span></div>
        </button>
      </div>
    </div>
  </div>
);

export default OptionsPage;