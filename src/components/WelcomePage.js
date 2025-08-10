import React from 'react';
import { QuizIcon, FlashcardsIcon, SparkleIcon, ChartIcon, EyeIcon, DocumentArrowUpIcon } from './Icons';

const WelcomePage = ({ setPage }) => {
  const features = [
    { label: 'Quiz Engine', subtitle: 'Timed questions', icon: <QuizIcon className="w-5 h-5" /> },
    { label: 'Flashcards', subtitle: 'Active recall', icon: <FlashcardsIcon className="w-5 h-5" /> },
    { label: 'AI Generate', subtitle: 'Create sets', icon: <SparkleIcon className="w-5 h-5" /> },
    { label: 'Progress', subtitle: 'Track mastery', icon: <ChartIcon className="w-5 h-5" /> },
    { label: 'Review Mode', subtitle: 'Weak spots', icon: <EyeIcon className="w-5 h-5" /> },
    { label: 'Export', subtitle: 'Save / share', icon: <DocumentArrowUpIcon className="w-5 h-5" /> }
  ];

  return (
    <div className="app-shell flex items-center justify-center px-6 py-16">
      <div className="max-w-4xl w-full animate-fade-in">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="heading-display text-5xl md:text-6xl text-slate-900 dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-br dark:from-accent-soft dark:via-accent dark:to-accent-strong drop-shadow-sm">
                Study Platform
              </h1>
              <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed max-w-prose">
                Generate focused quizzes and active-recall flashcards. Build mastery through adaptive repetition and clear progress insights.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => setPage('options')} className="btn-primary px-7 py-3 text-base font-semibold">Start Learning</button>
              <button onClick={() => setPage('quizCategories')} className="btn-quiet px-7 py-3 text-base font-medium">Browse Subjects</button>
            </div>
            <div className="divider" />
            <ul className="grid gap-3 text-sm text-slate-400 md:max-w-sm">
              <li className="flex items-start gap-3 text-slate-700 dark:text-slate-400"><span className="mt-1 h-2 w-2 rounded-full bg-accent" />Adaptive quiz + flashcard weighting</li>
              <li className="flex items-start gap-3 text-slate-700 dark:text-slate-400"><span className="mt-1 h-2 w-2 rounded-full bg-accent" />Instant AI-powered set generation</li>
              <li className="flex items-start gap-3 text-slate-700 dark:text-slate-400"><span className="mt-1 h-2 w-2 rounded-full bg-accent" />Progress mastery tracking</li>
            </ul>
          </div>
          <div className="relative group hidden md:block">
            <div className="absolute inset-0 blur-3xl opacity-40 group-hover:opacity-60 transition duration-700 bg-gradient-to-br from-accent/30 via-indigo-700/20 to-transparent rounded-full" />
            <div className="relative aspect-square w-full max-w-md mx-auto grid grid-cols-2 gap-6 p-6">
              {features.map((f, i) => (
                <div
                  key={f.label}
                  className="group/card card flex flex-col items-start justify-between text-left p-4 overflow-hidden relative animate-scale-in focus:outline-none ring-0 transition-shadow hover:shadow-glow"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition duration-500 bg-gradient-to-br from-accent/10 via-transparent to-transparent pointer-events-none" />
                  <div className="relative w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                    {f.icon}
                  </div>
                  <div className="relative mt-4 space-y-1">
                    <div className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100 leading-snug group-hover/card:text-accent-strong dark:group-hover/card:text-accent-soft transition-colors">{f.label}</div>
                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">{f.subtitle}</div>
                  </div>
                  <div className="relative mt-4 flex items-center gap-1 text-[10px] tracking-wider font-semibold text-accent opacity-0 group-hover/card:opacity-100 transition-all translate-y-1 group-hover/card:translate-y-0">View <span>→</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;