import React, { useState, useEffect } from 'react';
import QuizPage from './QuizPage'; // To allow previewing the quiz
import { EyeIcon } from './Icons';

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
      <div className="app-shell min-h-screen px-6 py-10">
        <div className="max-w-5xl mx-auto animate-fade-in">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => setIsPreviewing(false)} className="btn-quiet !px-3 !py-1 text-xs">← Back to Review</button>
          </div>
          <QuizPage quiz={quizToReview} setResults={() => {} } setPage={() => {} } isPreview={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell min-h-screen px-6 py-10">
      <div className="max-w-xl mx-auto card p-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-900 dark:text-slate-100"><EyeIcon className="w-7 h-7 text-accent" /> Review Study Set</h1>
          <button onClick={() => setPage('createQuiz')} className="btn-quiet !px-3 !py-1 text-xs">← Back</button>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 text-center">Review and customize your study set before saving</p>
        <div className="space-y-5">
          <div>
            <label htmlFor="quizTitleInput" className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Study Set Title</label>
            <input id="quizTitleInput" type="text" value={quizToReview.title} onChange={(e)=>setQuizToReview({...quizToReview,title:e.target.value})} className="input" />
          </div>
          <div>
            <label htmlFor="categorySelect" className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Select Category</label>
            <select id="categorySelect" value={selectedCategoryId} onChange={handleCategoryChange} className="input">
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="tagsInput" className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Edit Tags (comma-separated)</label>
            <input id="tagsInput" type="text" value={editedTags} onChange={handleTagChange} placeholder="e.g., Python, Data Structures, Beginner" className="input" />
          </div>
        </div>
        <div className="flex gap-4 justify-center pt-4">
          <button onClick={handleSaveQuiz} className="btn-primary px-6">Save Study Set</button>
          <button onClick={() => setIsPreviewing(true)} className="btn-secondary px-6">Preview Study Set</button>
        </div>
      </div>
    </div>
  );
};

export default ReviewQuizPage;
