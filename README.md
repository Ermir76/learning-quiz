# Learning Quiz App

An AI-powered quiz application built with React that generates personalized quizzes from various content sources. Create engaging educational experiences with intelligent question generation and comprehensive learning materials.

## Features

### 🤖 AI-Powered Quiz Generation
*   **Multi-Input Support:** Generate quizzes from text, files (PDF, images), or URLs
*   **Smart Content Extraction:** Uses Google Gemini AI to extract and understand content
*   **Multiple Question Types:** Support for multiple-choice and code-input questions
*   **LaTeX Support:** Advanced mathematical and scientific notation rendering

### 📚 Comprehensive Learning System
*   **Quiz Bank:** Persistent storage of all generated quizzes
*   **Subject Explanations:** Auto-generated detailed explanations for each topic
*   **Category Organization:** Well-organized content across 11+ subject areas
*   **Tag-Based Filtering:** Easy discovery of related content

### 🎯 Interactive Experience
*   **Real-time Feedback:** Immediate answer validation with explanations
*   **Customizable Length:** Choose 5-20 questions per quiz
*   **Progress Tracking:** Detailed results and performance analytics
*   **Responsive Design:** Optimized for desktop and mobile devices

### 🛠️ Advanced Capabilities
*   **Multi-Scraper System:** Support for web scraping with multiple engines
*   **File Upload:** Process PDFs, images, and documents
*   **Bug Reporting:** Built-in error reporting system
*   **Flashcard Mode:** Alternative study method

## Tech Stack

### Frontend
*   **React 19.1.0:** Modern component-based UI framework
*   **Tailwind CSS 3.4.4:** Utility-first CSS framework for styling
*   **React Scripts:** Development and build tooling
*   **KaTeX:** Mathematical notation rendering
*   **HTML2Canvas:** Screenshot and image generation

### Backend
*   **Node.js/Express:** Server-side API handling
*   **SQLite:** Database for persistent storage
*   **Multer:** File upload handling
*   **Google Gemini AI:** Advanced language model for content generation

### AI & Scraping
*   **Multiple Scraper Engines:** Playwright, Puppeteer, Apify integration
*   **Web Scraping:** Automated content extraction from URLs
*   **Document Processing:** PDF and image text extraction

## Project Structure

```
learning_quiz/
├── src/
│   ├── components/          # React UI components
│   │   ├── CreateQuizPage.js    # AI quiz generation interface
│   │   ├── QuizPage.js          # Interactive quiz taking
│   │   ├── FlashcardPage.js     # Alternative study mode
│   │   ├── BugReporter.js       # In-app bug reporting tool
│   │   └── ...
│   ├── api/                 # Backend API endpoints
│   │   ├── generateQuiz.js      # Main quiz generation logic
│   │   └── scrapers/            # Web scraping implementations
│   ├── data/                # Initial application data
│   └── promptTemplates.js   # AI prompt configurations
├── subject_explanations/    # Auto-generated learning materials
├── screenshots/             # Bug report screenshots (auto-generated)
├── public/                  # Static assets
├── server.js               # Express server configuration
├── database.js             # SQLite database setup
└── package.json            # Dependencies and scripts
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ermir76/learning_quiz.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the `learning_quiz` directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   APIFY_API_TOKEN=your_apify_api_token_here
   ```
   
   **API Key Sources:**
   - **Gemini API Key:** Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **Apify API Token:** Get from [Apify Console](https://console.apify.com/account/integrations) (optional - for enhanced web scraping)

4. **Start the development servers**
   
   **Frontend (React):**
   ```bash
   npm start
   ```
   
   **Backend (Express):**
   ```bash
   npm run server
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Usage

1. **Create a Quiz:** Upload a file, enter a URL, or type a topic
2. **AI Generation:** The system automatically categorizes and generates questions
3. **Take Quiz:** Answer questions with immediate feedback
4. **Review Results:** See detailed explanations and learn more links
5. **Browse Library:** Access previously generated quizzes by category

## API Endpoints

### Quiz Generation
- `POST /api/generateQuiz` - Generate quiz from text, file, or URL
- `POST /api/quizzes` - Save generated quiz to database
- `GET /api/quizzes` - Retrieve saved quizzes
- `POST /api/progress` - Save quiz progress/results

### Bug Reporting
- `POST /api/save-bug-report` - Save bug report with screenshots
- `GET /api/next-issue-id` - Get next available issue ID

### Supported Input Types
- **Text:** Direct topic input
- **Files:** PDF, images, text documents
- **URLs:** Web pages with automatic content extraction

## Bug Reporting & Screenshots

The application includes a built-in bug reporting system that allows users to:

- **Visual Bug Reports:** Capture screenshots of issues directly within the app
- **Area Selection:** Select specific screen areas to highlight problems
- **Automatic Documentation:** Screenshots are automatically saved and referenced in issue reports
- **Issue Tracking:** All reports are logged with timestamps and environment details

### Screenshots Folder

The `screenshots/` directory contains:
- **Auto-generated screenshots** from the bug reporting system
- **Organized by issue number** (e.g., `issue-27-screenshot-1.png`)
- **Referenced in ISSUE.md** for easy tracking and resolution

**Usage:** Click the bug report button (🐛) in the app interface to capture and submit bug reports with visual evidence.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Google Gemini AI for intelligent content generation
- Tailwind CSS for beautiful styling
- React community for excellent tooling