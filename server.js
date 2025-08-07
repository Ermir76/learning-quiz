// Load environment variables from a .env file into process.env
require('dotenv').config();


const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const generateQuizHandler = require('./src/api/generateQuiz');
const db = require('./database'); // Import SQLite database

const app = express();
const PORT = 3001;

// This tells our server how to understand JSON data with increased limit for screenshots
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});

// This creates the API route. When the frontend calls '/api/generateQuiz', this code will run.
// The multer middleware 'upload.any()' handles file uploads.
app.post('/api/generateQuiz', upload.any(), generateQuizHandler);

// Save a quiz to the database
app.post('/api/quizzes', express.json(), (req, res) => {
  const quiz = req.body;
  db.saveQuiz(quiz, (err, quizId) => {
    if (err) {
      console.error('Error saving quiz:', err);
      return res.status(500).json({ message: 'Failed to save quiz.' });
    }
    res.status(201).json({ id: quizId });
  });
});

// Fetch all quizzes from the database

app.get('/api/quizzes', (req, res) => {
  db.getAllQuizzes((err, quizzes) => {
    if (err) {
      console.error('Error fetching quizzes:', err);
      return res.status(500).json({ message: 'Failed to fetch quizzes.' });
    }
    res.json({ quizzes });
  });
});

// Save quiz progress/attempt
app.post('/api/progress', express.json(), (req, res) => {
  const { quizId, score, totalQuestions } = req.body;
  
  if (!quizId || score === undefined || !totalQuestions) {
    return res.status(400).json({ message: 'Missing required fields: quizId, score, totalQuestions' });
  }
  
  db.saveProgress(quizId, score, totalQuestions, (err, attemptId) => {
    if (err) {
      console.error('Error saving progress:', err);
      return res.status(500).json({ message: 'Failed to save progress.' });
    }
    res.status(201).json({ id: attemptId });
  });
});

// Get progress for all quizzes
app.get('/api/progress', (req, res) => {
  db.getAllProgress((err, progressMap) => {
    if (err) {
      console.error('Error fetching progress:', err);
      return res.status(500).json({ message: 'Failed to fetch progress.' });
    }
    res.json({ progress: progressMap });
  });
});

// Get progress for a specific quiz
app.get('/api/progress/:quizId', (req, res) => {
  const quizId = parseInt(req.params.quizId, 10);
  if (isNaN(quizId)) {
    return res.status(400).json({ message: 'Invalid quiz ID.' });
  }
  
  db.getQuizProgress(quizId, (err, progressData) => {
    if (err) {
      console.error('Error fetching quiz progress:', err);
      return res.status(500).json({ message: 'Failed to fetch quiz progress.' });
    }
    res.json(progressData);
  });
});

// Delete a quiz from the database
app.delete('/api/quizzes/:id', (req, res) => {
  const quizId = parseInt(req.params.id, 10);
  if (isNaN(quizId)) {
    return res.status(400).json({ message: 'Invalid quiz ID.' });
  }
  db.deleteQuiz(quizId, (err) => {
    if (err) {
      console.error('Error deleting quiz:', err);
      return res.status(500).json({ message: 'Failed to delete quiz.' });
    }
    res.status(204).send();
  });
});

// Scraper Management Routes
const ScraperFactory = require('./src/api/scrapers/ScraperFactory');

// Get available scrapers status
app.get('/api/scrapers/status', (req, res) => {
  try {
    const scrapers = ScraperFactory.getAvailableScrapers();
    res.json({ 
      scrapers,
      status: {} // Will be populated by client tests
    });
  } catch (error) {
    console.error('Error getting scraper status:', error);
    res.status(500).json({ message: 'Failed to get scraper status.' });
  }
});

// Test a specific scraper
app.post('/api/scrapers/test', express.json(), async (req, res) => {
  try {
    const { scraper: scraperId, url } = req.body;
    
    if (!scraperId || !url) {
      return res.status(400).json({ message: 'Scraper ID and URL are required.' });
    }

    const testUrl = url || 'https://example.com';
    const scraper = ScraperFactory.getScraper(scraperId);
    
    const startTime = Date.now();
    const result = await scraper.extractText(testUrl, { timeout: 15000 });
    const processingTime = Date.now() - startTime;

    res.json({
      success: result.success,
      textLength: result.text ? result.text.length : 0,
      processingTime: processingTime,
      error: result.error,
      scraper: scraperId
    });

  } catch (error) {
    console.error('Error testing scraper:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      scraper: req.body.scraper
    });
  }
});

// Bug Reporter Routes
// Get next available issue ID
app.get('/api/next-issue-id', (req, res) => {
  console.log('🚀 /api/next-issue-id endpoint HIT! Request received.');
  const issueMdPath = path.join(__dirname, '../ISSUE.md');
  
  try {
    const issueContent = fs.readFileSync(issueMdPath, 'utf8');
    const idMatches = issueContent.match(/\*\*ID:\*\* (\d+)/g);
    
    if (!idMatches) {
      return res.json({ nextId: 1 });
    }
    
    const highestId = Math.max(...idMatches.map(match => {
      const id = match.match(/\d+/)[0];
      return parseInt(id, 10);
    }));
    
    res.json({ nextId: highestId + 1 });
  } catch (error) {
    console.error('Error reading ISSUE.md:', error);
    res.status(500).json({ error: 'Failed to get next issue ID' });
  }
});

// Save bug report (screenshots + append to ISSUE.md)
app.post('/api/save-bug-report', express.json({limit: '50mb'}), (req, res) => {
  console.log('🚀 /api/save-bug-report endpoint HIT! Request received.');
  console.log('🚀 Request body keys:', Object.keys(req.body));
  console.log('🚀 Headers:', req.headers);
  
  const { screenshots, timestamp, url, userAgent } = req.body;
  
  if (!screenshots || screenshots.length === 0) {
    return res.status(400).json({ error: 'No screenshots provided' });
  }
  
  try {
    // Get next issue ID
    const issueMdPath = path.join(__dirname, '../ISSUE.md');
    const issueContent = fs.readFileSync(issueMdPath, 'utf8');
    const idMatches = issueContent.match(/\*\*ID:\*\* (\d+)/g);
    
    let nextId = 1;
    if (idMatches) {
      const highestId = Math.max(...idMatches.map(match => {
        const id = match.match(/\d+/)[0];
        return parseInt(id, 10);
      }));
      nextId = highestId + 1;
    }
    
    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(__dirname, '../screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // Save screenshots with proper naming
    screenshots.forEach((screenshot, index) => {
      const base64Data = screenshot.image.replace(/^data:image\/png;base64,/, '');
      const filename = `issue-${nextId}-screenshot-${index + 1}.png`;
      const filepath = path.join(screenshotsDir, filename);
      fs.writeFileSync(filepath, base64Data, 'base64');
    });
    
    // Generate markdown for new issue
    const today = new Date().toLocaleDateString();
    let newIssueMarkdown = `\n## Issue Report: [AUTO-GENERATED - PLEASE EDIT TITLE]

**ID:** ${nextId}
**Status:** Open
**Date Opened:** ${today}

---

### Problem Description

`;
    
    // Add screenshot descriptions
    screenshots.forEach((screenshot, index) => {
      newIssueMarkdown += `**Screenshot ${index + 1}:** ${screenshot.comment || '[No description provided]'}\n`;
    });
    
    newIssueMarkdown += `\n`;
    
    // Add screenshot references
    screenshots.forEach((screenshot, index) => {
      newIssueMarkdown += `![Screenshot ${index + 1}](screenshots/issue-${nextId}-screenshot-${index + 1}.png)\n`;
    });
    
    newIssueMarkdown += `
**Environment:**
- URL: ${url}
- User Agent: ${userAgent}
- Timestamp: ${timestamp}

### Investigation and Diagnosis

[TO BE FILLED DURING INVESTIGATION]

### Solution

[TO BE FILLED WHEN RESOLVED]

### Verification

[TO BE FILLED AFTER TESTING]

---
`;
    
    // Append to ISSUE.md
    fs.appendFileSync(issueMdPath, newIssueMarkdown);
    
    res.json({ 
      success: true, 
      issueId: nextId,
      message: `Bug report saved as Issue #${nextId}` 
    });
    
  } catch (error) {
    console.error('Error saving bug report:', error);
    res.status(500).json({ error: 'Failed to save bug report: ' + error.message });
  }
});

// DEVELOPMENT MODE: Comment out production static serving
// app.use(express.static(path.join(__dirname, 'build')));

// DEVELOPMENT MODE: Comment out wildcard route
// app.get('*', (req, res) => {
//   // Don't serve HTML for API routes
//   if (req.path.startsWith('/api/')) {
//     return res.status(404).json({ error: 'API endpoint not found' });
//   }
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

