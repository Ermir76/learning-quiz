## Gemini's Plan for React Quiz App Setup (Restart Reminder)

This document outlines the steps Gemini will take to set up the React Quiz App, focusing on correctly integrating Tailwind CSS and structuring the application, after a clean restart.


---

**Detailed Plan:**

The User Gives Input: A user provides any kind of input (a URL, a PDF, a screenshot, or plain text).

The "Manager" Identifies the Input: Our backend function will look at the input and intelligently ask, "What is this?"

The "Manager" Delegates to a Professional Specialist:

If it's a URL, the manager will use Bright Data to get the text.

If it's a PDF or Screenshot, the manager will use Google Cloud Document AI to get the text.

If it's plain text, the manager will use it directly.

The "Manager" Hands Off to Gemini: The manager takes the clean text from the specialist and gives it to Gemini to create the final quiz.

First, it asks: "Does this text start with http:// or https://?"

If yes, it knows it's a URL and hands it to the web scraping specialist (like Bright Data).

If no, it goes to the next question.

Next, it asks: "Is this a file that the user uploaded?"

When a user uploads a file, the browser attaches a label to it, like .pdf or .jpg. The manager just reads this label.

If the label is .pdf, it knows it's a PDF and hands it to the document specialist (like Google Document AI).

If the label is .jpg, it knows it's a screenshot.

Finally, if the answer to all previous questions is "no," the manager knows it's not a URL and it's not a file. It correctly concludes: "This must be plain text." It then hands this text directly to Gemini.


funkar detta plan? 
🎯 Mål: Konfigurera multer för file uploads

1. Lägg till multer import
2. Konfigurera multer med säkra inställningar
3. Lägg till multer middleware till /api/generateQuiz route
4. Hantera både files och text i samma endpoint

🎯 Mål: Utöka "manager" funktionen enligt din plan

Nuvarande manager:
- Kollar om URL → skicka till web scraper
- Annars → behandla som text

Ny manager ska kolla:
1. Är det URL? → web scraper
2. Är det fil? → kolla fil-typ
   - PDF? → Document AI specialist
   - Image? → OCR specialist  
3. Annars → plain text

🎯 Mål: Skapa funktioner för PDF och Image processing

1. Skapa processPDF() funktion
2. Skapa processImage() funktion
3. Integrera med Google Document AI (om vi har API key)
4. Fallback till enkel text extraction

🎯 Mål: Testa alla input-typer

1. Text input (befintlig)
2. URL input (befintlig) 
3. PDF upload (ny)
4. Image upload (ny)
5. Clipboard paste (ny)