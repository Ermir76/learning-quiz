// This is the smart "manager" function. It now uses the multimodal capabilities of Gemini 1.5 Flash
// to handle file uploads (PDF, images, text), URLs, and plain text.

const { classifierPrompt, quizGeneratorPrompts } = require('../promptTemplates.js');

// --- Helper Functions ---

function isValidURL(text) {
  try {
    // Use a more robust check for URLs
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extracts text from a given URL using BrightData.
 * @param {string} url The URL to scrape.
 * @returns {Promise<string>} The extracted text content.
 */
async function extractTextFromURL(url) {
  const apiToken = process.env.BRIGHTDATA_API_TOKEN;
  const zoneName = process.env.BRIGHTDATA_ZONE_NAME;
  
  if (!apiToken || !zoneName) {
    throw new Error("Server configuration error: BrightData credentials not found.");
  }

  const endpoint = 'https://api.brightdata.com/request';
  const payload = { zone: zoneName, url: url, format: 'raw' };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("BrightData API Error:", errorBody);
    throw new Error(`BrightData API call failed with status ${response.status}`);
  }

  const htmlContent = await response.text();
  // Basic but effective HTML to text conversion
  const textContent = htmlContent
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (!textContent || textContent.length < 50) { // Check for at least some content
    throw new Error("Could not extract sufficient text content from the URL.");
  }

  return textContent;
}

/**
 * Calls the multimodal Gemini AI. It can process text prompts, or a combination
 * of a text prompt and a file (image, PDF, etc.).
 * @param {string} prompt The text prompt to send to the AI.
 * @param {boolean} isQuizGeneration Whether to use generation-specific settings.
 * @param {object|null} file The file object from multer { mimetype, buffer }.
 * @returns {Promise<string>} The raw text response from the AI.
 */
async function callAI(prompt, isQuizGeneration = false, file = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Server configuration error: Gemini API key not found.");
  }
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const parts = [{ text: prompt }];

  // If a file is provided, add it to the request payload
  if (file) {
    parts.push({
      inline_data: {
        mime_type: file.mimetype,
        data: file.buffer.toString('base64')
      }
    });
  }

  const payload = {
    contents: [{ parts: parts }],
  };

  if (isQuizGeneration) {
    payload.generationConfig = { 
        "maxOutputTokens": 8192,
        "response_mime_type": "application/json" // Request JSON output for quizzes
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("AI API Error:", errorBody);
    throw new Error(`AI API call failed with status ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0].content.parts[0].text) {
      console.error("Invalid AI Response:", data);
      throw new Error("The AI returned an invalid or empty response.");
  }

  const rawText = data.candidates[0].content.parts[0].text;
  // The response for quiz generation should already be JSON, so no need to strip ```
  return rawText;
}


// --- Main Handler (The \"Manager\") ---

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed.' });
  }

  try {
    const { topic: inputText, numQuestions } = req.body;
    const files = req.files;
    let plainText;
    let contextSource = "input"; // For logging

    // --- Step 1: Extract Text from the Provided Source ---
    if (files && files.length > 0) {
      const file = files[0];
      contextSource = `the file '${file.originalname}'`;
      console.log(`Input is ${contextSource}. Extracting text with multimodal AI...`);
      // Use the multimodal AI to extract text from the file
      plainText = await callAI("Extract all text from the attached document. Focus on the main content.", false, file);

    } else if (inputText && isValidURL(inputText)) {
      contextSource = `the URL '${inputText}'`;
      console.log(`Input is ${contextSource}. Fetching content...`);
      plainText = await extractTextFromURL(inputText);

    } else if (inputText) {
      contextSource = "the provided plain text";
      console.log(`Input is ${contextSource}.`);
      plainText = inputText;
    
    } else {
      return res.status(400).json({ message: 'Input required. Please provide a file, URL, or text.' });
    }
    
    if (!plainText || plainText.trim().length === 0) {
        return res.status(400).json({ message: `Could not extract any text from ${contextSource}.` });
    }
    console.log(`Successfully extracted text from ${contextSource}. Now generating quiz...`);

    // --- Step 2: Generate Quiz from the Extracted Text ---
    const classificationPrompt = `${classifierPrompt}\n\nUser Topic: "${plainText.substring(0, 1000)}..."`;
    const rawCategoryName = await callAI(classificationPrompt);
    console.log(`AI raw category response: "${rawCategoryName}"`); // Log the raw response

    // Normalize the response to match the keys in quizGeneratorPrompts
    const categoryName = rawCategoryName.trim();

    if (!quizGeneratorPrompts[categoryName]) {
         console.error(`Category "${categoryName}" is not a valid or supported category.`);
         return res.status(400).json({ message: `Could not determine a valid category for this content. The AI suggested "${categoryName}".` });
    }

    const generatorPromptFunction = quizGeneratorPrompts[categoryName];
    const generatorPrompt = generatorPromptFunction(plainText, numQuestions);
    // Call the AI again, this time to generate the JSON quiz
    const quizJsonString = await callAI(generatorPrompt, true);
    
    // The AI now returns a JSON string directly, so we just need to parse it.
    res.status(200).json({ quiz: JSON.parse(quizJsonString), category: categoryName });

  } catch (error) {
    console.error('Error in handler:', error.message);
    res.status(500).json({ message: `An error occurred: ${error.message}` });
  }
}

module.exports = handler;