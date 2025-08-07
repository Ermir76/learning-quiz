// This is the smart "manager" function. It now uses the multimodal capabilities of Gemini 1.5 Flash
// to handle file uploads (PDF, images, text), URLs, and plain text.

const { classifierPrompt, quizGeneratorPrompts } = require('../promptTemplates.js');
const ScraperFactory = require('./scrapers/ScraperFactory');

// --- Helper Functions ---

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
 * Extracts text from a given URL using the configured scraper system.
 * @param {string} url The URL to scrape.
 * @param {object} options Scraping options including scraper preference.
 * @returns {Promise<string>} The extracted text content.
 */
async function extractTextFromURL(url, options = {}) {
  const result = await ScraperFactory.extractText(url, options);
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to extract text from URL');
  }
  
  return result.text;
}

/**
 * Calls the multimodal Gemini AI with retry and fallback logic.
 * @param {string} prompt The text prompt to send to the AI.
 * @param {boolean} isQuizGeneration Whether to use generation-specific settings.
 * @param {object|null} file The file object from multer { mimetype, buffer }.
 * @returns {Promise<{rawText: string, modelUsed: string}>} The raw text response and the model that was used.
 */
async function callAI(prompt, isQuizGeneration = false, file = null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Server configuration error: Gemini API key not found.");
  }

  const primaryModel = 'gemini-2.5-flash';
  const fallbackModel = 'gemini-1.5-flash';

  const attemptAPICall = async (model) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const parts = [{ text: prompt }];

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
          "response_mime_type": "application/json"
      };
    }

    const maxRetries = 2; // Reduced retries for faster fallback
    let delay = 1000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          if (!data.candidates || !data.candidates[0].content.parts[0].text) {
            console.error(`Invalid AI Response from ${model}:`, data);
            throw new Error(`The AI (${model}) returned an invalid or empty response.`);
          }
          console.log(`[32mSuccessfully received response from ${model}.[0m`); // Green text
          return { rawText: data.candidates[0].content.parts[0].text, modelUsed: model };
        }

        if (response.status >= 500 && response.status < 600) {
          console.warn(`[33mAI API call to ${model} failed with status ${response.status}. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})[0m`);
          if (i < maxRetries - 1) {
            await sleep(delay);
            delay *= 2;
            continue;
          } else {
            throw new Error(`AI API call to ${model} failed after ${maxRetries} attempts with status ${response.status}.`);
          }
        }
        
        const errorBody = await response.text();
        console.error(`AI API Error from ${model}:`, errorBody);
        throw new Error(`AI API call to ${model} failed with status ${response.status}`);

      } catch (error) {
        console.error(`[31mAttempt ${i + 1} for ${model} failed with network error: ${error.message}[0m`);
        if (i === maxRetries - 1) {
           throw new Error(`AI API call to ${model} failed after ${maxRetries} attempts: ${error.message}`);
        }
        await sleep(delay);
        delay *= 2;
      }
    }
     throw new Error(`AI API call to ${model} failed definitively after ${maxRetries} attempts.`);
  };

  try {
    console.log(`
Attempting API call with primary model: [36m${primaryModel}[0m`);
    return await attemptAPICall(primaryModel);
  } catch (primaryError) {
    console.warn(`[33mPrimary model (${primaryModel}) failed: ${primaryError.message}. Attempting fallback to ${fallbackModel}.[0m`);
    try {
      console.log(`Attempting API call with fallback model: [36m${fallbackModel}[0m`);
      return await attemptAPICall(fallbackModel);
    } catch (fallbackError) {
      console.error(`[31mFallback model (${fallbackModel}) also failed: ${fallbackError.message}[0m`);
      throw new Error(`Both primary and fallback AI models failed. Last error: ${fallbackError.message}`);
    }
  }
}


// --- Main Handler (The "Manager") ---

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed.' });
  }

  try {
    const { topic: inputText, numQuestions, primaryScraper, fallbackScraper } = req.body;
    const files = req.files;
    let plainText;
    let contextSource = "input"; // For logging
    let modelUsedForTextExtraction = null;

    // --- Step 1: Extract Text from the Provided Source ---
    if (files && files.length > 0) {
      const file = files[0];
      contextSource = `the file '${file.originalname}'`;
      console.log(`Input is ${contextSource}. Extracting text with multimodal AI...`);
      const extractionResult = await callAI("Extract all text from the attached document. Focus on the main content.", false, file);
      plainText = extractionResult.rawText;
      modelUsedForTextExtraction = extractionResult.modelUsed;
      console.log(`Text extracted using ${modelUsedForTextExtraction}.`);

    } else if (inputText && isValidURL(inputText)) {
      contextSource = `the URL '${inputText}'`;
      console.log(`Input is ${contextSource}. Fetching content with ${primaryScraper || 'default'} scraper...`);
      
      const scraperOptions = {
        primaryScraper: primaryScraper || 'puppeteer',
        fallbackScraper: fallbackScraper || 'apify',
        timeout: 30000
      };
      
      plainText = await extractTextFromURL(inputText, scraperOptions);

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
    const classificationPrompt = `${classifierPrompt}\n\nUser Topic: "${plainText.substring(0, 1000)}"..."`;
    const { rawText: rawCategoryName, modelUsed: modelForCategory } = await callAI(classificationPrompt);
    console.log(`AI raw category response from ${modelForCategory}: "${rawCategoryName}"`);

    const categoryName = rawCategoryName.trim();

    if (!quizGeneratorPrompts[categoryName]) {
         console.error(`Category "${categoryName}" is not a valid or supported category.`);
         return res.status(400).json({ message: `Could not determine a valid category for this content. The AI suggested "${categoryName}".` });
    }

    const generatorPromptFunction = quizGeneratorPrompts[categoryName];
    const generatorPrompt = generatorPromptFunction(plainText, numQuestions);
    
    const { rawText: quizJsonString, modelUsed: modelForQuiz } = await callAI(generatorPrompt, true);
    
    res.status(200).json({ quiz: JSON.parse(quizJsonString), category: categoryName, modelUsed: modelForQuiz });

  } catch (error) {
    console.error(`[31mError in handler: ${error.message} [0m`);
    res.status(500).json({ message: `An error occurred: ${error.message}` });
  }
}

module.exports = handler;
