import React from 'react';

const OptionsPage = ({ setPage }) => (
  <div className="bg-slate-800 p-8 rounded-lg shadow-lg text-center">
    <h2 className="text-3xl font-bold mb-8 text-slate-200">What would you like to do?</h2>
    <div className="space-y-4">
      <button onClick={() => setPage('createQuiz')} className="w-full max-w-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition duration-300">
        Create a New Quiz (AI)
      </button>
      <button onClick={() => setPage('quizCategories')} className="w-full max-w-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition duration-300">
        Browse Quiz Bank
      </button>
    </div>
  </div>
);

export default OptionsPage;