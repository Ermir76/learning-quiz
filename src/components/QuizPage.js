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
          return 'bg-slate-600 hover:bg-slate-500 border-slate-500';
      }
      if (index === correctAnswerIndex) {
          return 'bg-green-700 border-green-800 scale-105'; // Correct answer stands out
      }
      if (index === selectedAnswer) {
          return 'bg-red-700 border-red-800'; // Incorrect answer
      }
      return 'bg-slate-600 border-slate-500 opacity-50'; // Other options fade out
  }

  return (
    <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
        <div className="bg-slate-700 p-8 rounded-xl shadow-2xl">
            <div className="mb-6">
                <p className="text-sm text-slate-400">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
                <h2 className="text-2xl font-bold mt-2 text-slate-200"><LaTeXRenderer text={question.text} /></h2>
            </div>
            {question.type === 'code-input' ? (
                <div className="space-y-4">
                    <textarea
                        value={codeInputAnswer}
                        onChange={(e) => setCodeInputAnswer(e.target.value)}
                        disabled={isAnswered}
                        className="w-full h-40 p-4 rounded-lg border-2 bg-slate-900 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-600 font-mono"
                        placeholder="Write your code here..."
                    />
                    {!isAnswered && (
                        <button
                            onClick={handleCodeSubmit}
                            disabled={!codeInputAnswer.trim()}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg text-lg transition disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            Submit Answer
                        </button>
                    )}
                </div>
            ) : ( // Assumes 'multiple-choice'
                <div className="space-y-3">
                    {question.options.map((option, index) => (
                        <button 
                            key={index} 
                            onClick={() => handleAnswer(index)}
                            disabled={isAnswered}
                            className={`w-full text-left p-4 rounded-lg border-2 transition text-lg text-slate-200 ${getButtonClass(index)}`}
                        >
                            <LaTeXRenderer text={option} />
                        </button>
                    ))}
                </div>
            )}
            {isAnswered && (
                <div className="mt-6 p-4 rounded-lg bg-slate-900/50">
                    <h3 className="font-bold text-lg mb-2">{currentAnswerCorrect ? 'Correct!' : 'Incorrect'}</h3>
                    <p className="text-slate-300"><LaTeXRenderer text={question.explanation} /></p>
                </div>
            )}
            {isAnswered && (
                <button 
                    onClick={handleNext}
                    className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg text-lg transition"
                >
                    {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </button>
            )}
        </div>
    </div>
  );
};

export default QuizPage;