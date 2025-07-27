// This is the smart "manager" function. Now it handles both plain text and URLs.
// It securely calls the real Gemini AI and BrightData for web scraping.

// Note: This file has been changed to use the Node.js module system (require/module.exports)

//const fetch = require('node-fetch'); // We need to require fetch for Node.js
const { classifierPrompt, quizGeneratorPrompts } = require('../promptTemplates.js');

// Helper function to check if input is a URL
function isValidURL(text) {
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// Helper function to extract text from URL using BrightData Web Unlocker API
async function extractTextFromURL(url) {
  const apiToken = process.env.BRIGHTDATA_API_TOKEN;
  const zoneName = process.env.BRIGHTDATA_ZONE_NAME;
  
  if (!apiToken || !zoneName) {
    throw new Error("Server configuration error: BrightData credentials not found. Add BRIGHTDATA_API_TOKEN and BRIGHTDATA_ZONE_NAME to your .env file.");
  }

  // BrightData Web Unlocker API endpoint
  const endpoint = 'https://api.brightdata.com/request';

  const payload = {
    zone: zoneName,
    url: url,
    format: 'raw' // Get raw HTML response
  };

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
  
  // Extract text from HTML using basic regex (removes HTML tags)
  const textContent = htmlContent
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
  
  if (!textContent || textContent.length < 100) {
    throw new Error("Could not extract sufficient text content from the URL. The page might be empty or protected.");
  }

  return textContent;
}

// Helper function to call the real Gemini API
async function callAI(prompt, isQuizGeneration = false) {
  // Use the server-side environment variable loaded from the .env file
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Server configuration error: Gemini API key not found.");
  }
  

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  if (isQuizGeneration) {
    payload.generationConfig = { "maxOutputTokens": 4096 };
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
  const rawText = data.candidates[0].content.parts[0].text;
  return rawText.replace(/```json/g, '').replace(/```/g, '').trim();
}


// This is the main function that the frontend will call
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed.' });
  }

  try {
    const { topic: inputText, numQuestions } = req.body;
    if (!inputText) {
      return res.status(400).json({ message: 'Text input or URL is required.' });
    }
    
    let plainText;
    
    // Check if input is a URL or plain text
    if (isValidURL(inputText)) {
      console.log('URL detected, extracting text content...');
      try {
        plainText = await extractTextFromURL(inputText);
        console.log('Text extracted successfully from URL');
      } catch (urlError) {
        console.error('URL extraction failed:', urlError.message);
        return res.status(400).json({ 
          message: 'Failed to extract content from URL. Please check the URL or try with plain text.' 
        });
      }
    } else {
      // Use input as plain text
      plainText = inputText;
    }
    
    const classificationPrompt = `${classifierPrompt}\n\nUser Topic: "${plainText.substring(0, 500)}..."`;
    const categoryName = await callAI(classificationPrompt, false);

    if (categoryName === 'Other' || !quizGeneratorPrompts[categoryName]) {
         return res.status(400).json({ message: "Could not determine a valid category for this content." });
    }

    const generatorPromptFunction = quizGeneratorPrompts[categoryName];
    const generatorPrompt = generatorPromptFunction(plainText, numQuestions);
    const quizJsonString = await callAI(generatorPrompt, true);
    
    res.status(200).json({ quiz: JSON.parse(quizJsonString), category: categoryName });

  } catch (error) {
    console.error('Error in serverless function:', error.message);
    res.status(500).json({ message: 'Failed to generate quiz. Please try again.' });
  }
}

// This makes the handler function available to our server.js file
module.exports = handler;