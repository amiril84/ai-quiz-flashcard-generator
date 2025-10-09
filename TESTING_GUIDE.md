# Frontend Migration - Testing Guide

## Migration Status: ✅ READY TO TEST

The UI overhaul and migration to React with shadcn/ui is complete. All components have been created and the application is ready for manual testing.

## What's Been Completed

✅ Frontend React application created with Vite
✅ Tailwind CSS configured
✅ shadcn/ui initialized with components (Button, Card, Input, Select, Progress)
✅ All 5 main components created:
  - App.jsx (main application orchestrator)
  - SetupForm.jsx (content source selection & generation)
  - QuizView.jsx (interactive quiz interface)
  - FlashcardView.jsx (flashcard display with flip animation)
  - ResultsPage.jsx (quiz results with detailed breakdown)
✅ Application logic migrated from vanilla JS to React hooks
✅ Modern UI with gradient backgrounds and smooth transitions

## Step-by-Step Testing Instructions

### Prerequisites
- Backend server must be running on `http://localhost:5000`
- Node.js and npm installed
- Frontend dependencies installed (`cd frontend && npm install` if not already done)

### 1. Start the Backend Server

Open a terminal and run:
```bash
cd backend
python app.py
```

**✓ Expected Output:**
```
* Running on http://localhost:5000
```

### 2. Start the Frontend Development Server

Open a **NEW terminal** (keep backend running) and run:
```bash
cd frontend
npm run dev
```

**✓ Expected Output:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 3. Open the Application in Browser

Navigate to: **http://localhost:5173**

**✓ Expected to See:**
- Header: "AI Quiz & Flashcard Generator"
- Subtitle: "Generate interactive quizzes and flashcards from any content"
- Setup card with modern UI
- Gradient background (blue to indigo)

---

## Test Case 1: Document Upload → Quiz Generation

### Steps:
1. ✓ Content Source: Select "📄 Upload Document"
2. ✓ Click "Choose File" and select `sample-document.txt` from root directory
3. ✓ Verify green text appears: "📄 File loaded: sample-document.txt (X.XX KB)"
4. ✓ Content Type: Ensure "📝 Quiz" is selected
5. ✓ Language: Select "🇬🇧 English" or "🇮🇩 Indonesian"
6. ✓ Number of Questions: Set to 5
7. ✓ Click "🚀 Generate Quiz"

**✓ Expected Behavior:**
- Button changes to show spinner: "⏳ Generating Quiz..."
- After 5-15 seconds, quiz view loads
- Progress bar shows "Question 1 of 5" and 0% complete
- Question text displays clearly
- Four answer options (A, B, C, D) are visible
- Options have hover effect (light blue background)

### Quiz Interaction:
8. ✓ Click on any answer option
9. ✓ **Expected:**
   - Selected option becomes disabled
   - Correct answer highlights in GREEN
   - If wrong answer selected, it highlights in RED
   - Explanation card appears below with:
     - "✅ Correct!" or "❌ Incorrect"
     - Correct answer shown
     - Detailed explanation
   - "Next Question →" button appears (or "View Results" on last question)

10. ✓ Click "Next Question"
11. ✓ Repeat for all 5 questions
12. ✓ On Question 5, click "View Results"

**✓ Expected Results Page:**
- Large score display: "X / 5"
- Percentage: "XX.X% Correct"
- Detailed breakdown of all questions:
  - Green cards for correct answers
  - Red cards for incorrect answers
  - Each showing question, your answer, correct answer
  - Explanations for incorrect answers
- "🔄 Start Over" button at bottom

---

## Test Case 2: Document Upload → Flashcard Generation

### Steps:
1. ✓ Click "🔄 Start Over" button
2. ✓ Returns to setup screen
3. ✓ Upload `sample-document.txt` again
4. ✓ Content Type: Select "🎴 Flash Cards"
5. ✓ Number of Flash Cards: Set to 10
6. ✓ Click "🚀 Generate Flash Cards"

**✓ Expected Behavior:**
- Button shows: "⏳ Generating Flash Cards..."
- Flashcard view loads after 10-20 seconds
- Progress bar shows "Card 1 of 10"
- Large card displays with:
  - "Front" label at top
  - Question/concept text in center
  - "Click to flip" hint at bottom

### Flashcard Interaction:
7. ✓ Click on the card to flip
8. ✓ **Expected:**
   - Card rotates 180° (smooth 3D flip animation)
   - Back side shows with blue tint background
   - "Back" label at top
   - Answer/explanation text in center
   - "Click to flip" hint at bottom

9. ✓ Click "Next →" button
10. ✓ **Expected:**
    - Moves to Card 2
    - Card resets to front side
    - Progress updates to "Card 2 of 10"

11. ✓ Click "← Previous" button
12. ✓ **Expected:**
    - Returns to Card 1
    - Progress updates back to "Card 1 of 10"

13. ✓ Test "Stop" button
14. ✓ **Expected:**
    - Returns to setup screen

---

## Test Case 3: YouTube Video → Quiz (if backend configured)

### Prerequisites:
- Backend must have YouTube transcript functionality configured
- SUPADATA_API_KEY or Tor proxy set up

### Steps:
1. ✓ Content Source: Select "🎥 YouTube Video"
2. ✓ Enter a YouTube URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
3. ✓ Select Language: "🇬🇧 English"
4. ✓ Content Type: "📝 Quiz"
5. ✓ Number of Questions: 5
6. ✓ Click "🚀 Generate Quiz"

**✓ Expected Behavior:**
- Blue info text appears: "⏳ Fetching YouTube transcript..."
- After 3-10 seconds: "✅ Transcript loaded successfully (via Supadata.ai) - XX snippets, en"
- Then quiz generation begins
- Quiz loads with questions based on video content

---

## Test Case 4: Website Scraping → Flashcards (if Firecrawl configured)

### Prerequisites:
- Backend must have FIRECRAWL_API_KEY configured

### Steps:
1. ✓ Content Source: Select "🌐 Website URL"
2. ✓ Enter URL (e.g., `https://en.wikipedia.org/wiki/React_(JavaScript_library)`)
3. ✓ Content Type: "🎴 Flash Cards"
4. ✓ Number of Flash Cards: 10
5. ✓ Click "🚀 Generate Flash Cards"

**✓ Expected Behavior:**
- Blue info text: "⏳ Scraping website content..."
- Success message: "✅ Website content loaded successfully - [Page Title]"
- Flashcards generate based on scraped content

---

## UI/UX Features to Verify

### Visual Design:
- ✓ Gradient background (blue-50 to indigo-100)
- ✓ Clean card-based layout with shadows
- ✓ Rounded corners on all interactive elements
- ✓ Consistent spacing and typography
- ✓ Proper contrast for text readability

### Interactions:
- ✓ Hover effects on buttons (color change)
- ✓ Hover effects on quiz options (light blue background)
- ✓ Smooth transitions on all state changes
- ✓ Loading states with spinner animation
- ✓ Disabled state for buttons when appropriate

### Responsive Behavior:
- ✓ Cards are centered and have max-width constraints
- ✓ Content is readable and properly formatted
- ✓ Buttons are appropriately sized

---

## Error Scenarios to Test

### 1. No Document Uploaded
- ✓ Try generating without uploading
- ✓ Expected: Alert "Please upload a document first"

### 2. Invalid Question/Card Numbers
- ✓ Try entering 0 or 100 for questions
- ✓ Expected: Alert "Please enter a number between 1 and 20"

### 3. Backend Not Running
- ✓ Stop backend server
- ✓ Try to generate content
- ✓ Expected: Configuration error alert or API error

### 4. Stop Quiz Mid-Way
- ✓ Start a quiz and answer 2-3 questions
- ✓ Click "Stop Quiz"
- ✓ Expected: Confirmation dialog "Are you sure you want to stop the quiz? Your progress will be lost."
- ✓ Confirm: Returns to setup screen

---

## Performance Expectations

- **Setup Form Load:** Instant
- **File Upload:** < 1 second for small text files
- **Quiz Generation (5 questions):** 5-15 seconds (depends on AI API)
- **Flashcard Generation (10 cards):** 10-20 seconds
- **Quiz Navigation:** Instant
- **Flashcard Flip:** Smooth 500ms animation
- **Results Page:** Instant

---

## Known Limitations (Current State)

1. **No Production Build Yet:** Only tested in development mode
2. **No Render Deployment Config:** Needs configuration for production deployment
3. **Dark Mode:** Supported but depends on system preferences (no manual toggle)
4. **Mobile Optimization:** Not extensively tested on mobile devices

---

## Next Steps After Testing

Once manual testing confirms everything works:
1. Create production build configuration for Render
2. Update Render dashboard settings for static site deployment
3. Test production build locally
4. Deploy to Render
5. Verify deployed version

---

## Troubleshooting

### Issue: "Configuration Error" on load
**Solution:** Ensure backend is running and environment variables are set

### Issue: Blank white page
**Solution:** 
- Check browser console for errors
- Verify `npm run dev` is running without errors
- Check that port 5173 is not blocked

### Issue: Components not styled properly
**Solution:**
- Verify Tailwind CSS is loaded (check browser dev tools)
- Ensure `npm install` completed successfully

### Issue: Flashcard won't flip
**Solution:**
- Check browser console for errors
- Verify CSS animations are enabled in browser

---

## Success Criteria

✅ All test cases pass without errors
✅ UI looks polished and professional
✅ Animations are smooth
✅ No console errors in browser
✅ Backend communication works correctly
✅ Content generation produces valid results

Once all criteria are met, the migration is ready for production deployment!
