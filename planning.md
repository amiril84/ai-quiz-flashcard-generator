# Topic-Based Quiz/Flashcard Generation Feature - Implementation Plan

## Feature Overview
Add capability for users to generate quiz questions and flashcards directly from a topic text input, without requiring a document, YouTube video, or website as source material.

## Requirements

### User Interface Changes
1. **New Content Source: "Text"**
   - Add a 4th content source option named "Text" with 📝 icon
   - Re-arrange content source buttons from single row to 2x2 grid:
     - Row 1: Document (📄), YouTube (🎥)
     - Row 2: Website (🌐), Text (📝)

2. **Topic Input Field**
   - Single-line text input field
   - Pre-filled with example: "English Grammar Past Tense"
   - Placeholder to guide users

3. **Sample Topic Buttons**
   - Display below the topic input field
   - Clicking a sample topic prefills the input field
   - Sample topics:
     - "Alternative Energy and Sustainability"
     - "Diponegoro and the Java War"
     - "Newton's Law of Universal Gravitation"
     - "Molecular Genetics and DNA"

### Prompt Requirements

#### Quiz Generation from Topic
- **Default Difficulty**: Medium to difficult (mixed)
- **Default Educational Level**: General audiences
- **Adaptive Behavior**: Should detect and adjust based on user-specified difficulty/audience in topic text
- **Examples**:
  - "English Grammar Past Tense for beginners" → easier questions
  - "Alternative energy and sustainability for college students" → college level
  - "Newton's Law of Universal Gravitation" → medium-difficult, general audience

#### Flashcard Generation from Topic
- **Default Level**: General audience understanding
- **Adaptive Behavior**: Detect and adapt to user-specified level in topic text
- **Emphasis**: Concise, focused content suitable for spaced repetition

### Backend Changes
1. **New Prompt Templates**
   - `backend/prompts/generate_quiz_from_topic.md`
   - `backend/prompts/generate_flashcard_from_topic.md`

2. **API Endpoint Updates**
   - Update `/api/prompt/<prompt_type>` to support new prompt types:
     - `generate_quiz_from_topic`
     - `generate_flashcard_from_topic`

### Frontend Changes
1. **SetupForm.jsx Updates**
   - Add `topicText` state variable
   - Add new content source option: 'text'
   - Rearrange content source buttons to 2x2 grid layout
   - Add topic input section (visible when source is 'text')
   - Add sample topic buttons
   - Create new generation functions:
     - `generateQuizFromTopic()`
     - `generateFlashcardsFromTopic()`
   - Update `generateContent()` to route to topic-based generation

## Implementation Steps

### Step 1: Create Planning Documentation
- [x] Create planning.md file

### Step 2: Create Prompt Templates
- [ ] Create `backend/prompts/generate_quiz_from_topic.md`
  - Include instructions for AI to use knowledge base
  - Specify medium-difficult default difficulty
  - Specify general audience default level
  - Include adaptive difficulty detection
  - Request comprehensive topic coverage
  - Include variety of question types (conceptual, application, analysis)
  
- [ ] Create `backend/prompts/generate_flashcard_from_topic.md`
  - Include instructions for AI to identify key concepts
  - Specify general audience default
  - Include adaptive level detection
  - Emphasize conciseness (max 30 words for back)
  - Request balance of foundational and advanced concepts

### Step 3: Update Backend API
- [ ] Update `backend/app.py`
  - Modify allowed_prompts list to include:
    - 'generate_quiz_from_topic'
    - 'generate_flashcard_from_topic'

### Step 4: Update Frontend UI
- [ ] Update `frontend/src/components/SetupForm.jsx`
  - Add state: `const [topicText, setTopicText] = useState('English Grammar Past Tense')`
  - Modify content source button layout to 2x2 grid using CSS Grid
  - Add "Text" content source button
  - Add topic input section (conditional render when contentSource === 'text')
  - Add sample topic buttons
  - Implement sample topic click handlers
  - Create `generateQuizFromTopic()` function
  - Create `generateFlashcardsFromTopic()` function
  - Update `generateContent()` to handle 'text' source
  - Update `handleContentSourceChange()` to reset topicText

### Step 5: Testing
- [ ] Test content source button layout (2x2 grid, responsive)
- [ ] Test "Text" content source selection
- [ ] Test topic input field (pre-filled, editable)
- [ ] Test sample topic buttons (click to prefill)
- [ ] Test quiz generation from topic
- [ ] Test flashcard generation from topic
- [ ] Test adaptive difficulty detection (e.g., "for beginners")
- [ ] Test with all 4 sample topics
- [ ] Test in both English and Indonesian languages

## Prompt Design Strategy

### Quiz from Topic Prompt
The prompt should:
1. Analyze topic text for difficulty/audience hints
2. Use AI's knowledge base to generate comprehensive questions
3. Cover multiple aspects: definitions, concepts, applications, analysis
4. Create questions that test understanding, not memorization
5. Ensure proper difficulty level based on detected or default level
6. Generate exactly the requested number of questions
7. Return valid JSON format

### Flashcard from Topic Prompt
The prompt should:
1. Analyze topic text for level/audience hints
2. Identify core concepts, definitions, key facts
3. Create cards suitable for spaced repetition learning
4. Balance foundational knowledge with practical applications
5. Keep content concise (front: max 15 words, back: max 30 words)
6. Generate exactly the requested number of cards
7. Return valid JSON format

## Technical Notes

### CSS Grid for 2x2 Layout
```css
.content-source-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
```

### State Management
- topicText: stores the user's topic input
- Reset topicText when switching away from 'text' source
- Pre-fill topicText when clicking sample topics

### API Integration
- Topic-based generation will use the same OpenRouter API
- Different prompts will be loaded based on content source type
- No document content needed - just the topic text

## Success Criteria
1. ✅ Users can select "Text" as content source
2. ✅ Content source buttons arranged in 2x2 grid
3. ✅ Topic input field functional and pre-filled
4. ✅ Sample topics clickable and prefill the field
5. ✅ Quiz generation works with just a topic
6. ✅ Flashcard generation works with just a topic
7. ✅ Questions/cards are relevant and high-quality
8. ✅ Adaptive difficulty works (detects "for beginners", "for college students", etc.)
9. ✅ Both English and Indonesian languages supported
10. ✅ All existing functionality remains intact

## Rollback Plan
If issues arise:
1. The changes are isolated to specific files
2. Existing document/YouTube/website functionality is unchanged
3. Can easily revert frontend changes to remove "Text" option
4. Backend prompt files are additive (don't affect existing prompts)

---

**Created**: 2025-01-10
**Status**: Ready for Implementation
