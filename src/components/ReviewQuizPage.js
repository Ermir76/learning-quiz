import React, { useState, useEffect } from 'react';
import QuizPage from './QuizPage'; // To allow previewing the quiz

const ReviewQuizPage = ({ setPage, generatedQuiz, addQuiz, categories, setSelectedCategory }) => {
  const [quizToReview, setQuizToReview] = useState(generatedQuiz);
  const [selectedCategoryId, setSelectedCategoryId] = useState(generatedQuiz?.categoryId || '');
  const [editedTags, setEditedTags] = useState(generatedQuiz?.tags?.join(', ') || '');
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    if (!generatedQuiz) {
      // If no study set is generated, go back to create study set page
      setPage('createQuiz');
    } else {
      setQuizToReview(generatedQuiz);
      setSelectedCategoryId(generatedQuiz.categoryId);
      setEditedTags(generatedQuiz.tags.join(', '));
    }
  }, [generatedQuiz, setPage]);

  if (!quizToReview) {
    return <div className="text-slate-200">Loading study set for review...</div>;
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-white">👀 Review Study Set</h1>
        <button
          onClick={() => setPage('createQuiz')}
          className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors"
        >
          ← Back to Create
        </button>
      </div>
      
      <p className="text-slate-300 text-lg mb-8 text-center">
        Review and customize your study set before saving
      </p>

      <div className="mb-4">
        <label htmlFor="quizTitleInput" className="block text-xl font-semibold mb-2">Study Set Title:</label>
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

      <div className="flex gap-4 justify-center">
        <button
          onClick={handleSaveQuiz}
          className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Save Study Set
        </button>
        <button
          onClick={() => setIsPreviewing(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          {isPreviewing ? 'Stop Preview' : 'Preview Study Set'}
        </button>
      </div>
    </div>
  );
};

export default ReviewQuizPage;
