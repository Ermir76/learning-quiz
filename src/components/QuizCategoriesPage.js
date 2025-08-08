import React from 'react';

const QuizCategoriesPage = ({ setPage, setSelectedCategory, categories, quizzes, progress = {} }) => (
  <div className="bg-slate-800 p-8 rounded-lg shadow-lg max-w-6xl w-full">
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-4xl font-bold text-white">📚 Study Library</h1>
      <button
        onClick={() => setPage('options')}
        className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors"
      >
        ← Back
      </button>
    </div>
    
    <p className="text-slate-300 text-lg mb-8 text-center">
      Choose a subject to browse your study sets
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <div
            key={category.id}
            onClick={() => {
              setSelectedCategory(category);
              setPage('categoryQuizList');
            }}
            className="bg-slate-700 p-6 rounded-2xl shadow-md hover:shadow-xl hover:bg-slate-600 transition-all duration-300 cursor-pointer flex flex-col"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                 <div className="bg-slate-800 p-3 rounded-lg text-slate-300">{category.icon}</div>
                 <h3 className="text-xl font-bold text-slate-200">{category.name}</h3>
              </div>
              {totalAttempts > 0 && (
                <div className="text-right">
                  <div className="text-xs text-slate-400">Avg: {averageScore}%</div>
                  {masteredCount > 0 && (
                    <div className="text-xs text-green-400">✓ {masteredCount} mastered</div>
                  )}
                </div>
              )}
            </div>
            <p className="text-slate-300 mb-6 flex-grow">{category.description}</p>
            <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">{quizCount} quiz{quizCount !== 1 ? 'zes' : ''}</span>
                <span className="font-semibold text-indigo-400">Öppna →</span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default QuizCategoriesPage;