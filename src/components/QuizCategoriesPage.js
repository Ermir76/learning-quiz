import React from 'react';
import { CodeIcon, HistoryIcon, ScienceIcon } from './Icons';

const QuizCategoriesPage = ({ setPage, setSelectedCategory, categories, quizzes }) => (
  <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
    <h2 className="text-3xl font-bold mb-8 text-slate-200">Mina Samlingar</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {categories.map(category => {
        const quizCount = Object.values(quizzes).filter(q => q.categoryId === category.id).length;
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
            </div>
            <p className="text-slate-300 mb-6 flex-grow">{category.description}</p>
            <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">{quizCount} quiz</span>
                <span className="font-semibold text-indigo-400">Öppna →</span>
            </div>
          </div>
        );
      })}
    </div>
     <button onClick={() => setPage('options')} className="mt-8 text-slate-300 hover:text-slate-100 py-2 rounded-lg">
        Back
      </button>
  </div>
);

export default QuizCategoriesPage;