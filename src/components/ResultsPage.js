import React from 'react';

const ResultsPage = ({ setPage, results, quiz }) => {
    const score = results.filter(r => r.isCorrect).length;
    const total = quiz.questions.length;

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-slate-800 p-8 rounded-xl shadow-2xl text-center">
                <h2 className="text-4xl font-bold mb-2 text-slate-200">Quiz Complete!</h2>
                <p className="text-xl text-slate-300 mb-6">Your Score</p>
                <p className="text-6xl font-bold mb-8 text-slate-100">{score} / {total}</p>
                
                <div className="text-left my-8">
                    <h3 className="text-xl font-bold mb-4 text-slate-200">Review Your Answers</h3>
                    <div className="space-y-4 max-h-72 overflow-y-auto pr-4">
                        {results.map((result, index) => (
                            <div key={index} className={`p-4 rounded-lg ${result.isCorrect ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                                <p className="font-semibold text-slate-200 mb-2">{index + 1}. {result.questionText}</p>
                                {result.type === 'code-input' ? (
                                    <div className="text-sm space-y-2">
                                        <div className="text-slate-300">Your Answer:
                                            <pre className="bg-slate-900 p-2 rounded mt-1 overflow-x-auto"><code className="font-mono text-white">{result.selected}</code></pre>
                                        </div>
                                        {!result.isCorrect && (
                                             <div className="text-slate-300">Correct Answer:
                                                <pre className="bg-slate-900 p-2 rounded mt-1 overflow-x-auto"><code className="font-mono text-white">{result.correct}</code></pre>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-sm space-y-1">
                                        <p className="text-slate-300">Your answer: {result.selected}</p>
                                        {!result.isCorrect && <p className="text-slate-300">Correct answer: {result.correct}</p>}
                                    </div>
                                )}
                                <a href={result.learnMoreUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:underline mt-2 inline-block">Learn More</a>
                            </div>
                        ))}
                    </div>
                </div>

                <button 
                    onClick={() => setPage('quizCategories')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg text-lg transition"
                >
                    Back to Quiz Bank
                </button>
            </div>
        </div>
    );
};

export default ResultsPage;