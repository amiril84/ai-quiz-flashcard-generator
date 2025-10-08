// Global variables
let apiKey = '';
let modelName = '';
let firecrawlApiKey = '';
let quizData = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let documentContent = '';
let flashcardData = [];
let currentCardIndex = 0;
let isCardFlipped = false;

// Configure backend URL based on environment
// For local development: http://localhost:5000
// For production: Set this to your Render backend URL (e.g., https://your-app-name.onrender.com)
const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://your-backend-name.onrender.com'; // Replace with your actual Render backend URL

// Save API configuration
function saveConfig() {
    apiKey = document.getElementById('apiKey').value.trim();
    modelName = document.getElementById('modelName').value.trim();
    firecrawlApiKey = document.getElementById('firecrawlApiKey').value.trim();
    
    if (!apiKey) {
        alert('Please enter your OpenRouter API key');
        return;
    }
    
    if (!modelName) {
        alert('Please enter a model name');
        return;
    }
    
    // Firecrawl API key is optional, only needed for website scraping
    
    // Hide config section and show setup section
    document.getElementById('configSection').style.display = 'none';
    document.getElementById('setupSection').style.display = 'block';
    
    alert('Configuration saved successfully! You can now create your quiz.');
}

// Handle file upload
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('documentUpload');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
});

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileInfo = document.getElementById('fileInfo');
    fileInfo.style.display = 'block';
    fileInfo.textContent = `📄 File loaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
    
    try {
        const text = await file.text();
        documentContent = text;
    } catch (error) {
        alert('Error reading file. Please try again.');
        console.error(error);
    }
}

// Update content source (Document, YouTube, or Website)
function updateContentSource() {
    const contentSource = document.getElementById('contentSource').value;
    const documentUploadGroup = document.getElementById('documentUploadGroup');
    const youtubeUrlGroup = document.getElementById('youtubeUrlGroup');
    const websiteUrlGroup = document.getElementById('websiteUrlGroup');
    
    // Hide all input groups first
    documentUploadGroup.style.display = 'none';
    youtubeUrlGroup.style.display = 'none';
    websiteUrlGroup.style.display = 'none';
    
    // Clear all inputs
    document.getElementById('documentUpload').value = '';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('youtubeUrl').value = '';
    document.getElementById('youtubeInfo').style.display = 'none';
    document.getElementById('websiteUrl').value = '';
    document.getElementById('websiteInfo').style.display = 'none';
    documentContent = '';
    
    // Show the selected input group
    if (contentSource === 'document') {
        documentUploadGroup.style.display = 'block';
    } else if (contentSource === 'youtube') {
        youtubeUrlGroup.style.display = 'block';
    } else if (contentSource === 'website') {
        websiteUrlGroup.style.display = 'block';
    }
}

// Fetch YouTube transcript
async function fetchYouTubeTranscript() {
    const youtubeUrl = document.getElementById('youtubeUrl').value.trim();
    const language = document.getElementById('language').value;
    const youtubeInfo = document.getElementById('youtubeInfo');
    
    if (!youtubeUrl) {
        alert('Please enter a YouTube video URL');
        return false;
    }
    
    try {
        youtubeInfo.style.display = 'block';
        youtubeInfo.textContent = '⏳ Fetching YouTube transcript...';
        
        const languageCode = language === 'english' ? 'en' : 'id';
        
        const response = await fetch(`${BACKEND_URL}/api/transcript`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                video_url: youtubeUrl,
                languages: [languageCode, 'en']
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch transcript');
        }
        
        documentContent = data.transcript;
        youtubeInfo.textContent = `✅ Transcript loaded successfully (${data.snippet_count} snippets, ${data.language})`;
        youtubeInfo.style.background = '#e8f5e9';
        youtubeInfo.style.color = '#2e7d32';
        
        return true;
        
    } catch (error) {
        youtubeInfo.textContent = `❌ Error: ${error.message}. Make sure the backend server is running.`;
        youtubeInfo.style.background = '#ffebee';
        youtubeInfo.style.color = '#c62828';
        console.error('Error fetching YouTube transcript:', error);
        return false;
    }
}

// Fetch website content using Firecrawl
async function fetchWebsiteContent() {
    const websiteUrl = document.getElementById('websiteUrl').value.trim();
    const websiteInfo = document.getElementById('websiteInfo');
    
    if (!websiteUrl) {
        alert('Please enter a website URL');
        return false;
    }
    
    if (!firecrawlApiKey) {
        alert('Please enter your Firecrawl API key in the configuration section first');
        return false;
    }
    
    try {
        websiteInfo.style.display = 'block';
        websiteInfo.textContent = '⏳ Scraping website content...';
        
        const response = await fetch(`${BACKEND_URL}/api/scrape-website`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                website_url: websiteUrl,
                firecrawl_api_key: firecrawlApiKey
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Failed to scrape website');
        }
        
        documentContent = data.content;
        const metadata = data.metadata;
        websiteInfo.textContent = `✅ Website content loaded successfully - ${metadata.title || 'Content extracted'}`;
        websiteInfo.style.background = '#e8f5e9';
        websiteInfo.style.color = '#2e7d32';
        
        return true;
        
    } catch (error) {
        websiteInfo.textContent = `❌ Error: ${error.message}. Make sure the backend server is running and you have entered a valid Firecrawl API key.`;
        websiteInfo.style.background = '#ffebee';
        websiteInfo.style.color = '#c62828';
        console.error('Error fetching website content:', error);
        return false;
    }
}

// Update content type options
function updateContentTypeOptions() {
    const contentType = document.getElementById('contentType').value;
    const numQuestionsGroup = document.getElementById('numQuestionsGroup');
    const numCardsGroup = document.getElementById('numCardsGroup');
    const generateBtn = document.getElementById('generateBtn');
    const loadingText = document.getElementById('loadingText');
    
    if (contentType === 'quiz') {
        numQuestionsGroup.style.display = 'block';
        numCardsGroup.style.display = 'none';
        generateBtn.innerHTML = '🚀 Generate Quiz';
        loadingText.textContent = 'Generating quiz questions with AI...';
    } else {
        numQuestionsGroup.style.display = 'none';
        numCardsGroup.style.display = 'block';
        generateBtn.innerHTML = '🚀 Generate Flash Cards';
        loadingText.textContent = 'Generating flash cards with AI...';
    }
}

// Generate content (quiz or flashcards) using OpenRouter API
async function generateContent() {
    const contentSource = document.getElementById('contentSource').value;
    
    // If YouTube is selected, fetch transcript first
    if (contentSource === 'youtube') {
        const success = await fetchYouTubeTranscript();
        if (!success) {
            return; // Stop if transcript fetch failed
        }
    }
    
    // If Website is selected, fetch website content first
    if (contentSource === 'website') {
        const success = await fetchWebsiteContent();
        if (!success) {
            return; // Stop if website scraping failed
        }
    }
    
    const contentType = document.getElementById('contentType').value;
    
    if (contentType === 'quiz') {
        await generateQuiz();
    } else {
        await generateFlashcards();
    }
}

// Generate quiz using OpenRouter API
async function generateQuiz() {
    const contentSource = document.getElementById('contentSource').value;
    
    if (!documentContent) {
        if (contentSource === 'document') {
            alert('Please upload a document first');
        } else if (contentSource === 'youtube') {
            alert('Please enter a YouTube URL and fetch the transcript first');
        } else if (contentSource === 'website') {
            alert('Please enter a website URL and scrape the content first');
        }
        return;
    }
    
    const numQuestions = parseInt(document.getElementById('numQuestions').value);
    const language = document.getElementById('language').value;
    
    if (numQuestions < 1 || numQuestions > 20) {
        alert('Please enter a number between 1 and 20');
        return;
    }
    
    // Show loading
    document.getElementById('loading').style.display = 'block';
    
    try {
        const languageText = language === 'english' ? 'English' : 'Indonesian';
        const prompt = `Based on the following document content, generate ${numQuestions} multiple-choice questions in ${languageText}. 

Document content:
${documentContent}

Please provide the questions in the following JSON format:
{
  "questions": [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this is the correct answer"
    }
  ]
}

Important requirements:
- Each question must have exactly 4 options
- The correctAnswer should be the index (0-3) of the correct option
- Provide a detailed explanation for each correct answer
- Make questions challenging but fair
- Questions should be in ${languageText}
- Return ONLY valid JSON, no additional text`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.href,
            },
            body: JSON.stringify({
                model: modelName,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Extract JSON from the response
        let jsonContent = content;
        if (content.includes('```json')) {
            jsonContent = content.split('```json')[1].split('```')[0].trim();
        } else if (content.includes('```')) {
            jsonContent = content.split('```')[1].split('```')[0].trim();
        }
        
        const quizResponse = JSON.parse(jsonContent);
        quizData = quizResponse.questions;
        
        // Initialize user answers array
        userAnswers = new Array(quizData.length).fill(null);
        
        // Hide loading and setup, show quiz
        document.getElementById('loading').style.display = 'none';
        document.getElementById('setupSection').style.display = 'none';
        document.getElementById('quizSection').style.display = 'block';
        
        // Start quiz
        currentQuestionIndex = 0;
        displayQuestion();
        
    } catch (error) {
        document.getElementById('loading').style.display = 'none';
        alert('Error generating quiz: ' + error.message);
        console.error(error);
    }
}

// Display current question
function displayQuestion() {
    const question = quizData[currentQuestionIndex];
    const progressPercent = ((currentQuestionIndex) / quizData.length) * 100;
    
    // Update progress bar
    document.getElementById('progressFill').style.width = progressPercent + '%';
    document.getElementById('questionCounter').textContent = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;
    
    // Build question HTML
    const questionHTML = `
        <div class="question-text">
            ${question.question}
        </div>
        <div class="options-container">
            ${question.options.map((option, index) => `
                <div class="option" onclick="selectAnswer(${index})" id="option-${index}">
                    ${String.fromCharCode(65 + index)}. ${option}
                </div>
            `).join('')}
        </div>
    `;
    
    document.getElementById('questionContainer').innerHTML = questionHTML;
    document.getElementById('explanationContainer').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'none';
    document.getElementById('resultsBtn').style.display = 'none';
}

// Select an answer
function selectAnswer(selectedIndex) {
    const question = quizData[currentQuestionIndex];
    const correctIndex = question.correctAnswer;
    
    // Store user's answer
    userAnswers[currentQuestionIndex] = selectedIndex;
    
    // Disable all options
    const options = document.querySelectorAll('.option');
    options.forEach((option, index) => {
        option.classList.add('disabled');
        option.onclick = null;
        
        // Highlight correct and incorrect answers
        if (index === correctIndex) {
            option.classList.add('correct');
        } else if (index === selectedIndex) {
            option.classList.add('incorrect');
        }
    });
    
    // Show explanation
    const isCorrect = selectedIndex === correctIndex;
    const explanationHTML = `
        <div class="explanation-title">
            ${isCorrect ? '✅ Correct!' : '❌ Incorrect'}
        </div>
        <div class="explanation-text">
            <strong>Correct Answer:</strong> ${String.fromCharCode(65 + correctIndex)}. ${question.options[correctIndex]}<br><br>
            <strong>Explanation:</strong> ${question.explanation}
        </div>
    `;
    
    const explanationContainer = document.getElementById('explanationContainer');
    explanationContainer.innerHTML = explanationHTML;
    explanationContainer.className = 'explanation-container ' + (isCorrect ? 'correct' : 'incorrect');
    explanationContainer.style.display = 'block';
    
    // Show next button or results button
    if (currentQuestionIndex < quizData.length - 1) {
        document.getElementById('nextBtn').style.display = 'inline-block';
    } else {
        document.getElementById('resultsBtn').style.display = 'inline-block';
    }
}

// Move to next question
function nextQuestion() {
    currentQuestionIndex++;
    displayQuestion();
}

// Stop quiz and return to setup
function stopQuiz() {
    const confirmStop = confirm('Are you sure you want to stop the quiz? Your progress will be lost.');
    
    if (confirmStop) {
        // Reset quiz variables
        quizData = [];
        currentQuestionIndex = 0;
        userAnswers = [];
        documentContent = '';
        
        // Reset file input
        document.getElementById('documentUpload').value = '';
        document.getElementById('fileInfo').style.display = 'none';
        
        // Reset content type
        document.getElementById('contentType').value = 'quiz';
        updateContentTypeOptions();
        
        // Hide quiz section and show setup section
        document.getElementById('quizSection').style.display = 'none';
        document.getElementById('setupSection').style.display = 'block';
    }
}

// Show final results
function showResults() {
    const score = userAnswers.reduce((total, answer, index) => {
        return total + (answer === quizData[index].correctAnswer ? 1 : 0);
    }, 0);
    
    const percentage = (score / quizData.length * 100).toFixed(1);
    
    // Hide quiz section, show results section
    document.getElementById('quizSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    
    // Display score
    document.getElementById('scoreDisplay').innerHTML = `
        <h3>Your Score</h3>
        <p style="font-size: 3em; margin: 20px 0;">${score} / ${quizData.length}</p>
        <p>${percentage}% Correct</p>
    `;
    
    // Display detailed results
    const resultsHTML = quizData.map((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        
        return `
            <div class="result-item ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="result-question">
                    <strong>Q${index + 1}:</strong> ${question.question}
                </div>
                <div class="result-answer">
                    <strong>Your Answer:</strong> ${userAnswer !== null ? String.fromCharCode(65 + userAnswer) + '. ' + question.options[userAnswer] : 'Not answered'}
                </div>
                <div class="result-answer">
                    <strong>Correct Answer:</strong> ${String.fromCharCode(65 + question.correctAnswer)}. ${question.options[question.correctAnswer]}
                </div>
                ${!isCorrect ? `<div class="result-answer" style="margin-top: 10px;"><strong>Explanation:</strong> ${question.explanation}</div>` : ''}
            </div>
        `;
    }).join('');
    
    document.getElementById('resultsDetails').innerHTML = resultsHTML;
}

// Generate flashcards using OpenRouter API
async function generateFlashcards() {
    if (!documentContent) {
        alert('Please upload a document first');
        return;
    }
    
    const numCards = parseInt(document.getElementById('numCards').value);
    const language = document.getElementById('language').value;
    
    if (numCards < 1 || numCards > 30) {
        alert('Please enter a number between 1 and 30');
        return;
    }
    
    // Show loading
    document.getElementById('loading').style.display = 'block';
    
    try {
        const languageText = language === 'english' ? 'English' : 'Indonesian';
        const prompt = `Based on the following document content, generate ${numCards} flash cards in ${languageText}. 

Document content:
${documentContent}

Please provide the flash cards in the following JSON format:
{
  "cards": [
    {
      "front": "Key concept or question",
      "back": "Concise answer or explanation"
    }
  ]
}

Important requirements:
- Create ${numCards} flash cards
- Each card should have a front (question/concept) and back (answer/explanation)
- Front should be concise and clear (max 15 words)
- Back should be VERY CONCISE - MAXIMUM 30 WORDS ONLY
- Keep the back answer brief, focused, and to the point
- Avoid lengthy explanations - summarize key points only
- Cards should be in ${languageText}
- Cover the most important concepts from the document
- Return ONLY valid JSON, no additional text`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.href,
            },
            body: JSON.stringify({
                model: modelName,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ]
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Extract JSON from the response
        let jsonContent = content;
        if (content.includes('```json')) {
            jsonContent = content.split('```json')[1].split('```')[0].trim();
        } else if (content.includes('```')) {
            jsonContent = content.split('```')[1].split('```')[0].trim();
        }
        
        const flashcardResponse = JSON.parse(jsonContent);
        flashcardData = flashcardResponse.cards;
        
        // Hide loading and setup, show flashcards
        document.getElementById('loading').style.display = 'none';
        document.getElementById('setupSection').style.display = 'none';
        document.getElementById('flashcardSection').style.display = 'block';
        
        // Start flashcard display
        currentCardIndex = 0;
        isCardFlipped = false;
        displayFlashcard();
        
    } catch (error) {
        document.getElementById('loading').style.display = 'none';
        alert('Error generating flashcards: ' + error.message);
        console.error(error);
    }
}

// Display current flashcard
function displayFlashcard() {
    const card = flashcardData[currentCardIndex];
    const progressPercent = ((currentCardIndex + 1) / flashcardData.length) * 100;
    
    // Update progress bar
    document.getElementById('flashcardProgressFill').style.width = progressPercent + '%';
    document.getElementById('cardCounter').textContent = `Card ${currentCardIndex + 1} of ${flashcardData.length}`;
    
    // Set card content
    document.getElementById('flashcardFront').textContent = card.front;
    document.getElementById('flashcardBack').textContent = card.back;
    
    // Reset flip state
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.remove('flipped');
    isCardFlipped = false;
    
    // Update navigation buttons
    document.getElementById('prevCardBtn').disabled = currentCardIndex === 0;
    document.getElementById('nextCardBtn').disabled = currentCardIndex === flashcardData.length - 1;
}

// Flip flashcard
function flipCard() {
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.toggle('flipped');
    isCardFlipped = !isCardFlipped;
}

// Navigate to previous card
function previousCard() {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        displayFlashcard();
    }
}

// Navigate to next card
function nextCard() {
    if (currentCardIndex < flashcardData.length - 1) {
        currentCardIndex++;
        displayFlashcard();
    }
}

// Reset app and start over
function resetApp() {
    // Reset all variables
    quizData = [];
    currentQuestionIndex = 0;
    userAnswers = [];
    flashcardData = [];
    currentCardIndex = 0;
    isCardFlipped = false;
    documentContent = '';
    
    // Reset file input
    document.getElementById('documentUpload').value = '';
    document.getElementById('fileInfo').style.display = 'none';
    
    // Reset content type
    document.getElementById('contentType').value = 'quiz';
    updateContentTypeOptions();
    
    // Hide all sections except setup
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('quizSection').style.display = 'none';
    document.getElementById('flashcardSection').style.display = 'none';
    document.getElementById('setupSection').style.display = 'block';
}
