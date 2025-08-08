import React from 'react';

const WelcomePage = ({ setPage }) => (
  <div className="bg-slate-800 p-8 rounded-lg shadow-lg text-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-white mb-4">
        📚 Study App
      </h1>
      <p className="text-xl text-slate-300 mb-8">
        Create interactive study sets with quizzes and flashcards using AI
      </p>
      <button
        onClick={() => setPage('options')}
        className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors shadow-lg"
      >
        Get Started
      </button>
    </div>
  </div>
);

export default WelcomePage;