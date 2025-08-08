import React, { useState } from 'react';
import LaTeXRenderer from './LaTeXRenderer';

const FlashcardPage = ({ setPage, quiz, setResults, saveProgress }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardResults, setCardResults] = useState([]); // Track known/unknown for each card

  const question = quiz.questions[currentCardIndex];
  const totalCards = quiz.questions.length;
  const isLastCard = currentCardIndex === totalCards - 1;

  // Get the correct answer text for display
  const getCorrectAnswerText = (question) => {
    if (question.type === 'multiple-choice') {
      const correctIndex = parseInt(question.correctAnswer, 10);
      return question.options[correctIndex];
    } else {
      return question.correctAnswer;
    }
  };

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleKnown = (known) => {
    // Record this card's result
    const newResult = {
      questionIndex: currentCardIndex,
      questionText: question.text,
      known: known,
      answer: getCorrectAnswerText(question)
    };

    const updatedResults = [...cardResults, newResult];
    setCardResults(updatedResults);

    if (isLastCard) {
      // Calculate final results
      const knownCount = updatedResults.filter(r => r.known).length;
      const unknownCount = updatedResults.filter(r => !r.known).length;
      const percentage = Math.round((knownCount / totalCards) * 100);

      const flashcardResults = {
        knownCount,
        unknownCount,
        totalCards,
        percentage,
        type: 'flashcard',
        cards: updatedResults
      };

      // Save flashcard progress (treat known cards as "correct" answers)
      saveProgress(quiz.id, knownCount, totalCards, 'flashcard');

      setResults(flashcardResults);
      setPage('results');
    } else {
      // Go to next card
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
      // Remove the last result since we're going back
      setCardResults(cardResults.slice(0, -1));
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => setPage('categoryQuizList')}
            className="text-slate-300 hover:text-slate-100 transition"
          >
            &larr; Back to Quiz List
          </button>
          <div className="text-slate-300 font-semibold">
            Card {currentCardIndex + 1} of {totalCards}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-700 rounded-full h-2 mb-6">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentCardIndex + 1) / totalCards) * 100}%` }}
          ></div>
        </div>

        {/* Quiz Title */}
        <h1 className="text-2xl font-bold text-slate-200 mb-6 text-center">{quiz.title}</h1>

        {/* Flashcard */}
        <div className="bg-slate-700 rounded-lg p-8 min-h-80 flex flex-col justify-center">
          {!isFlipped ? (
            // Front of card - Question
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-200 mb-6">Question</h2>
              <div className="text-lg text-slate-300 mb-8">
                <LaTeXRenderer text={question.text} />
              </div>
              <button
                onClick={handleFlip}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Flip Card
              </button>
            </div>
          ) : (
            // Back of card - Answer
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-200 mb-6">Answer</h2>
              <div className="text-lg text-slate-300 mb-6">
                <LaTeXRenderer text={getCorrectAnswerText(question)} />
              </div>
              
              {/* Show explanation if available */}
              {question.explanation && (
                <div className="bg-slate-600 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Explanation:</h3>
                  <p className="text-sm text-slate-400">
                    <LaTeXRenderer text={question.explanation} />
                  </p>
                </div>
              )}

              {/* Learn More Link */}
              {question.learnMoreUrl && (
                <div className="mb-6">
                  <a 
                    href={question.learnMoreUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Learn More
                  </a>
                </div>
              )}

              <div className="text-lg font-semibold text-slate-300 mb-4">
                Did you know this answer?
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => handleKnown(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  ✓ I Knew It
                </button>
                <button
                  onClick={() => handleKnown(false)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  ✗ I Didn't Know It
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
            className={`py-2 px-4 rounded-lg font-semibold transition ${
              currentCardIndex === 0 
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
            }`}
          >
            Previous
          </button>
          
          <div className="text-slate-400 text-sm">
            {isFlipped ? 'Mark your answer to continue' : 'Click "Flip Card" to see the answer'}
          </div>
          
          <div className="w-20"></div> {/* Spacer for alignment */}
        </div>
      </div>
    </div>
  );
};

export default FlashcardPage;
