import React, { useState, useEffect } from 'react';
import QuizPage from './QuizPage'; // To allow previewing the quiz

const ReviewQuizPage = ({ setPage, generatedQuiz, addQuiz, categories, setSelectedCategory }) => {
  const [quizToReview, setQuizToReview] = useState(generatedQuiz);
  const [selectedCategoryId, setSelectedCategoryId] = useState(generatedQuiz?.categoryId || '');
  const [editedTags, setEditedTags] = useState(generatedQuiz?.tags?.join(', ') || '');
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    if (!generatedQuiz) {
      // If no quiz is generated, go back to create quiz page
      setPage('createQuiz');
    } else {
      setQuizToReview(generatedQuiz);
      setSelectedCategoryId(generatedQuiz.categoryId);
      setEditedTags(generatedQuiz.tags.join(', '));
    }
  }, [generatedQuiz, setPage]);

  if (!quizToReview) {
    return <div className="text-slate-200">Loading quiz for review...</div>;
  }

  const handleSaveQuiz = () => {
    const finalQuiz = {
      ...quizToReview,
      categoryId: selectedCategoryId,
      tags: editedTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
    };
    addQuiz(finalQuiz);
    setSelectedCategory(categories.find(cat => cat.id === selectedCategoryId));
    setPage('categoryQuizList');
  };

  const handleDiscardQuiz = () => {
    setPage('createQuiz'); // Go back to create quiz page
  };

  const handleTagChange = (e) => {
    setEditedTags(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategoryId(e.target.value);
  };

  if (isPreviewing) {
    return (
      <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
        <button onClick={() => setIsPreviewing(false)} className="text-slate-300 hover:text-slate-100 mb-4">
          &larr; Back to Review
        </button>
        <QuizPage quiz={quizToReview} setResults={() => {} } setPage={() => {} } isPreview={true} />
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md mx-auto text-slate-200">
      <h2 className="text-3xl font-bold mb-6 text-center">Review Your Quiz</h2>

      <div className="mb-4">
        <label htmlFor="quizTitleInput" className="block text-xl font-semibold mb-2">Quiz Title:</label>
        <input
          type="text"
          id="quizTitleInput"
          value={quizToReview.title}
          onChange={(e) => setQuizToReview({ ...quizToReview, title: e.target.value })}
          className="w-full p-2 rounded-lg bg-slate-700 text-slate-200 border border-slate-600 text-lg"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="categorySelect" className="block text-sm font-bold mb-2">Select Category:</label>
        <select
          id="categorySelect"
          value={selectedCategoryId}
          onChange={handleCategoryChange}
          className="w-full p-2 rounded-lg bg-slate-700 text-slate-200 border border-slate-600"
        >
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="tagsInput" className="block text-sm font-bold mb-2">Edit Tags (comma-separated):</label>
        <input
          type="text"
          id="tagsInput"
          value={editedTags}
          onChange={handleTagChange}
          className="w-full p-2 rounded-lg bg-slate-700 text-slate-200 border border-slate-600"
          placeholder="e.g., Python, Data Structures, Beginner"
        />
      </div>

      <div className="flex justify-between space-x-4">
        <button
          onClick={() => setIsPreviewing(true)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Preview Quiz
        </button>
        <button
          onClick={handleSaveQuiz}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Save Quiz
        </button>
        <button
          onClick={handleDiscardQuiz}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Discard Quiz
        </button>
      </div>
    </div>
  );
};

export default ReviewQuizPage;
