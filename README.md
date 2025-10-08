# 🧠 AI Quiz & Flashcard Generator

A visually appealing web application that generates interactive quizzes and flashcards from documents or YouTube videos using AI (Gemini 2.5 Pro via OpenRouter API).

## ✨ Features

1. **Multiple Content Sources**: 
   - Upload text documents (.txt, .pdf, .doc, .docx)
   - Provide YouTube video URL to generate content from video transcripts
   - **NEW**: Scrape website content from any URL using Firecrawl
2. **Dual Content Mode**: Choose between Interactive Quiz or Flash Cards
3. **Customizable Quiz**: Choose the number of MCQ questions (1-20)
4. **Customizable Flashcards**: Choose the number of flash cards (1-30)
5. **Multi-language Support**: Generate content in English or Indonesian
6. **Interactive Practice Mode**: Take quizzes with immediate feedback
7. **Interactive Flashcards**: Flip cards to reveal answers with smooth animations
8. **Detailed Explanations**: View answers and explanations after each question
9. **Comprehensive Results**: See your quiz score and review all questions
10. **Navigation Controls**: Navigate through flashcards with Previous/Next buttons

## 🚀 Getting Started

### Deployment Options

**Option 1: Deploy to Render (Recommended for Production)**
- ☁️ Cloud-hosted, always accessible
- 📖 See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for complete deployment guide
- 🆓 Free tier available

**Option 2: Run Locally**
- 💻 Run on your computer
- 🔧 Requires Python installation for YouTube & Website features
- 📝 Follow instructions below

### Prerequisites

- A web browser (Chrome, Firefox, Safari, Edge)
- An OpenRouter API key ([Get one here](https://openrouter.ai/))
- The API key should have access to Gemini models
- **For YouTube & Website Scraping**: Python 3.7+ installed on your system
- **For Website Scraping**: Firecrawl API key ([Get free key here](https://firecrawl.dev))
- **For Render Deployment**: See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)

### Installation

1. Download or clone this repository
2. For document-only usage: No installation required - just open `index.html` in your browser
3. **For YouTube video support**: Follow the Backend Setup instructions below

### Backend Setup (Required for YouTube Videos & Website Scraping)

To use the YouTube video transcript and website scraping features, you need to run the Python backend server:

#### Windows:
1. Open Command Prompt or PowerShell
2. Navigate to the `backend` folder:
   ```
   cd ai-quiz-flashcard-generator/backend
   ```
3. Run the startup script:
   ```
   start_backend.bat
   ```

#### Mac/Linux:
1. Open Terminal
2. Navigate to the `backend` folder:
   ```bash
   cd ai-quiz-flashcard-generator/backend
   ```
3. Make the script executable (first time only):
   ```bash
   chmod +x start_backend.sh
   ```
4. Run the startup script:
   ```bash
   ./start_backend.sh
   ```

The backend server will start on `http://localhost:5000`. Keep this terminal window open while using the YouTube feature.

**Manual Installation (Alternative):**
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Usage

1. **Configure API Settings**:
   - Enter your OpenRouter API key (required)
   - Enter the model name (default: `google/gemini-2.0-flash-exp:free`)
   - Enter your Firecrawl API key (optional, only needed for website scraping)
   - Click "Save Configuration"

2. **Select Content Source**:
   - Choose from "Upload Document", "YouTube Video URL", or "Website URL"
   
   **For Document Upload:**
   - Click "Choose File" and select a document (use `sample-document.txt` for testing)
   - Supported formats: .txt, .pdf, .doc, .docx
   
   **For YouTube Video:**
   - Ensure the backend server is running (see Backend Setup above)
   - Paste a YouTube video URL (e.g., `https://www.youtube.com/watch?v=xxxxx`)
   - The system will automatically fetch the transcript when you click Generate
   
   **For Website URL:**
   - Ensure the backend server is running (see Backend Setup above)
   - Ensure you have entered your Firecrawl API key in configuration
   - Paste a website URL (e.g., `https://example.com/article`)
   - The system will automatically scrape the content when you click Generate
   - Works with static websites, JavaScript-heavy SPAs, and blogs

3. **Configure Content Generation**:
   - Select content type (Interactive Quiz or Flash Cards)
   - For Quiz: Choose the number of questions (1-20)
   - For Flashcards: Choose the number of cards (1-30)
   - Choose the language (English or Indonesian)
   - Click "🚀 Generate Quiz" or "🚀 Generate Flash Cards"

3. **Quiz Practice Mode**:
   - Read each question carefully
   - Select your answer by clicking on an option
   - View immediate feedback and explanation
   - Click "Next Question" to continue
   - Complete all questions

4. **Flashcard Study Mode**:
   - View the front of each flashcard (question/concept)
   - Click to flip and reveal the answer/explanation
   - Use Previous/Next buttons to navigate
   - Track your progress with the visual progress bar
   - Click "Create New Content" when done

5. **Quiz Results**:
   - See your overall score and percentage
   - Review each question with correct/incorrect indicators
   - Read explanations for questions you missed
   - Click "Create New Content" to start over

## 📋 Supported Document Formats

- `.txt` - Plain text files (recommended)
- `.pdf` - PDF documents
- `.doc` - Microsoft Word documents
- `.docx` - Microsoft Word documents (newer format)

## 🔧 Technical Details

### Technologies Used
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Python Flask, CORS support
- **AI Model**: Gemini 2.5 Pro via OpenRouter API
- **APIs**: 
  - OpenRouter API for AI completions
  - YouTube Transcript API for video transcripts
  - Firecrawl API for website scraping

### File Structure
```
ai-quiz-flashcard-generator/
├── index.html              # Main HTML structure
├── styles.css              # Styling and visual design
├── script.js               # Application logic and API integration
├── sample-document.txt     # Sample document for testing
├── README.md               # Documentation
└── backend/                # Python backend server
    ├── app.py              # Flask server with API endpoints
    ├── requirements.txt    # Python dependencies
    ├── start_backend.bat   # Windows startup script
    └── start_backend.sh    # Mac/Linux startup script
```

### API Configuration

The app uses OpenRouter API with the following default settings:
- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Default Model**: `google/gemini-2.0-flash-exp:free`
- **Headers**: Authorization, Content-Type, HTTP-Referer

You can use other Gemini models available on OpenRouter:
- `google/gemini-2.0-flash-exp:free` (Free tier)
- `google/gemini-pro-1.5` (Paid)
- Other compatible models

## 🎨 Design Features

- **Modern UI**: Clean, gradient-based design with smooth animations
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Interactive**: Hover effects and visual feedback
- **Progress Tracking**: Visual progress bar and question/card counter
- **Color-coded Feedback**: Green for correct, red for incorrect answers
- **3D Card Flip Animation**: Smooth perspective-based flip effect for flashcards
- **Dual Gradient Themes**: Purple gradient for questions, green gradient for answers

## 📝 Tips for Best Results

1. **Document Quality**: Use well-structured documents with clear content
2. **Document Length**: Optimal length is 500-2000 words
3. **Number of Questions**: Start with 5-10 questions for best quiz results
4. **Number of Flashcards**: 10-15 cards work well for most documents
5. **Language Selection**: Ensure document language matches content language
6. **Content Type Selection**: 
   - Use Quiz mode for testing knowledge and practice
   - Use Flashcard mode for memorization and review
7. **API Key**: Keep your API key secure and don't share it

## 🔒 Security Notes

- Your API key is stored only in browser memory (not saved permanently)
- No data is sent to any server except OpenRouter API
- The app runs entirely in your browser
- Clear your browser cache to remove any stored data

## 🐛 Troubleshooting

**Quiz generation fails:**
- Verify your API key is correct
- Check your internet connection
- Ensure the document has sufficient content
- Try a different model name if current one doesn't work

**File won't upload:**
- Check file format is supported
- Ensure file size is reasonable (< 1MB recommended)
- Try converting to .txt format

**Questions/Cards are in wrong language:**
- Double-check language selection matches document
- Try regenerating the content

**Flashcard won't flip:**
- Ensure you're clicking directly on the card
- Try refreshing the page if the issue persists

**YouTube transcript fetch fails:**
- Make sure the backend server is running (`http://localhost:5000`)
- Check if the video has captions/subtitles available
- Try using a different video URL
- Ensure Python and required packages are installed correctly
- Some videos may not have transcripts available

**Website scraping fails:**
- Make sure the backend server is running (`http://localhost:5000`)
- Verify you have entered a valid Firecrawl API key in configuration
- Check if the website URL is accessible and valid
- Some websites may block scraping or have complex structures
- Try using a different article or blog post URL
- Ensure you have internet connectivity

**Backend server won't start:**
- Ensure Python 3.7+ is installed: `python --version`
- Install dependencies manually: `pip install -r requirements.txt`
- Check if port 5000 is already in use by another application
- Try running the app.py file directly: `python app.py`

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Feel free to fork this project and submit improvements!

## 📞 Support

For issues with:
- OpenRouter API: Visit [OpenRouter Documentation](https://openrouter.ai/docs)
- This app: Check the code comments in `script.js` for implementation details

---

**Enjoy creating AI-powered quizzes! 🎉**
