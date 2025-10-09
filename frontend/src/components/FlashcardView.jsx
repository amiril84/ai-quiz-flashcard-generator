import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export default function FlashcardView({ flashcardData, onStop }) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)

  const currentCard = flashcardData[currentCardIndex]
  const progress = ((currentCardIndex + 1) / flashcardData.length) * 100

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setIsFlipped(false)
    }
  }

  const handleNext = () => {
    if (currentCardIndex < flashcardData.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-4">
      {/* Progress Bar */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-blue-600 dark:text-blue-400">
                Card {currentCardIndex + 1} of {flashcardData.length}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Flashcard */}
      <div className="flip-card-container">
        <div
          className={`flip-card ${isFlipped ? 'flipped' : ''} cursor-pointer`}
          onClick={handleFlip}
          style={{ height: '28rem' }}
        >
          {/* Front of card */}
          <Card className="flip-card-face shadow-2xl border-2 border-gray-200 dark:border-gray-700 hover:shadow-blue-200 dark:hover:shadow-blue-900/50 transition-shadow duration-300">
            <CardContent className="h-full flex flex-col items-center justify-center p-12">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                  <span className="text-3xl">🎴</span>
                </div>
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 font-semibold">
                    Question
                  </p>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    {currentCard.front}
                  </h2>
                </div>
                <div className="pt-8 flex flex-col items-center gap-2">
                  <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    <span className="font-medium">Click to reveal answer</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back of card */}
          <Card className="flip-card-face flip-card-back shadow-2xl border-2 border-blue-200 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40">
            <CardContent className="h-full flex flex-col items-center justify-center p-12">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-200 dark:bg-blue-800/50 mb-4">
                  <span className="text-3xl">💡</span>
                </div>
                <div className="space-y-4">
                  <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300 font-semibold">
                    Answer
                  </p>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white leading-relaxed">
                    {currentCard.back}
                  </h2>
                </div>
                <div className="pt-8 flex flex-col items-center gap-2">
                  <div className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    <span className="font-medium">Click to flip back</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentCardIndex === 0}
          size="lg"
          className="flex-1 sm:flex-none"
        >
          ← Previous
        </Button>

        <Button 
          onClick={onStop}
          size="lg"
          className="flex-1 sm:flex-none bg-red-700 hover:bg-red-800 text-white"
        >
          🏁 Stop
        </Button>

        <Button
          onClick={handleNext}
          disabled={currentCardIndex === flashcardData.length - 1}
          size="lg"
          className="flex-1 sm:flex-none"
        >
          Next →
        </Button>
      </div>
    </div>
  )
}
