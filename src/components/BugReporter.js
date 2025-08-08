import React, { useState } from 'react';
import html2canvas from 'html2canvas';

const BugReporter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [screenshots, setScreenshots] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionArea, setSelectionArea] = useState(null);

  const startSelection = () => {
    setIsOpen(false); // Close modal
    setIsSelecting(true);
    
    // Create selection overlay
    const overlay = document.createElement('div');
    overlay.id = 'selection-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.3);
      cursor: crosshair;
      z-index: 9999;
    `;
    
    let isDrawing = false;
    let startX, startY;
    let selectionBox;
    
    const createSelectionBox = () => {
      selectionBox = document.createElement('div');
      selectionBox.style.cssText = `
        position: absolute;
        border: 2px dashed #007acc;
        background: rgba(0, 122, 204, 0.1);
        pointer-events: none;
      `;
      overlay.appendChild(selectionBox);
    };
    
    overlay.addEventListener('mousedown', (e) => {
      isDrawing = true;
      startX = e.clientX;
      startY = e.clientY;
      createSelectionBox();
    });
    
    overlay.addEventListener('mousemove', (e) => {
      if (!isDrawing || !selectionBox) return;
      
      const currentX = e.clientX;
      const currentY = e.clientY;
      
      const x = Math.min(startX, currentX);
      const y = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);
      
      selectionBox.style.left = x + 'px';
      selectionBox.style.top = y + 'px';
      selectionBox.style.width = width + 'px';
      selectionBox.style.height = height + 'px';
    });
    
    overlay.addEventListener('mouseup', (e) => {
      if (!isDrawing) return;
      
      const currentX = e.clientX;
      const currentY = e.clientY;
      
      const x = Math.min(startX, currentX);
      const y = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);
      
      if (width > 10 && height > 10) {
        setSelectionArea({
          x: x,
          y: y,
          width: width,
          height: height,
          scrollX: window.pageXOffset,
          scrollY: window.pageYOffset,
          // Store absolute coordinates (relative to document)
          absoluteX: x + window.pageXOffset,
          absoluteY: y + window.pageYOffset
        });
      }
      
      document.body.removeChild(overlay);
      setIsSelecting(false);
      setIsOpen(true);
      
      // Auto-capture after selection
      if (width > 10 && height > 10) {
        // Remove auto-capture to let user manually trigger it
        // setTimeout(() => captureSelection(), 100);
      }
    });
    
    // ESC to cancel
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(overlay);
        setIsSelecting(false);
        setIsOpen(true);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    document.body.appendChild(overlay);
  };

  const captureSelection = async () => {
    if (!selectionArea) return;
    
    setIsCapturing(true);
    try {
      // Close modal for clean capture
      setIsOpen(false);
      
      // Wait for modal to close
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Capture full page first
      const fullCanvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: 1,
        scrollX: 0,
        scrollY: 0,
        width: document.body.scrollWidth,
        height: document.body.scrollHeight
      });
      
      // Create cropped canvas
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = selectionArea.width;
      croppedCanvas.height = selectionArea.height;
      
      const ctx = croppedCanvas.getContext('2d');
      
      // Use absolute coordinates (relative to full document)
      const sourceX = selectionArea.absoluteX || (selectionArea.x + selectionArea.scrollX);
      const sourceY = selectionArea.absoluteY || (selectionArea.y + selectionArea.scrollY);
      const sourceWidth = selectionArea.width;
      const sourceHeight = selectionArea.height;
      
      console.log('📊 Debug Info:');
      console.log('Selection area:', selectionArea);
      console.log('Canvas dimensions:', fullCanvas.width, 'x', fullCanvas.height);
      console.log('Document dimensions:', document.body.scrollWidth, 'x', document.body.scrollHeight);
      console.log('Viewport coordinates:', selectionArea.x, selectionArea.y);
      console.log('Absolute coordinates:', sourceX, sourceY);
      console.log('Cropping region:', sourceX, sourceY, sourceWidth, sourceHeight);
      
      // Draw cropped section
      ctx.drawImage(
        fullCanvas,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, selectionArea.width, selectionArea.height
      );
      
      const screenshot = {
        id: Date.now(),
        image: croppedCanvas.toDataURL('image/png'),
        comment: '',
        timestamp: new Date().toLocaleString(),
        filename: `issue-X-screenshot-${screenshots.length + 1}.png`,
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      setScreenshots(prev => [...prev, screenshot]);
      setSelectionArea(null); // Clear selection
      setIsOpen(true); // Reopen modal
    } catch (error) {
      console.error('Failed to capture selection:', error);
      alert('Failed to capture selection. Please try again.');
      setIsOpen(true); // Reopen modal on error
    }
    setIsCapturing(false);
  };

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
                  {isCapturing ? 'Capturing...' : '📸 Full Screenshot'}
                </button>
                
                <button
                  onClick={startSelection}
                  disabled={isCapturing || isSelecting}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-4 py-2 rounded transition-colors"
                >
                  {isSelecting ? 'Selecting...' : '✂️ Select Area'}
                </button>
                
                {selectionArea && (
                  <>
                    <button
                      onClick={captureSelection}
                      disabled={isCapturing}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded transition-colors"
                    >
                      {isCapturing ? 'Capturing...' : '📸 Capture Selection'}
                    </button>
                    <button
                      onClick={() => setSelectionArea(null)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded transition-colors text-sm"
                    >
                      Clear Selection
                    </button>
                  </>
                )}
                
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
              
              {/* Instructions */}
              {isSelecting && (
                <p className="text-yellow-300 text-sm mt-2">
                  🖱️ Click and drag to select area, ESC to cancel
                </p>
              )}
              
              {selectionArea && (
                <p className="text-green-300 text-sm mt-2">
                  ✓ Selected area: {selectionArea.width}×{selectionArea.height}px
                </p>
              )}
              
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
