import React from 'react';
import { LibraryIcon } from './Icons';

const QuizCategoriesPage = ({ setPage, setSelectedCategory, categories, quizzes, progress = {} }) => (
  <div className="app-shell min-h-screen px-6 py-12">
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-3 text-4xl font-semibold text-slate-900 dark:text-slate-100"><LibraryIcon className="w-10 h-10 text-accent" /> Study Library</h1>
        <button onClick={() => setPage('options')} className="btn-quiet !px-4 !py-2 text-sm">← Back</button>
      </div>
      <p className="text-slate-600 dark:text-slate-400 text-sm text-center">Choose a subject to browse your study sets</p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {categories.map(category => {
        const categoryQuizzes = Object.values(quizzes).filter(q => q.categoryId === category.id);
        const quizCount = categoryQuizzes.length;
        
        // Calculate category progress
        const categoryProgress = categoryQuizzes.map(quiz => progress[quiz.id] || { averageScore: 0, attempts: 0 });
        const totalAttempts = categoryProgress.reduce((sum, p) => sum + p.attempts, 0);
        const averageScore = totalAttempts > 0 
          ? Math.round(categoryProgress.reduce((sum, p) => sum + (p.averageScore * p.attempts), 0) / totalAttempts)
          : 0;
        const masteredCount = categoryProgress.filter(p => p.averageScore >= 95).length;
        
        return (
          <div key={category.id} onClick={() => { setSelectedCategory(category); setPage('categoryQuizList'); }} className="card p-6 cursor-pointer group relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-xl bg-accent text-white flex items-center justify-center shadow-glow text-sm font-semibold">{category.icon || category.name[0]}</div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 group-hover:text-accent-strong dark:group-hover:text-white transition">{category.name}</h3>
              </div>
              {totalAttempts > 0 && (
                <div className="text-right space-y-0.5">
                  <div className="text-[10px] font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase">Avg</div>
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-200">{averageScore}%</div>
                  {masteredCount > 0 && <div className="text-[10px] text-green-600 dark:text-green-300 font-medium">{masteredCount} mastered</div>}
                </div>
              )}
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm flex-grow leading-relaxed">{category.description}</p>
            <div className="flex justify-between items-center text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400">
              <span>{quizCount} quiz{quizCount !== 1 ? 'zes' : ''}</span>
              <span className="flex items-center gap-1 text-accent group-hover:translate-x-1 transition">Open <span>→</span></span>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  </div>
);

export default QuizCategoriesPage;