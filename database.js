// database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'quiz_app.db');
const db = new sqlite3.Database(dbPath);

// Create tables if they don't exist
const initDb = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      categoryId TEXT NOT NULL,
      tags TEXT,
      modelUsed TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quizId INTEGER,
      text TEXT NOT NULL,
      type TEXT NOT NULL,
      options TEXT,
      correctAnswer TEXT,
      explanation TEXT,
      learnMoreUrl TEXT,
      FOREIGN KEY (quizId) REFERENCES quizzes(id)
    )`);
  });
};

initDb();

module.exports = db;

/**
 * Delete a quiz and its questions from the database
 * @param {number} quizId - ID för quiz som ska raderas
 * @param {function} callback - Callback med (err)
 */
db.deleteQuiz = function(quizId, callback) {
  db.serialize(() => {
    db.run(`DELETE FROM questions WHERE quizId = ?`, [quizId], function(err) {
      if (err) return callback(err);
      db.run(`DELETE FROM quizzes WHERE id = ?`, [quizId], function(err2) {
        if (err2) return callback(err2);
        callback(null);
      });
    });
  });
};
/**
 * Save a quiz and its questions to the database
 * @param {object} quiz - Quiz object with title, category, tags, modelUsed, questions
 * @param {function} callback - Callback with (err, quizId)
 */
db.saveQuiz = function(quiz, callback) {
  const { title, categoryId, tags, modelUsed, questions } = quiz;
  db.run(
    `INSERT INTO quizzes (title, categoryId, tags, modelUsed) VALUES (?, ?, ?, ?)`,
    [title, categoryId, Array.isArray(tags) ? tags.join(',') : tags, modelUsed],
    function(err) {
      if (err) return callback(err);
      const quizId = this.lastID;
      if (!questions || !Array.isArray(questions)) return callback(null, quizId);
      const stmt = db.prepare(`INSERT INTO questions (quizId, text, type, options, correctAnswer, explanation, learnMoreUrl) VALUES (?, ?, ?, ?, ?, ?, ?)`);
      for (const q of questions) {
        stmt.run([
          quizId,
          q.text,
          q.type,
          q.options ? JSON.stringify(q.options) : null,
          typeof q.correctAnswer === 'number' ? q.correctAnswer.toString() : q.correctAnswer,
          q.explanation || '',
          q.learnMoreUrl || ''
        ]);
      }
      stmt.finalize(() => callback(null, quizId));
    }
  );
};

/**
 * Fetch all quizzes with their questions
 * @param {function} callback - Callback with (err, quizzes)
 */
db.getAllQuizzes = function(callback) {
  db.all(`SELECT * FROM quizzes`, [], (err, quizzes) => {
    if (err) return callback(err);
    if (!quizzes || quizzes.length === 0) return callback(null, []);
    // Fetch questions for each quiz
    const quizIds = quizzes.map(q => q.id);
    db.all(`SELECT * FROM questions WHERE quizId IN (${quizIds.map(() => '?').join(',')})`, quizIds, (err2, questions) => {
      if (err2) return callback(err2);
      // Map questions to quizzes
      const quizzesWithQuestions = quizzes.map(quiz => {
        const quizQuestions = questions.filter(q => q.quizId === quiz.id).map(q => ({
          id: q.id,
          text: q.text,
          type: q.type,
          options: q.options ? JSON.parse(q.options) : [],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          learnMoreUrl: q.learnMoreUrl
        }));
        return {
          ...quiz,
          tags: quiz.tags ? quiz.tags.split(',') : [],
          questions: quizQuestions
        };
      });
      callback(null, quizzesWithQuestions);
    });
  });
};
