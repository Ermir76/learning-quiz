import React, { useState, useEffect } from 'react';
import WelcomePage from './components/WelcomePage';
import OptionsPage from './components/OptionsPage';
import CreateQuizPage from './components/CreateQuizPage';
import QuizCategoriesPage from './components/QuizCategoriesPage';
import CategoryQuizListPage from './components/CategoryQuizListPage';
import QuizPage from './components/QuizPage';
import FlashcardPage from './components/FlashcardPage';
import ResultsPage from './components/ResultsPage';
import ReviewQuizPage from './components/ReviewQuizPage';
import BugReporter from './components/BugReporter';
import SettingsSidebar from './components/SettingsSidebar';
import { SettingsIcon } from './components/Icons';
import { initialCategoriesData } from './data/initialData';

function App() {
  const [page, setPage] = useState('welcome');
  const categories = initialCategoriesData;

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    primaryScraper: 'puppeteer',
    fallbackScraper: 'apify',
    scraperTimeout: 30000,
    enableFallback: true
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('quizAppSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const [quizzes, setQuizzes] = useState({});
  const [progress, setProgress] = useState({});

  // Fetch quizzes from backend on mount
  useEffect(() => {
    // Fetch both quizzes and progress data
    Promise.all([
      fetch('/api/quizzes').then(res => res.json()),
      fetch('/api/progress').then(res => res.json())
    ])
      .then(([quizData, progressData]) => {
        // Convert array to object with id as key for compatibility
        const quizObj = {};
        if (quizData.quizzes) {
          for (const quiz of quizData.quizzes) {
            quizObj[quiz.id] = quiz;
          }
        }
        setQuizzes(quizObj);
        setProgress(progressData.progress || {});
      })
      .catch(err => {
        console.error('Failed to fetch data:', err);
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


  // Save quiz progress when user completes a quiz or flashcard session
  const saveProgress = (quizId, score, totalQuestions, sessionType = 'quiz') => {
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId, score, totalQuestions, sessionType })
    })
      .then(res => res.json())
      .then(() => {
        // Refresh progress data after saving
        fetch('/api/progress')
          .then(res => res.json())
          .then(data => {
            setProgress(data.progress || {});
          })
          .catch(err => console.error('Failed to refresh progress:', err));
      })
      .catch(err => {
        console.error('Failed to save progress:', err);
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
        return <CreateQuizPage setPage={setPage} addQuiz={addQuiz} setSelectedCategory={setSelectedCategory} categories={categories} setGeneratedQuiz={setGeneratedQuiz} settings={settings} />;
      case 'quizCategories':
        return <QuizCategoriesPage setPage={setPage} setSelectedCategory={setSelectedCategory} categories={categories} quizzes={quizzes} progress={progress} />;
      case 'categoryQuizList':
        return <CategoryQuizListPage setPage={setPage} setSelectedQuiz={setSelectedQuiz} category={selectedCategory} quizzes={quizzes} deleteQuiz={deleteQuiz} progress={progress} />;
      case 'quiz':
        return <QuizPage setPage={setPage} quiz={selectedQuiz} setResults={setResults} saveProgress={saveProgress} />;
      case 'flashcard':
        return <FlashcardPage setPage={setPage} quiz={selectedQuiz} setResults={setResults} saveProgress={saveProgress} />;
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
      {/* Settings Button */}
      <button 
        onClick={() => setShowSettings(true)}
        className="fixed top-4 right-4 z-50 bg-slate-700 hover:bg-slate-600 p-3 rounded-full shadow-lg transition-colors"
        title="Settings"
      >
        <SettingsIcon className="w-6 h-6 text-slate-300" />
      </button>

      {/* Main Content */}
      {renderPage()}
      
      {/* Settings Sidebar */}
      <SettingsSidebar 
        show={showSettings} 
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />
      
      {/* Bug Reporter */}
      <BugReporter />
    </div>
  );
}

export default App;
