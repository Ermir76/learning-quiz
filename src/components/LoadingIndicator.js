import React from 'react';

const LoadingIndicator = () => {
  return (
    <div className="flex flex-col items-center justify-center p-10 bg-slate-800 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Generating your study set...</p>
        <p className="text-slate-400 text-sm mt-2">This may take a few moments</p>
      </div>
    </div>
  );
};

export default LoadingIndicator;
