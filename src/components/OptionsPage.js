import React from 'react';

const OptionsPage = ({ setPage }) => (
  <div className="bg-slate-800 p-8 rounded-lg shadow-lg max-w-4xl w-full">
    <h1 className="text-4xl font-bold text-white text-center mb-8">
      📚 Study App
    </h1>
    
    <div className="grid md:grid-cols-2 gap-6">
      <button
        onClick={() => setPage('createQuiz')}
        className="bg-green-600 hover:bg-green-500 text-white p-8 rounded-lg transition-colors shadow-lg group"
      >
        <div className="text-4xl mb-4">✏️</div>
        <h2 className="text-2xl font-bold mb-2">Create Study Set</h2>
        <p className="text-green-100">
          Generate interactive quizzes and flashcards from text, URLs, PDFs, or images using AI
        </p>
      </button>
      
      <button
        onClick={() => setPage('quizCategories')}
        className="bg-purple-600 hover:bg-purple-500 text-white p-8 rounded-lg transition-colors shadow-lg group"
      >
        <div className="text-4xl mb-4">📚</div>
        <h2 className="text-2xl font-bold mb-2">Study Library</h2>
        <p className="text-purple-100">
          Browse and study from your saved study sets with quiz and flashcard modes
        </p>
      </button>
    </div>
  </div>
);

export default OptionsPage;