// Load environment variables from a .env file into process.env
require('dotenv').config();


const express = require('express');
const path = require('path');
const multer = require('multer');
const generateQuizHandler = require('./src/api/generateQuiz');
const db = require('./database'); // Import SQLite database

const app = express();
const PORT = 3001;

// This tells our server how to understand JSON data
app.use(express.json());

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

// This is for when you build your app for production
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

