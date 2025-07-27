import React, { useState } from 'react';
import LaTeXRenderer from './LaTeXRenderer';

const QuizPage = ({ setPage, quiz, setResults }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [codeInputAnswer, setCodeInputAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);

  const question = quiz.questions[currentQuestionIndex];

  const handleAnswer = (answerIndex) => {
    if (isAnswered) return;

    setSelectedAnswer(answerIndex);
    setIsAnswered(true);
    const isCorrect = answerIndex === question.correctAnswer;
    setUserAnswers(ua => [...ua, { type: question.type, questionText: question.text, selected: question.options[answerIndex], correct: question.options[question.correctAnswer], isCorrect, learnMoreUrl: question.learnMoreUrl }]);
  };

  const handleCodeSubmit = () => {
    if (isAnswered || !codeInputAnswer.trim()) return;

    setIsAnswered(true);
    // Normalize by removing all whitespace and making lowercase for robust comparison
    const normalize = (str) => str.replace(/\s+/g, '').toLowerCase();
    const isCorrect = normalize(codeInputAnswer) === normalize(question.correctAnswer);
    setUserAnswers(ua => [...ua, { type: question.type, questionText: question.text, selected: codeInputAnswer, correct: question.correctAnswer, isCorrect, learnMoreUrl: question.learnMoreUrl }]);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setCodeInputAnswer('');
    } else {
      // Finished quiz
      setResults(userAnswers);
      setPage('results');
    }
  };
  
  const getButtonClass = (index) => {
      if (!isAnswered) {
          return 'bg-slate-600 hover:bg-slate-500 border-slate-500';
      }
      if (index === question.correctAnswer) {
          return 'bg-green-700 border-green-800';
      }
      if (index === selectedAnswer) {
          return 'bg-red-700 border-red-800';
      }
      return 'bg-slate-600 border-slate-500';
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
                    <button
                        onClick={handleCodeSubmit}
                        disabled={isAnswered || !codeInputAnswer.trim()}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg text-lg transition disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        Submit Answer
                    </button>
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