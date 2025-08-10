import React, { useState, useRef, useCallback } from 'react';
import { DocumentArrowUpIcon, PhotoIcon, XCircleIcon, PencilIcon } from './Icons';
import LoadingIndicator from './LoadingIndicator'; // Import the new component

const CreateQuizPage = ({ setPage, categories, setGeneratedQuiz, setSelectedCategory, settings }) => {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const resetInput = () => {
    setText('');
    setSelectedFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = null;
    }
  };

  const handleFileSelected = useCallback((file) => {
    if (file) {
      resetInput();
      setSelectedFile(file);
    }
  }, []);

  const handleFileChange = (event) => {
    handleFileSelected(event.target.files[0]);
  };

  const handlePaste = useCallback((event) => {
    const items = event.clipboardData.items;
    for (const index in items) {
      const item = items[index];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        event.preventDefault();
        const file = item.getAsFile();
        const namedFile = new File([file], `pasted-image-${Date.now()}.${file.type.split('/')[1]}`, { type: file.type });
        handleFileSelected(namedFile);
        return;
      }
    }
  }, [handleFileSelected]);

  const handleGenerate = async () => {
    if (!selectedFile && !text.trim()) return;
    setIsLoading(true);
    
    const formData = new FormData();
    formData.append('numQuestions', numQuestions);

    // Add scraper preferences from settings
    if (settings) {
      formData.append('primaryScraper', settings.primaryScraper || 'puppeteer');
      formData.append('fallbackScraper', settings.fallbackScraper || 'apify');
    }

    if (selectedFile) {
      formData.append('file', selectedFile);
    } else {
      formData.append('topic', text);
    }

    try {
      const response = await fetch('/api/generateQuiz', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate study set.');
      }

      const { quiz, category: categoryName, modelUsed } = await response.json();
      const category = categories.find(cat => cat.name === categoryName);

      if (!category) {
        throw new Error(`Received an unknown category from the AI: ${categoryName}`);
      }

      const newQuiz = { ...quiz, id: `ai_${new Date().getTime()}`, categoryId: category.id, modelUsed };
      setGeneratedQuiz(newQuiz);
      setSelectedCategory(category);
      setPage('reviewQuiz');

    } catch (error) {
      console.error("Error generating study set:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); }; // Necessary to allow drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelected(file);
    }
  };

  const canGenerate = !isLoading && (!!selectedFile || text.trim().length > 0);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <div className="app-shell min-h-screen px-6 py-10">
      <div className="max-w-3xl mx-auto card p-10 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="flex items-center gap-3 text-3xl font-semibold text-slate-900 dark:text-slate-100"><PencilIcon className="w-8 h-8 text-accent" /> Create Study Set</h1>
          <button onClick={() => setPage('options')} className="btn-quiet !px-4 !py-2 text-sm">← Back</button>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm text-center">Generate interactive study content with quizzes and flashcards using AI</p>
      
      {/* Unified Input Box */}
      <div 
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ${isDragOver ? 'border-accent bg-surface-100 dark:bg-slate-700/60' : 'border-surface-300 dark:border-slate-600 hover:border-accent/70 bg-white dark:bg-slate-800/60'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current.click()} // Only trigger if no file is selected
      >
        <input ref={fileInputRef} type="file" className="sr-only" onChange={handleFileChange} />

        {selectedFile ? (
          // File Preview
          <div className="relative">
            {selectedFile.type.startsWith('image/') ? (
              <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <DocumentArrowUpIcon className="w-16 h-16 text-slate-400" />
                <p className="mt-2 text-slate-300 font-semibold">{selectedFile.name}</p>
              </div>
            )}
            <button onClick={resetInput} className="absolute -top-2 -right-2 bg-slate-700 rounded-full p-1 text-white hover:bg-red-500 transition-colors">
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>
        ) : (
          // Placeholder and Textarea
          <div className="flex flex-col items-center">
            <PhotoIcon className="w-16 h-16 text-slate-500" />
            <p className="mt-2 text-slate-400">Click to upload, or drag and drop</p>
            <p className="text-xs text-slate-500 mt-1">PDF, TXT, PNG, JPG, etc.</p>
            <div className="relative w-full my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-300 dark:border-slate-600"></div></div>
                <div className="relative flex justify-center"><span className="bg-white dark:bg-slate-800 px-2 text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide">OR</span></div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onPaste={handlePaste}
              onClick={(e) => e.stopPropagation()} // Prevent click from bubbling up to the div
              className="w-full h-24 p-3 border-none rounded-lg bg-surface-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-accent/50 resize-none"
              placeholder="Paste a URL, text, or an image..."
            />
          </div>
        )}
      </div>

      {/* Number of Questions Input */}
      <div className="my-6">
        <label htmlFor="numQuestions" className="block text-slate-700 dark:text-slate-300 text-xs font-semibold mb-2 uppercase tracking-wide">Number of Questions</label>
        <input
          type="number"
          id="numQuestions"
          value={numQuestions}
          onChange={(e) => setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))}
          min="1"
          className="input"
        />
      </div>
      {/* Action Buttons */}
      <div className="pt-4 text-center">
        <button onClick={handleGenerate} disabled={!canGenerate || isLoading} className="btn-primary w-full py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? 'Generating Study Set...' : 'Generate Study Set'}
        </button>
      </div>
    </div>
    </div>
  );
};

export default CreateQuizPage;
