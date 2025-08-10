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
    <div className="app-shell min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <button onClick={() => setPage('categoryQuizList')} className="btn-quiet !px-3 !py-1 text-xs">← Back</button>
          <div className="text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400">Card {currentCardIndex + 1} / {totalCards}</div>
        </div>
        <div className="card p-8">
          <h1 className="text-2xl font-semibold text-center text-slate-900 dark:text-slate-100 mb-6">{quiz.title}</h1>
          <div className="w-full h-2 bg-surface-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-accent transition-all duration-300" style={{ width: `${((currentCardIndex + 1) / totalCards) * 100}%` }} />
          </div>
          <div className="rounded-xl border border-surface-200 dark:border-slate-600 p-8 min-h-72 flex flex-col justify-center bg-white dark:bg-slate-800/60">
            {!isFlipped ? (
              <div className="text-center space-y-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Question</h2>
                <div className="text-lg text-slate-700 dark:text-slate-300"><LaTeXRenderer text={question.text} /></div>
                <button onClick={handleFlip} className="btn-primary px-6 py-3">Flip Card</button>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Answer</h2>
                <div className="text-lg text-slate-700 dark:text-slate-300"><LaTeXRenderer text={getCorrectAnswerText(question)} /></div>
                {question.explanation && (
                  <div className="rounded-lg border bg-surface-50 border-surface-200 dark:bg-slate-700/60 dark:border-slate-600 p-4 text-left">
                    <h3 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Explanation</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400"><LaTeXRenderer text={question.explanation} /></p>
                  </div>
                )}
                {question.learnMoreUrl && (
                  <div>
                    <a href={question.learnMoreUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:text-accent-strong underline">Learn More</a>
                  </div>
                )}
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Did you know this answer?</div>
                <div className="flex justify-center gap-4">
                  <button onClick={() => handleKnown(true)} className="btn-secondary bg-green-600/90 hover:bg-green-600 text-white border-0">✓ I Knew It</button>
                  <button onClick={() => handleKnown(false)} className="btn-secondary bg-red-600/90 hover:bg-red-600 text-white border-0">✗ I Didn't Know It</button>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-8 text-xs text-slate-500 dark:text-slate-400">
            <button onClick={handlePrevious} disabled={currentCardIndex === 0} className={`btn-quiet !px-4 !py-2 ${currentCardIndex === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}>Previous</button>
            <div>{isFlipped ? 'Mark your answer to continue' : 'Flip to reveal the answer'}</div>
            <div className="w-24" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardPage;
