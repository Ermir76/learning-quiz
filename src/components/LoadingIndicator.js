import React from 'react';

const LoadingIndicator = () => {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-slate-800 rounded-lg">
      <div className="relative">
        <div className="w-24 h-24 border-8 border-slate-700 rounded-full"></div>
        <div className="w-24 h-24 border-8 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="text-slate-300 text-lg mt-6 font-semibold">Generating your quiz...</p>
      <p className="text-slate-400 text-sm mt-2">The AI is warming up. This might take a moment.</p>
    </div>
  );
};

export default LoadingIndicator;
