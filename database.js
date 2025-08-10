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

    // Add user progress tracking table
    db.run(`CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quizId INTEGER,
      score INTEGER,
      totalQuestions INTEGER,
      sessionType TEXT DEFAULT 'quiz',
      attemptedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quizId) REFERENCES quizzes(id)
    )`);

    // Add sessionType column if it doesn't exist (migration)
    db.run(`ALTER TABLE user_progress ADD COLUMN sessionType TEXT DEFAULT 'quiz'`, (err) => {
      // Ignore error if column already exists
      if (err && !err.message.includes('duplicate column name')) {
        console.log('Migration note:', err.message);
      }
    });
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
 * Save a quiz attempt/progress to the database
 * @param {number} quizId - ID of the quiz
 * @param {number} score - Number of correct answers or known cards
 * @param {number} totalQuestions - Total number of questions or cards
 * @param {string} sessionType - Type of session: 'quiz' or 'flashcard'
 * @param {function} callback - Callback with (err, attemptId)
 */
db.saveProgress = function(quizId, score, totalQuestions, sessionType = 'quiz', callback) {
  db.run(
    `INSERT INTO user_progress (quizId, score, totalQuestions, sessionType) VALUES (?, ?, ?, ?)`,
    [quizId, score, totalQuestions, sessionType],
    function(err) {
      if (err) return callback(err);
      callback(null, this.lastID);
    }
  );
};

/**
 * Get progress statistics for a specific quiz
 * @param {number} quizId - ID of the quiz
 * @param {function} callback - Callback with (err, progressData)
 */
db.getQuizProgress = function(quizId, callback) {
  db.all(
    `SELECT score, totalQuestions, sessionType, attemptedAt FROM user_progress WHERE quizId = ? ORDER BY attemptedAt DESC`,
    [quizId],
    (err, attempts) => {
      if (err) return callback(err);
      
      if (!attempts || attempts.length === 0) {
        return callback(null, { 
          averageScore: 0, 
          attempts: 0,
          averageFlashcardScore: 0,
          flashcardAttempts: 0,
          lastAttempt: null,
          isMastered: false 
        });
      }

      // Separate quiz and flashcard attempts
      const quizAttempts = attempts.filter(a => a.sessionType === 'quiz' || !a.sessionType); // backward compatibility
      const flashcardAttempts = attempts.filter(a => a.sessionType === 'flashcard');
      
      // Calculate averages for each type
      let averageScore = 0;
      let averageFlashcardScore = 0;
      
      if (quizAttempts.length > 0) {
        const quizTotalPercentage = quizAttempts.reduce((sum, attempt) => {
          return sum + (attempt.score / attempt.totalQuestions * 100);
        }, 0);
        averageScore = Math.round(quizTotalPercentage / quizAttempts.length);
      }
      
      if (flashcardAttempts.length > 0) {
        const flashcardTotalPercentage = flashcardAttempts.reduce((sum, attempt) => {
          return sum + (attempt.score / attempt.totalQuestions * 100);
        }, 0);
        averageFlashcardScore = Math.round(flashcardTotalPercentage / flashcardAttempts.length);
      }
      
      // Calculate combined mastery
      let combinedScore = 0;
      if (quizAttempts.length > 0 && flashcardAttempts.length > 0) {
        // Fixed: Simple weighted average - 60% quiz, 40% flashcard
        combinedScore = (averageScore * 0.6) + (averageFlashcardScore * 0.4);
      } else if (quizAttempts.length > 0) {
        combinedScore = averageScore;
      } else {
        combinedScore = averageFlashcardScore;
      }
      
      const isMastered = combinedScore >= 95;
      
      callback(null, {
        averageScore,
        attempts: quizAttempts.length,
        averageFlashcardScore,
        flashcardAttempts: flashcardAttempts.length,
        lastAttempt: attempts[0].attemptedAt,
        isMastered
      });
    }
  );
};

/**
 * Get progress for all quizzes with combined quiz and flashcard statistics
 * @param {function} callback - Callback with (err, progressMap)
 */
db.getAllProgress = function(callback) {
  db.all(
    `SELECT 
      quizId,
      sessionType,
      COUNT(*) as sessionCount,
      AVG(CAST(score AS FLOAT) / totalQuestions * 100) as avgScore,
      MAX(attemptedAt) as lastAttempt
     FROM user_progress 
     GROUP BY quizId, sessionType`,
    [],
    (err, results) => {
      if (err) return callback(err);
      
      const progressMap = {};
      
      // Group results by quizId
      results.forEach(row => {
        if (!progressMap[row.quizId]) {
          progressMap[row.quizId] = {
            averageScore: 0,
            attempts: 0,
            averageFlashcardScore: 0,
            flashcardAttempts: 0,
            lastAttempt: null,
            isMastered: false
          };
        }
        
        const progress = progressMap[row.quizId];
        
        if (row.sessionType === 'quiz') {
          progress.averageScore = Math.round(row.avgScore || 0);
          progress.attempts = row.sessionCount;
        } else if (row.sessionType === 'flashcard') {
          progress.averageFlashcardScore = Math.round(row.avgScore || 0);
          progress.flashcardAttempts = row.sessionCount;
        }
        
        // Update last attempt with the most recent date
        if (!progress.lastAttempt || new Date(row.lastAttempt) > new Date(progress.lastAttempt)) {
          progress.lastAttempt = row.lastAttempt;
        }
      });
      
      // Calculate combined mastery status
      Object.values(progressMap).forEach(progress => {
        const totalAttempts = progress.attempts + progress.flashcardAttempts;
        if (totalAttempts > 0) {
          // Calculate combined score for mastery determination
          let combinedScore = 0;
          if (progress.attempts > 0 && progress.flashcardAttempts > 0) {
            // Fixed: Simple weighted average - 60% quiz, 40% flashcard
            combinedScore = (progress.averageScore * 0.6) + (progress.averageFlashcardScore * 0.4);
          } else if (progress.attempts > 0) {
            combinedScore = progress.averageScore;
          } else {
            combinedScore = progress.averageFlashcardScore;
          }
          
          progress.isMastered = combinedScore >= 95;
        }
      });
      
      callback(null, progressMap);
    }
  );
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
