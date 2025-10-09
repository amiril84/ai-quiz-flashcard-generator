import { useState } from 'react'
import SetupForm from './components/SetupForm'
import QuizView from './components/QuizView'
import FlashcardView from './components/FlashcardView'
import ResultsPage from './components/ResultsPage'
import './App.css'

// Configure backend URL based on environment
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://ai-quiz-backend-qbm7.onrender.com'
)

function App() {
  const [currentView, setCurrentView] = useState('setup')
  const [quizData, setQuizData] = useState([])
  const [flashcardData, setFlashcardData] = useState([])
  const [userAnswers, setUserAnswers] = useState([])

  const handleQuizGenerated = (data) => {
    setQuizData(data)
    setUserAnswers(new Array(data.length).fill(null))
    setCurrentView('quiz')
  }

  const handleFlashcardsGenerated = (data) => {
    setFlashcardData(data)
    setCurrentView('flashcards')
  }

  const handleQuizComplete = (answers) => {
    setUserAnswers(answers)
    setCurrentView('results')
  }

  const handleReset = () => {
    setQuizData([])
    setFlashcardData([])
    setUserAnswers([])
    setCurrentView('setup')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            AI Quiz & Flashcard Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Generate interactive quizzes and flashcards from any content
          </p>
        </header>

        <main>
          {currentView === 'setup' && (
            <SetupForm
              backendUrl={BACKEND_URL}
              onQuizGenerated={handleQuizGenerated}
              onFlashcardsGenerated={handleFlashcardsGenerated}
            />
          )}

          {currentView === 'quiz' && (
            <QuizView
              quizData={quizData}
              userAnswers={userAnswers}
              onComplete={handleQuizComplete}
              onStop={handleReset}
            />
          )}

          {currentView === 'flashcards' && (
            <FlashcardView
              flashcardData={flashcardData}
              onStop={handleReset}
            />
          )}

          {currentView === 'results' && (
            <ResultsPage
              quizData={quizData}
              userAnswers={userAnswers}
              onReset={handleReset}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
