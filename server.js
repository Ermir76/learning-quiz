// Load environment variables from a .env file into process.env
require('dotenv').config();

const express = require('express');
const path = require('path');
const generateQuizHandler = require('./src/api/generateQuiz');

const app = express();
const PORT = 3001;

// This tells our server how to understand JSON data
app.use(express.json());

// This creates the API route. When the frontend calls '/api/generateQuiz', this code will run.
app.post('/api/generateQuiz', generateQuizHandler);

// This is for when you build your app for production
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

