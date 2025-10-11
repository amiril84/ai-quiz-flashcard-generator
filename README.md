# 🧠 AI Quiz & Flashcard Generator (React Edition)

A visually appealing web application that generates interactive quizzes and flashcards from documents, YouTube videos, websites, or any topic using AI. This version is built with a modern React frontend and a Python Flask backend.

## ✨ Features

1.  **Multiple Content Sources**:
    -   **From a Topic**: Type any topic and let the AI generate quiz or flashcards  
    -   **Document Upload**: Upload your document to generate quiz or flashcards
    -   **YouTube Video**: Provide a YouTube video URL to generate quiz or flashcards
    -   **Website Content**: Provide a website URL like Wikipedia  to generate quiz or flashcards
2.  **Adaptive AI Prompts**:
    -   When generating from a topic, the AI intelligently detects user-specified difficulty and audience (e.g., "for beginners", "for college students")
3.  **Dual Content Mode**: Choose between an Interactive Quiz or Flash Cards
4.  **Customizable Quiz**: Choose the number of multiple-choice questions (1-20)
4.  **Customizable Flashcards**: Choose the number of flash cards (1-30)
5.  **Multi-language Support**: Generate content in English or Indonesian
6.  **Interactive Practice Mode**: Take quizzes with immediate feedback
7.  **Interactive Flashcards**: Flip cards to reveal answers with smooth animations
8.  **Detailed Explanations**: View answers and explanations after each question
9.  **Comprehensive Results**: See your quiz score and review all questions
10. **Modern UI**: Built with React, Vite, and Shadcn UI components.

## 🚀 Getting Started

### Deployment Options

**Option 1: Deploy to Render (Recommended for Production)**
- ☁️ Cloud-hosted, always accessible
- 📖 See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for complete deployment guide
- 🆓 Free tier available

**Option 2: Run Locally**
- 💻 Run on your computer
- 🔧 Requires Python and Node.js installation
- 📝 Follow instructions below

### Prerequisites

- A web browser (Chrome, Firefox, Safari, Edge)
- An OpenRouter API key ([Get one here](https://openrouter.ai/))
- The API key should have access to the model you intend to use.
- **Node.js** v18+ and **npm** for the frontend.
- **Python** 3.7+ for the backend.
- **For Website URL**: Use FireCreawl API
- **For Youtube URL**: Use Youtube Transcript API from RapidAPI

### Local Development Setup

This project uses a monorepo structure with a React frontend and a Python backend. You'll need to run two separate processes.

#### 1. Backend Setup

The backend is a Python Flask server that handles YouTube and website content processing.

**On Windows:**
1.  Open Command Prompt or PowerShell.
2.  Navigate to the `backend` folder: `cd backend`
3.  Run: `python app.py`

**On Mac/Linux:**
1.  Open your terminal.
2.  Navigate to the `backend` folder: `cd backend`
3.  Run : `python app.py`

The backend server will start on `http://localhost:5000`. Keep this terminal open.

**Manual Backend Start:**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

#### 2. Frontend Setup

The frontend is a React application built with Vite.

1.  Open a **new terminal window**.
2.  Navigate to the `frontend` folder: `cd frontend`
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
5.  Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`).

### Usage

1.  With both backend and frontend servers running, open the frontend URL in your browser.
2.  **Configure API Settings** in the UI:
    -   Enter your OpenRouter API key.
    -   Enter the AI model name (e.g., `google/gemini-pro-1.5`).
    -   Enter your Firecrawl API key (for website scraping).
    -   Enter your RapidAPI's Youtube API key (to retrieve youtube transcript)
    -   Click "Save Configuration".
3.  **Select Content Source** (Topic, Document, YouTube, or Website URL).
4.  **Configure and Generate** your Quiz or Flashcards.
5.  Interact with the generated content.

## 🔧 Technical Details

### Technologies Used
- **Frontend**: React, Vite, Tailwind CSS, Shadcn UI
- **Backend**: Python, Flask
- **AI Model**: Gemini series via OpenRouter API
- **APIs**:
  - OpenRouter API for AI completions
  - YouTube Transcript API from RapidAPI for video transcripts
  - Firecrawl API for website scraping

### File Structure
```
ai-quiz-flashcard-generator/
├── frontend/                   # React SPA Frontend
│   ├── src/                    # Source code
│   │   ├── components/         # React components
│   │   └── App.jsx             # Main application component
│   └── vite.config.js          # Vite configuration
├── backend/                    # Python Backend
│   ├── app.py                  # Flask server
│   ├── prompts/                # Directory for AI prompt templates
│   │   ├── generate_quiz.md
│   │   ├── generate_flashcard.md
│   │   ├── generate_quiz_from_topic.md
│   │   └── generate_flashcard_from_topic.md
│   └── requirements.txt        # Python dependencies
├── planning.md                 # Project planning documentation
├── Dockerfile                  # Docker config for backend deployment
├── render.yaml                 # Render deployment configuration
└── README.md                   # This file
```

## 🐛 Troubleshooting

**Quiz generation fails:**
- Verify your API key is correct and has funds/access.
- Check the browser's developer console and the backend terminal for errors.

**YouTube transcript fetch fails:**
- Make sure the backend Flask server is running on `http://localhost:5000`.
- Check the backend terminal for logs. Some videos may not have transcripts available.

**Website scraping fails:**
- Make sure the backend server is running.
- Verify you have entered a valid Firecrawl API key.

## 📚 Additional Documentation

For specific issues and their solutions, see:
- [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) - Complete deployment guide for Render

## 📄 License

This project is open source and available for educational purposes.
