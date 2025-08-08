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
    const totalAttempts = attempts + flashcardAttempts;
    
    // If only one type of attempt exists, use that score
    if (attempts === 0) return averageFlashcardScore;
    if (flashcardAttempts === 0) return averageScore;
    
    // Combined weighted score
    const weightedQuizScore = (averageScore * attempts * 0.6) / totalAttempts;
    const weightedFlashcardScore = (averageFlashcardScore * flashcardAttempts * 0.4) / totalAttempts;
    
    return Math.round(weightedQuizScore + weightedFlashcardScore);
  };

  const getProgressText = (progress) => {
    if (!progress) return 'Not attempted';
    
    const { isMastered = false, attempts = 0, flashcardAttempts = 0 } = progress;
    
    if (isMastered) return 'MASTERED';
    if (attempts === 0 && flashcardAttempts === 0) return 'Not attempted';
    
    const combinedScore = getCombinedScore(progress);
    const totalSessions = attempts + flashcardAttempts;
    
    // Show breakdown if both types have been attempted
    if (attempts > 0 && flashcardAttempts > 0) {
      return `${combinedScore}% (${totalSessions} sessions)`;
    } else if (attempts > 0) {
      return `${combinedScore}% quiz`;
    } else {
      return `${combinedScore}% flashcard`;
    }
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
    <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {category.icon} {category.name}
            </h1>
            <p className="text-slate-300">{category.description}</p>
          </div>
          <button
            onClick={() => setPage('quizCategories')}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            ← Back to Subjects
          </button>
        </div>
      
      <div className="mb-6">
        <h4 className="font-semibold mb-2 text-slate-300">Filter by tag:</h4>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1 rounded-full text-sm font-semibold transition ${filterTags.includes(tag) ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      {categoryQuizzes.length > 0 ? (
        <div className="space-y-4">
          {categoryQuizzes.map(quiz => {
            const quizProgress = progress[quiz.id] || { averageScore: 0, attempts: 0, isMastered: false, averageFlashcardScore: 0, flashcardAttempts: 0 };
            const progressColor = getProgressColor(quizProgress);
            const progressText = getProgressText(quizProgress);
            
            return (
              <div key={quiz.id} className="bg-slate-700 p-5 rounded-lg shadow hover:shadow-lg hover:bg-slate-600 transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-slate-200">{quiz.title}</h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${progressColor}`}>
                    {progressText}
                  </div>
                </div>
                <p className="text-slate-300 my-2">{quiz.description}</p>
                <div className="flex flex-wrap gap-2 my-3">
                  {quiz.tags.map(tag => <span key={tag} className="bg-slate-600 text-slate-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">{tag}</span>)}
                </div>
                {(quizProgress.attempts > 0 || quizProgress.flashcardAttempts > 0) && (
                  <div className="text-xs text-slate-400 mb-3">
                    {quizProgress.attempts > 0 && `Quiz attempts: ${quizProgress.attempts}`}
                    {quizProgress.attempts > 0 && quizProgress.flashcardAttempts > 0 && ' | '}
                    {quizProgress.flashcardAttempts > 0 && `Flashcard sessions: ${quizProgress.flashcardAttempts}`}
                    {quizProgress.lastAttempt && ` | Last played: ${new Date(quizProgress.lastAttempt).toLocaleDateString()}`}
                  </div>
                )}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      setPage('quiz');
                    }}
                    className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    Start Quiz
                  </button>
                  <button
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      setPage('flashcard');
                    }}
                    className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    Start Flashcard
                  </button>
                  <button
                    onClick={() => deleteQuiz(quiz.id)}
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-slate-400 text-center mt-8">No study sets found with the selected tags.</p>
      )}
    </div>
  );
};

export default CategoryQuizListPage;