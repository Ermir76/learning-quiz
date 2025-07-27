import React, { useState } from 'react';

const CreateQuizPage = ({ setPage, addQuiz, setSelectedCategory, categories, setGeneratedQuiz }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      // This now calls our simple, text-only backend helper.
      const response = await fetch('/api/generateQuiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: text, numQuestions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate quiz.');
      }

      const { quiz, category: categoryName } = await response.json();
      
      const category = categories.find(cat => cat.name === categoryName);

      if (!category) {
        throw new Error(`Received an unknown category from the AI: ${categoryName}`);
      }

      const newQuiz = {
        ...quiz,
        id: `ai_${new Date().getTime()}`,
        categoryId: category.id,
      };

      setGeneratedQuiz(newQuiz); // Pass the new quiz to App.js
      setSelectedCategory(category); // Still set the category for context
      setPage('reviewQuiz'); // Go to the new review page

    } catch (error) {
      console.error("Error generating quiz:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-slate-200">Create a Quiz</h2>
      <p className="text-slate-300 mb-6 text-center">Enter a topic, and our AI will generate a quiz for you.</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition bg-slate-700 text-slate-200 placeholder-slate-400 mb-4"
        placeholder="Paste the text you want to create a quiz from..."
      />
      <div className="mb-4">
        <label htmlFor="numQuestions" className="block text-slate-300 text-sm font-bold mb-2">Number of Questions:</label>
        <input
          type="number"
          id="numQuestions"
          value={numQuestions}
          onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
          min="1"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition bg-slate-700 text-slate-200"
        />
      </div>
      <button
        onClick={handleGenerate}
        disabled={isLoading || !text.trim()}
        className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Generating...' : 'Generate Quiz'}
      </button>
       <button onClick={() => setPage('options')} className="mt-4 w-full text-slate-300 hover:text-slate-100 py-2 rounded-lg">
        Back
      </button>
    </div>
  );
};

export default CreateQuizPage;
