import React, { useState } from 'react';

const CategoryQuizListPage = ({ setPage, setSelectedQuiz, category, quizzes, deleteQuiz, progress = {} }) => {
  const [filterTags, setFilterTags] = useState([]);
  
  // Function to get progress color based on combined score
  const getProgressColor = (progress) => {
    const combinedScore = getCombinedScore(progress);
    if (combinedScore >= 95) return 'bg-green-600'; // Mastered - Dark Green
    if (combinedScore >= 71) return 'bg-green-400'; // Good - Light Green
    if (combinedScore >= 41) return 'bg-yellow-500'; // Improving - Yellow
    if (combinedScore > 0) return 'bg-red-500'; // Needs work - Red
    return 'bg-gray-600'; // Not attempted - Gray
  };

  // Calculate combined knowledge score from quiz and flashcard performance
  const getCombinedScore = (progress) => {
    if (!progress) return 0;
    
    const { 
      averageScore = 0, 
      averageFlashcardScore = 0, 
      attempts = 0, 
      flashcardAttempts = 0,
      isMastered = false 
    } = progress;

    // If marked as mastered, return high score
    if (isMastered) return 100;
    
    // If no attempts at all, return 0
    if (attempts === 0 && flashcardAttempts === 0) return 0;
    
    // Calculate weighted average
    // Give slightly more weight to quiz scores (60%) vs flashcards (40%)
    // since quizzes are more rigorous testing
    
    // If only one type of attempt exists, use that score
    if (attempts === 0) return averageFlashcardScore;
    if (flashcardAttempts === 0) return averageScore;
    
    // Combined weighted score - Fixed: Simple 60%/40% weighting
    return Math.round((averageScore * 0.6) + (averageFlashcardScore * 0.4));
  };

  const getProgressText = (progress) => {
    if (!progress) return 'Not attempted';
    
    const { isMastered = false, attempts = 0, flashcardAttempts = 0 } = progress;
    
    if (isMastered) return 'MASTERED';
    if (attempts === 0 && flashcardAttempts === 0) return 'Not attempted';
    
    const combinedScore = getCombinedScore(progress);
    
    // Show only percentage in progress badge (remove session count)
    return `${combinedScore}%`;
  };
  
  const allTags = [...new Set(Object.values(quizzes).filter(q => q.categoryId === category.id).flatMap(q => q.tags))];

  const categoryQuizzes = Object.values(quizzes).filter(q => 
      q.categoryId === category.id &&
      (filterTags.length === 0 || filterTags.every(tag => q.tags.includes(tag)))
  );

  const toggleTag = (tag) => {
    setFilterTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="app-shell min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex-1 space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-surface-200/60 border border-surface-300/40 backdrop-blur-xl w-fit text-xs tracking-wide font-semibold uppercase text-slate-400">
              <span className="h-2 w-2 rounded-full bg-accent" /> Category
            </div>
            <h1 className="heading-display text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-br from-slate-100 via-slate-300 to-slate-100 drop-shadow-sm">
              {category.name}
            </h1>
            <p className="text-slate-400 max-w-prose leading-relaxed text-sm md:text-base">
              {category.description}
            </p>
          </div>
          <div className="flex gap-4 animate-fade-in md:justify-end">
            <button onClick={() => setPage('quizCategories')} className="btn-quiet">Back</button>
            <button onClick={() => setPage('createQuiz')} className="btn-secondary">New Quiz</button>
          </div>
        </div>

        <div className="card space-y-5 animate-scale-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-sm font-semibold tracking-wide text-slate-400 uppercase">Filter</h2>
            {filterTags.length > 0 && (
              <button onClick={() => setFilterTags([])} className="btn-quiet !px-3 !py-1 text-xs">Reset</button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => {
              const active = filterTags.includes(tag);
              return (
                <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide transition border ${active ? 'bg-accent text-white border-accent shadow-glow' : 'bg-surface-200/70 border-surface-300/40 text-slate-300 hover:border-accent/40 hover:text-slate-200'}`}>{tag}</button>
              );
            })}
            {allTags.length === 0 && (
              <span className="text-xs text-slate-500 italic">No tags yet.</span>
            )}
          </div>
        </div>

        {categoryQuizzes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categoryQuizzes.map(quiz => {
              const quizProgress = progress[quiz.id] || { averageScore: 0, attempts: 0, isMastered: false, averageFlashcardScore: 0, flashcardAttempts: 0 };
              const progressColor = getProgressColor(quizProgress);
              const progressText = getProgressText(quizProgress);
              const mastered = quizProgress.isMastered;
              return (
                <div key={quiz.id} className="card group relative overflow-hidden flex flex-col">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-accent/10 via-transparent to-transparent pointer-events-none" />
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display text-lg font-semibold tracking-tight text-slate-100 group-hover:text-white transition">{quiz.title}</h3>
                    <div className={`badge ${progressColor} shadow-md`}>{progressText}</div>
                  </div>
                  <p className="text-sm text-slate-400 flex-1 leading-relaxed line-clamp-4">{quiz.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {quiz.tags.map(tag => <span key={tag} className="badge-soft text-[10px] tracking-wide">{tag}</span>)}
                  </div>
                  {(quizProgress.attempts > 0 || quizProgress.flashcardAttempts > 0) && (
                    <div className="mt-4 text-[10px] uppercase tracking-wide font-medium text-slate-500 flex flex-wrap gap-x-2 gap-y-1">
                      {quizProgress.attempts > 0 && <span>{quizProgress.attempts} Quiz</span>}
                      {quizProgress.flashcardAttempts > 0 && <span>{quizProgress.flashcardAttempts} Flashcard</span>}
                      {quizProgress.lastAttempt && <span className="text-slate-600">{new Date(quizProgress.lastAttempt).toLocaleDateString()}</span>}
                      {mastered && <span className="text-accent">Mastered</span>}
                    </div>
                  )}
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <button onClick={() => { setSelectedQuiz(quiz); setPage('quiz'); }} className="btn-primary !py-2 !text-xs">Quiz</button>
                    <button onClick={() => { setSelectedQuiz(quiz); setPage('flashcard'); }} className="btn-secondary !py-2 !text-xs">Cards</button>
                    <button onClick={() => deleteQuiz(quiz.id)} className="btn-danger !py-2 !text-xs">Del</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 card animate-fade-in">
            <p className="text-slate-500 text-sm">No study sets match current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryQuizListPage;