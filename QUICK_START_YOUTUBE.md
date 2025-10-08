# Quick Start Guide - YouTube Feature

This guide will help you quickly set up and use the YouTube video transcript feature.

## 🚀 Quick Setup (5 minutes)

### Step 1: Start the Backend Server

**Windows:**
```cmd
cd ai-quiz-flashcard-generator\backend
start_backend.bat
```

**Mac/Linux:**
```bash
cd ai-quiz-flashcard-generator/backend
chmod +x start_backend.sh
./start_backend.sh
```

The server will automatically install dependencies and start running on `http://localhost:5000`.

### Step 2: Open the Application

1. Open `index.html` in your web browser
2. You should see the AI Quiz & Flashcard Generator interface

### Step 3: Configure Your API Key

1. Enter your OpenRouter API key
2. Keep the default model or choose another: `google/gemini-2.0-flash-exp:free`
3. Click "Save Configuration"

### Step 4: Use YouTube Feature

1. Select "YouTube Video URL" from the Content Source dropdown
2. Paste a YouTube video URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
3. Choose your content type (Quiz or Flashcards)
4. Select the number of questions/cards
5. Choose language (English or Indonesian)
6. Click "🚀 Generate Quiz" or "🚀 Generate Flash Cards"

The app will:
- Fetch the video transcript automatically
- Send it to the AI for processing
- Generate your quiz or flashcards!

## 📺 Finding Good YouTube Videos

For best results, use YouTube videos that have:
- ✅ Captions/subtitles enabled
- ✅ Educational or informational content
- ✅ Clear speech and good audio quality
- ✅ Duration of 5-30 minutes (optimal)

## 💡 Tips

1. **Educational Videos**: TED Talks, Khan Academy, Crash Course, etc.
2. **Tutorial Videos**: Programming tutorials, how-to guides
3. **Documentaries**: Short educational documentaries
4. **Lectures**: University lectures, presentations

## ⚠️ Common Issues

**"Error: Make sure the backend server is running"**
- Check if the backend terminal is still open and running
- Look for `Running on http://localhost:5000` in the terminal
- Restart the backend server if needed

**"Failed to fetch transcript"**
- The video might not have captions/subtitles
- Try a different video
- Check if the URL is correct

**"Port 5000 already in use"**
- Another application is using port 5000
- Close that application or modify the port in `backend/app.py`

## 🎯 Example YouTube URLs to Try

- TED Talk: `https://www.youtube.com/watch?v=...`
- Khan Academy: `https://www.youtube.com/watch?v=...`
- Crash Course: `https://www.youtube.com/watch?v=...`

## 🛑 Stopping the Backend

To stop the backend server:
- Press `Ctrl+C` in the terminal window
- Close the terminal window

---

**Ready to learn from YouTube videos? Start generating quizzes now! 🎉**
