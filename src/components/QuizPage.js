import React, { useState } from 'react';
import LaTeXRenderer from './LaTeXRenderer';

const QuizPage = ({ setPage, quiz, setResults, isPreview = false, saveProgress }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [codeInputAnswer, setCodeInputAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [currentAnswerCorrect, setCurrentAnswerCorrect] = useState(false); // Track if current answer is correct

  const question = quiz.questions[currentQuestionIndex];
  // Convert correctAnswer to number for multiple-choice questions (stored as string in DB)
  const correctAnswerIndex = question.type === 'multiple-choice' ? parseInt(question.correctAnswer, 10) : question.correctAnswer;

  const handleAnswer = (answerIndex) => {
    if (isAnswered) return;

    const isCorrect = answerIndex === correctAnswerIndex;
    setSelectedAnswer(answerIndex);
    setCurrentAnswerCorrect(isCorrect);
    setIsAnswered(true);
    if (!isPreview) {
        setUserAnswers(ua => [...ua, { type: question.type, questionText: question.text, selected: question.options[answerIndex], correct: question.options[correctAnswerIndex], isCorrect, explanation: question.explanation, learnMoreUrl: question.learnMoreUrl }]);
    }
  };

  const handleCodeSubmit = () => {
    if (isAnswered || !codeInputAnswer.trim()) return;

    setIsAnswered(true);
    if (!isPreview) {
        // More careful normalization for code comparison
        const normalize = (str) => {
          return str
            .trim()                          // Remove leading/trailing whitespace
            .replace(/\s+/g, ' ')           // Normalize multiple spaces to single space
            .toLowerCase();                 // Convert to lowercase
        };
        
        const userCode = normalize(codeInputAnswer);
        const correctCode = normalize(question.correctAnswer);
        
        // Primary comparison: exact match after normalization
        let isCorrect = userCode === correctCode;
        
        // Secondary comparison: only if quotes might be the issue
        if (!isCorrect) {
          // Normalize quotes only if both contain quotes
          if (userCode.includes('"') || userCode.includes("'") || correctCode.includes('"') || correctCode.includes("'")) {
            const normalizeQuotes = (str) => str.replace(/['"]/g, '"');
            const userWithNormalizedQuotes = normalizeQuotes(userCode);
            const correctWithNormalizedQuotes = normalizeQuotes(correctCode);
            isCorrect = userWithNormalizedQuotes === correctWithNormalizedQuotes;
          }
        }
        
        console.log('Code comparison debug:', {
          userInput: codeInputAnswer,
          expectedAnswer: question.correctAnswer,
          userNormalized: userCode,
          correctNormalized: correctCode,
          isCorrect
        });
        
        setCurrentAnswerCorrect(isCorrect);
        setUserAnswers(ua => [...ua, { type: question.type, questionText: question.text, selected: codeInputAnswer, correct: question.correctAnswer, isCorrect, explanation: question.explanation, learnMoreUrl: question.learnMoreUrl }]);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setCodeInputAnswer('');
      setCurrentAnswerCorrect(false); // Reset correctness for next question
    } else {
      if (!isPreview) {
        // Calculate score before saving progress
        const score = userAnswers.filter(answer => answer.isCorrect).length;
        const totalQuestions = quiz.questions.length;
        
        // Save progress if saveProgress function is provided
        if (saveProgress && quiz.id) {
          saveProgress(quiz.id, score, totalQuestions);
        }
        
        setResults(userAnswers);
        setPage('results');
      }
    }
  };
  
  const getButtonClass = (index) => {
    if (!isAnswered) {
      return 'bg-surface-100 hover:bg-surface-200 border-surface-300 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:border-slate-600 dark:text-slate-200';
    }
    if (index === correctAnswerIndex) {
      return 'bg-green-100 border-green-300 text-green-800 dark:bg-green-700 dark:border-green-600 dark:text-white scale-[1.02]';
    }
    if (index === selectedAnswer) {
      return 'bg-red-100 border-red-300 text-red-800 dark:bg-red-700 dark:border-red-600 dark:text-white';
    }
    return 'bg-surface-50 border-surface-200 text-slate-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400 opacity-60';
  };

  return (
    <div className="app-shell min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <button onClick={() => setPage('categoryQuizList')} className="btn-quiet !px-3 !py-1 text-xs">← Back</button>
          <div className="text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400">Question {currentQuestionIndex + 1} / {quiz.questions.length}</div>
        </div>
        <div className="card p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 leading-snug"><LaTeXRenderer text={question.text} /></h2>
          </div>
          {question.type === 'code-input' ? (
            <div className="space-y-4">
              <textarea
                value={codeInputAnswer}
                onChange={(e) => setCodeInputAnswer(e.target.value)}
                disabled={isAnswered}
                className="w-full h-44 rounded-lg border bg-white dark:bg-slate-800/70 border-surface-300 dark:border-slate-600 focus:border-accent focus:ring-2 focus:ring-accent/40 px-4 py-3 font-mono text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400"
                placeholder="Write your code here..."
              />
              {!isAnswered && (
                <button
                  onClick={handleCodeSubmit}
                  disabled={!codeInputAnswer.trim()}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >Submit Answer</button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={isAnswered}
                  className={`w-full text-left rounded-xl border px-5 py-4 text-base font-medium transition shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/40 ${getButtonClass(index)}`}
                >
                  <LaTeXRenderer text={option} />
                </button>
              ))}
            </div>
          )}
          {isAnswered && (
            <div className={`mt-6 rounded-lg border px-5 py-4 text-sm leading-relaxed ${currentAnswerCorrect ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/40 dark:border-green-700 dark:text-green-200' : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/40 dark:border-red-700 dark:text-red-200'}`}>
              <h3 className="font-semibold mb-2">{currentAnswerCorrect ? 'Correct!' : 'Incorrect'}</h3>
              {question.explanation && (
                <p className="text-slate-700 dark:text-slate-300"><LaTeXRenderer text={question.explanation} /></p>
              )}
            </div>
          )}
          {isAnswered && (
            <button
              onClick={handleNext}
              className="btn-secondary w-full mt-8 font-semibold"
            >{currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;