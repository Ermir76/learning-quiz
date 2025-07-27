import React from 'react';

const WelcomePage = ({ setPage }) => (
  <div className="bg-slate-800 p-8 rounded-lg shadow-lg text-center">
    <h1 className="text-5xl font-bold mb-4 text-slate-100">Quiz App</h1>
    <p className="text-xl text-slate-300 mb-8">Ready to test your knowledge?</p>
    <button onClick={() => setPage('options')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105">
      Let's Go!
    </button>
  </div>
);

export default WelcomePage;