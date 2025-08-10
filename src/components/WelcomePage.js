import React from 'react';

const WelcomePage = ({ setPage }) => {
  return (
    <div className="app-shell flex items-center justify-center px-6 py-16">
      <div className="max-w-4xl w-full animate-fade-in">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="heading-display text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-br from-accent-soft via-accent to-accent-strong drop-shadow-sm">
                Study Platform
              </h1>
              <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-prose">
                Generate focused quizzes and active-recall flashcards. Build mastery through adaptive repetition and clear progress insights.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => setPage('options')} className="btn-primary px-7 py-3 text-base font-semibold">Start Learning</button>
              <button onClick={() => setPage('quizCategories')} className="btn-quiet px-7 py-3 text-base font-medium">Browse Subjects</button>
            </div>
            <div className="divider" />
            <ul className="grid gap-3 text-sm text-slate-400 md:max-w-sm">
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-accent" />Adaptive quiz + flashcard weighting</li>
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-accent" />Instant AI-powered set generation</li>
              <li className="flex items-start gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-accent" />Progress mastery tracking</li>
            </ul>
          </div>
          <div className="relative group hidden md:block">
            <div className="absolute inset-0 blur-3xl opacity-40 group-hover:opacity-60 transition duration-700 bg-gradient-to-br from-accent/30 via-indigo-700/20 to-transparent rounded-full" />
            <div className="relative aspect-square w-full max-w-md mx-auto grid grid-cols-2 gap-6 p-6">
              {['Quiz Engine','Flashcards','AI Generate','Progress','Review Mode','Export'].map((label,i)=> (
                <div key={label} className="card flex items-center justify-center text-center text-sm font-medium tracking-tight animate-scale-in" style={{animationDelay: `${i*60}ms`}}>
                  <span className="text-slate-200/90 select-none">{label}</span>
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