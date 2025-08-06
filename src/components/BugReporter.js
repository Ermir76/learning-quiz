import React, { useState } from 'react';
import html2canvas from 'html2canvas';

const BugReporter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [screenshots, setScreenshots] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const captureScreenshot = async () => {
    setIsCapturing(true);
    try {
      // Close the modal temporarily for clean screenshot
      setIsOpen(false);
      
      // Wait a moment for modal to close
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(document.body, {
        height: window.innerHeight,
        width: window.innerWidth,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0
      });
      
      // Reopen modal
      setIsOpen(true);
      
      const screenshot = {
        id: Date.now(),
        image: canvas.toDataURL('image/png'),
        comment: '',
        timestamp: new Date().toLocaleString(),
        filename: `issue-X-screenshot-${screenshots.length + 1}.png`,
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      setScreenshots(prev => [...prev, screenshot]);
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      alert('Failed to capture screenshot. Please try again.');
      setIsOpen(true);
    }
    setIsCapturing(false);
  };

  const updateComment = (id, comment) => {
    setScreenshots(prev => 
      prev.map(shot => 
        shot.id === id ? { ...shot, comment } : shot
      )
    );
  };

  const downloadScreenshot = (screenshot) => {
    const link = document.createElement('a');
    link.download = screenshot.filename;
    link.href = screenshot.image;
    link.click();
  };

  const saveReportToServer = async () => {
    if (screenshots.length === 0) {
      alert('Please capture at least one screenshot before saving.');
      return;
    }

    setIsSaving(true);
    try {
      console.log('🐛 BugReporter: Starting save process...');
      console.log('🐛 Current URL:', window.location.href);
      console.log('🐛 Screenshots count:', screenshots.length);
      
      const requestData = {
        screenshots: screenshots,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      console.log('🐛 Making fetch request to /api/save-bug-report');
      
      const response = await fetch('/api/save-bug-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('🐛 Response status:', response.status);
      console.log('🐛 Response headers:', response.headers);
      
      const responseText = await response.text();
      console.log('🐛 Raw response:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('🐛 JSON Parse Error:', parseError);
        console.error('🐛 Response was:', responseText);
        throw new Error(`Server returned non-JSON response: ${responseText.substring(0, 100)}...`);
      }
      
      if (response.ok) {
        alert(`Bug report saved successfully as Issue #${result.issueId}!`);
        setScreenshots([]);
        setIsOpen(false);
      } else {
        throw new Error(result.error || 'Failed to save bug report');
      }
    } catch (error) {
      console.error('🐛 Full error details:', error);
      alert('Failed to save bug report: ' + error.message);
    }
    setIsSaving(false);
  };

  const copyMarkdownReport = async () => {
    try {
      // Get next issue ID from server
      const response = await fetch('/api/next-issue-id');
      const { nextId } = await response.json();
      
      const markdown = generateMarkdownReport(nextId);
      await navigator.clipboard.writeText(markdown);
      alert('Markdown report copied to clipboard! You can paste it into your ISSUE.md file.');
    } catch (error) {
      console.error('Failed to copy markdown:', error);
      alert('Failed to copy markdown report.');
    }
  };

  const generateMarkdownReport = (issueId) => {
    const timestamp = new Date().toLocaleDateString();
    
    let markdown = `## Issue Report: [AUTO-GENERATED - PLEASE EDIT TITLE]

**ID:** ${issueId}
**Status:** Open
**Date Opened:** ${timestamp}

---

### Problem Description

`;

    screenshots.forEach((screenshot, index) => {
      markdown += `**Screenshot ${index + 1}:** ${screenshot.comment || '[No description provided]'}\n`;
    });

    markdown += `\n`;
    
    screenshots.forEach((screenshot, index) => {
      const filename = `issue-${issueId}-screenshot-${index + 1}.png`;
      markdown += `![Screenshot ${index + 1}](screenshots/${filename})\n`;
    });

    markdown += `
### Investigation and Diagnosis

[TO BE FILLED DURING INVESTIGATION]

### Solution

[TO BE FILLED WHEN RESOLVED]

### Verification

[TO BE FILLED AFTER TESTING]

---
`;

    return markdown;
  };

  return (
    <>
      {/* Bug Report Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-colors z-50"
        title="Report Bug"
      >
        🐛
      </button>

      {/* Bug Reporter Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-lg max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h2 className="text-2xl font-bold text-slate-200">Bug Reporter</h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-400 hover:text-slate-200 text-2xl"
              >
                ✕
              </button>
            </div>
            
            {/* Controls */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={captureScreenshot}
                  disabled={isCapturing}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded transition-colors"
                >
                  {isCapturing ? 'Capturing...' : '📸 Capture Screenshot'}
                </button>
                
                {screenshots.length > 0 && (
                  <>
                    <button
                      onClick={saveReportToServer}
                      disabled={isSaving}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded transition-colors"
                    >
                      {isSaving ? 'Saving...' : '💾 Save Bug Report'}
                    </button>
                    <button
                      onClick={copyMarkdownReport}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors"
                    >
                      📋 Copy Markdown
                    </button>
                  </>
                )}
              </div>
              {screenshots.length > 0 && (
                <p className="text-slate-300 text-sm mt-2">
                  {screenshots.length} screenshot{screenshots.length !== 1 ? 's' : ''} captured
                </p>
              )}
            </div>

            {/* Screenshots List */}
            <div className="flex-1 overflow-y-auto p-6">
              {screenshots.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <p>No screenshots captured yet.</p>
                  <p className="text-sm mt-2">Click "Capture Screenshot" to start documenting issues.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {screenshots.map((screenshot, index) => (
                    <div key={screenshot.id} className="bg-slate-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-slate-300 text-sm">
                          Screenshot {index + 1} - {screenshot.timestamp}
                        </span>
                        <button
                          onClick={() => downloadScreenshot(screenshot)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Download PNG
                        </button>
                      </div>
                      
                      <img 
                        src={screenshot.image} 
                        alt={`Screenshot ${index + 1}`}
                        className="w-full max-h-64 object-contain bg-white rounded border mb-3"
                      />
                      
                      <textarea
                        value={screenshot.comment}
                        onChange={(e) => updateComment(screenshot.id, e.target.value)}
                        placeholder="Describe the issue visible in this screenshot..."
                        className="w-full p-3 bg-slate-600 text-slate-200 border border-slate-500 rounded resize-none h-24 placeholder-slate-400"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BugReporter;
