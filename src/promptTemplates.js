// promptTemplates.js

// ==================================================================================
// STEP 1: CLASSIFIER PROMPT
// This prompt'''s only job is to categorize the user'''s topic.
// ==================================================================================
const classifierPrompt = `
You are a highly accurate content classifier. Your ONLY job is to analyze the user'''s topic and determine which single category it belongs to from the predefined list.

You MUST choose one category from the following list:
["Programming", "Science", "History", "Literature", "Mathematics", "Geography", "Arts", "Sports", "Technology", "Health", "Business", "Other"]

- Your response MUST be only a single word from that list.
- Do not add any explanation or punctuation.
- If the topic is ambiguous, nonsensical, or does not clearly fit into any category, you MUST classify it as "Other".

Example 1:
User Topic: "The American Civil War"
Category: History

Example 2:
User Topic: "The C# programming language"
Category: Programming

Example 3:
User Topic: "The best summer blockbuster movies"
Category: Other
`;

// ==================================================================================
// STEP 2: HELPER FUNCTIONS FOR QUIZ GENERATION PROMPTS
// These functions create the specific instructions for the AI for different subjects.
// ==================================================================================

/**
 * Creates a standard prompt for most categories.
 * Ensures a consistent JSON structure for multiple-choice questions.
 */
const createStandardPrompt = (topic, numQuestions) => `
Generate a ${numQuestions}-question multiple-choice quiz about "${topic}".
The response MUST be a single valid JSON object with a "title", a "questions" array, and a "tags" array.
The "tags" array should contain relevant keywords based on the topic.
Each object in the "questions" array must have the following properties:
- "text": The question text.
- "type": "multiple-choice".
- "options": An array of exactly 4 string options.
- "correctAnswer": The numeric index (0-3) of the correct option.
- "explanation": A brief explanation of why the correct answer is correct.
- "learnMoreUrl": A relevant URL for learning more, or an empty string.

Example of the required JSON structure:
{
  "title": "Quiz on ${topic}",
  "tags": ["History", "Ancient Rome"],
  "questions": [
    {
      "text": "What is the capital of France?",
      "type": "multiple-choice",
      "options": ["Berlin", "Madrid", "Paris", "Rome"],
      "correctAnswer": 2,
      "explanation": "Paris is the capital and most populous city of France.",
      "learnMoreUrl": "https://en.wikipedia.org/wiki/Paris"
    }
  ]
}
`;

/**
 * Creates a special prompt for Science (Physics, Chemistry) that uses LaTeX.
 */
const createSciencePrompt = (topic, numQuestions) => `
Generate a ${numQuestions}-question multiple-choice quiz about the science topic "${topic}".
You MUST use LaTeX for all scientific notation, including chemical formulas, physical equations, and units. Enclose all LaTeX expressions in ' delimiters. For chemical formulas, write '$H_2O. For physics equations, write '$F = ma.
IMPORTANT: When using LaTeX expressions in JSON strings, you must escape all backslashes by doubling them. Write '\\frac{1}{2}' instead of '\frac{1}{2}' to ensure valid JSON parsing.
The response MUST be a single valid JSON object with a "title", a "questions" array, and a "tags" array.
The "tags" array should contain relevant keywords based on the topic.
Each object in the "questions" array must have the following properties:
- "text": The question text.
- "type": "multiple-choice".
- "options": An array of exactly 4 string options.
- "correctAnswer": The numeric index (0-3) of the correct option.
- "explanation": A brief explanation of why the correct answer is correct. This explanation should also use LaTeX where appropriate.
- "learnMoreUrl": A relevant URL for learning more, or an empty string.

Example of the required JSON structure:
{
  "title": "Quiz on ${topic}",
  "tags": ["Science", "Chemistry"],
  "questions": [
    {
     "text": "What is the chemical formula for water?",
     "type": "multiple-choice",
     "options": ["$H_2O$", "$CO_2$", "$NaCl$", "$CH_4$"],
     "correctAnswer": 0,
     "explanation": "A molecule of water is composed of two hydrogen atoms and one oxygen atom, hence $H_2O$.",
     "learnMoreUrl": "https://en.wikipedia.org/wiki/Water"
    }
  ]
}
`;

/**
 * Creates a special prompt for Mathematics that uses LaTeX.
 */
const createMathPrompt = (topic, numQuestions) => `
Generate a ${numQuestions}-question multiple-choice quiz about the math topic "${topic}".
You MUST use LaTeX for all mathematical formulas and variables. Enclose all LaTeX expressions in ' delimiters. For example, for x squared, write '$x^2.
IMPORTANT: When using LaTeX expressions in JSON strings, you must escape all backslashes by doubling them. Write '\\frac{1}{2}' instead of '\frac{1}{2}' to ensure valid JSON parsing.
The response MUST be a single valid JSON object with a "title", a "questions" array, and a "tags" array.
The "tags" array should contain relevant keywords based on the topic.
Each object in the "questions" array must have the following properties:
- "text": The question text.
- "type": "multiple-choice".
- "options": An array of exactly 4 string options.
- "correctAnswer": The numeric index (0-3) of the correct option.
- "explanation": A brief explanation of why the correct answer is correct. This explanation should also use LaTeX where appropriate.
- "learnMoreUrl": A relevant URL for learning more, or an empty string.

Example of the required JSON structure:
{
  "title": "Quiz on ${topic}",
  "tags": ["Mathematics", "Calculus"],
  "questions": [
    {
      "text": "What is the derivative of $x^2$?",
      "type": "multiple-choice",
      "options": ["$x$", "$2x$", "$x^3$", "$2x^2$"],
      "correctAnswer": 1,
      "explanation": "The power rule of differentiation states that the derivative of $x^n$ is $nx^{n-1}$. For $x^2$, this is $2x^{2-1} = 2x$.",
      "learnMoreUrl": "https://en.wikipedia.org/wiki/Derivative"
    }
  ]
}
`;

// ==================================================================================
// STEP 3: THE MAIN EXPORTED OBJECT
// This object maps each category to the correct prompt-generating function.
// ==================================================================================
const quizGeneratorPrompts = {
  // Special prompt for Programming to get mixed question types
  Programming: (topic, numQuestions) => `
  Generate a ${numQuestions}-question quiz about the programming topic "${topic}".
  Create a mix of 'multiple-choice' and 'code-input' question types.
  The response MUST be a single valid JSON object with a "title", a "questions" array, and a "tags" array.
  The "tags" array should contain relevant keywords based on the topic (e.g., "JavaScript", "React", "Data Structures").

  For 'multiple-choice' questions, use this structure:
  {
    "text": "Question text?",
    "type": "multiple-choice",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "A brief explanation of why the correct answer is correct.",
    "learnMoreUrl": "A relevant URL or an empty string"
  }

  For 'code-input' questions, use this structure:
  {
    "text": "A question asking the user to write a line of code.",
    "type": "code-input",
    "correctAnswer": "The exact line of code.",
    "explanation": "A brief explanation of why this is the correct code snippet.",
    "learnMoreUrl": "A relevant URL or an empty string"
  }
  `
,

  // Use the specialized prompts for these categories
  Science: createSciencePrompt,
  Mathematics: createMathPrompt,

  // All other categories use the standard, reliable prompt
  History: createStandardPrompt,
  Literature: createStandardPrompt,
  Geography: createStandardPrompt,
  Arts: createStandardPrompt,
  Sports: createStandardPrompt,
  Technology: createStandardPrompt,
  Health: createStandardPrompt,
  Business: createStandardPrompt,
  Other: createStandardPrompt,
};

module.exports = {
  classifierPrompt,
  quizGeneratorPrompts,
};
