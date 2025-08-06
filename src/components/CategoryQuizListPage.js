import React, { useState } from 'react';

const CategoryQuizListPage = ({ setPage, setSelectedQuiz, category, quizzes, deleteQuiz, progress = {} }) => {
  const [filterTags, setFilterTags] = useState([]);
  
  // Function to get progress color based on score
  const getProgressColor = (score) => {
    if (score >= 95) return 'bg-green-600'; // Mastered - Dark Green
    if (score >= 71) return 'bg-green-400'; // Good - Light Green
    if (score >= 41) return 'bg-yellow-500'; // Improving - Yellow
    if (score > 0) return 'bg-red-500'; // Needs work - Red
    return 'bg-gray-600'; // Not attempted - Gray
  };

  const getProgressText = (score, isMastered) => {
    if (isMastered) return 'MASTERED';
    if (score === 0) return 'Not attempted';
    return `${score}% avg`;
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
      <button onClick={() => setPage('quizCategories')} className="text-slate-300 hover:text-slate-100 mb-4">
        &larr; Back to Categories
      </button>
      <h2 className="text-3xl font-bold mb-2 flex items-center text-slate-200">
        <div className="bg-slate-700 p-2 rounded-lg mr-4 text-slate-300">{category.icon}</div>
        {category.name}
      </h2>
      
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
            const quizProgress = progress[quiz.id] || { averageScore: 0, attempts: 0, isMastered: false };
            const progressColor = getProgressColor(quizProgress.averageScore);
            const progressText = getProgressText(quizProgress.averageScore, quizProgress.isMastered);
            
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
                {quizProgress.attempts > 0 && (
                  <div className="text-xs text-slate-400 mb-3">
                    Attempts: {quizProgress.attempts} | Last played: {new Date(quizProgress.lastAttempt).toLocaleDateString()}
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
        <p className="text-slate-400 text-center mt-8">No quizzes found with the selected tags.</p>
      )}
    </div>
  );
};

export default CategoryQuizListPage;