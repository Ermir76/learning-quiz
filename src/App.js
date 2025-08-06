import React, { useState, useEffect } from 'react';
import WelcomePage from './components/WelcomePage';
import OptionsPage from './components/OptionsPage';
import CreateQuizPage from './components/CreateQuizPage';
import QuizCategoriesPage from './components/QuizCategoriesPage';
import CategoryQuizListPage from './components/CategoryQuizListPage';
import QuizPage from './components/QuizPage';
import ResultsPage from './components/ResultsPage';
import ReviewQuizPage from './components/ReviewQuizPage';
import { initialCategoriesData } from './data/initialData';

function App() {
  const [page, setPage] = useState('welcome');
  const categories = initialCategoriesData;


  const [quizzes, setQuizzes] = useState({});

  // Fetch quizzes from backend on mount
  useEffect(() => {
    fetch('/api/quizzes')
      .then(res => res.json())
      .then(data => {
        // Convert array to object with id as key for compatibility
        const quizObj = {};
        if (data.quizzes) {
          for (const quiz of data.quizzes) {
            quizObj[quiz.id] = quiz;
          }
        }
        setQuizzes(quizObj);
      })
      .catch(err => {
        console.error('Failed to fetch quizzes:', err);
      });
  }, []);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [generatedQuiz, setGeneratedQuiz] = useState(null); // New state for the quiz to be reviewed


  // Save quiz to backend and update state
  const addQuiz = (newQuiz) => {
    // Spara endast categoryId, ta bort category om den finns
    const quizToSave = { ...newQuiz };
    if (quizToSave.category) delete quizToSave.category;
    fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quizToSave)
    })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setQuizzes(prevQuizzes => ({
            ...prevQuizzes,
            [data.id]: { ...quizToSave, id: data.id }
          }));
        }
      })
      .catch(err => {
        console.error('Failed to save quiz:', err);
      });
  };


  // Optionally, implement delete endpoint in backend for full sync
  const deleteQuiz = (quizId) => {
    fetch(`/api/quizzes/${quizId}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (res.status === 204) {
          const newQuizzes = { ...quizzes };
          delete newQuizzes[quizId];
          setQuizzes(newQuizzes);
        } else {
          console.error('Failed to delete quiz:', res.status);
        }
      })
      .catch(err => {
        console.error('Failed to delete quiz:', err);
      });
  };

  const renderPage = () => {
    switch (page) {
      case 'welcome':
        return <WelcomePage setPage={setPage} />;
      case 'options':
        return <OptionsPage setPage={setPage} />;
      case 'createQuiz':
        // Pass down setSelectedCategory to enable a better user flow
        return <CreateQuizPage setPage={setPage} addQuiz={addQuiz} setSelectedCategory={setSelectedCategory} categories={categories} setGeneratedQuiz={setGeneratedQuiz} />;
      case 'quizCategories':
        return <QuizCategoriesPage setPage={setPage} setSelectedCategory={setSelectedCategory} categories={categories} quizzes={quizzes} />;
      case 'categoryQuizList':
        return <CategoryQuizListPage setPage={setPage} setSelectedQuiz={setSelectedQuiz} category={selectedCategory} quizzes={quizzes} deleteQuiz={deleteQuiz} />;
      case 'quiz':
        return <QuizPage setPage={setPage} quiz={selectedQuiz} setResults={setResults} />;
      case 'results':
        return <ResultsPage setPage={setPage} results={results} quiz={selectedQuiz} />;
      case 'reviewQuiz':
        // This will be our new ReviewQuizPage component
        return <ReviewQuizPage setPage={setPage} generatedQuiz={generatedQuiz} addQuiz={addQuiz} categories={categories} setSelectedCategory={setSelectedCategory} />;
      default:
        return <WelcomePage setPage={setPage} />;
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen flex items-center justify-center font-sans p-4">
      {renderPage()}
    </div>
  );
}

export default App;
