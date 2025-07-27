// Load environment variables from a .env file into process.env
require('dotenv').config();

const express = require('express');
const path = require('path');
const multer = require('multer');
const generateQuizHandler = require('./src/api/generateQuiz');

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

// This is for when you build your app for production
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

