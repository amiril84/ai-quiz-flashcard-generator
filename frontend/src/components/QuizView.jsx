import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export default function QuizView({ quizData, userAnswers, onComplete, onStop }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState(userAnswers)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)

  const currentQuestion = quizData[currentQuestionIndex]
  const progress = ((currentQuestionIndex) / quizData.length) * 100

  const handleAnswerSelect = (selectedIndex) => {
    if (selectedAnswer !== null) return // Already answered

    setSelectedAnswer(selectedIndex)

    // Update answers array
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = selectedIndex
    setAnswers(newAnswers)

    setShowExplanation(true)
  }

  const handleNext = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    }
  }

  const handleFinish = () => {
    onComplete(answers)
  }

  const handleStop = () => {
    if (confirm('Are you sure you want to stop the quiz? Your progress will be lost.')) {
      onStop()
    }
  }

  const getOptionClass = (optionIndex) => {
    if (selectedAnswer === null) {
      return 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transform hover:scale-[1.02] transition-all duration-200'
    }

    const isCorrect = optionIndex === currentQuestion.correctAnswer
    const isSelected = optionIndex === selectedAnswer

    if (isCorrect) {
      return 'bg-green-50 dark:bg-green-900/30 border-green-500 shadow-lg scale-[1.02]'
    }

    if (isSelected && !isCorrect) {
      return 'bg-red-50 dark:bg-red-900/30 border-red-500 shadow-lg scale-[1.02]'
    }

    return 'opacity-50'
  }

  const getOptionIcon = (optionIndex) => {
    if (selectedAnswer === null) return null

    const isCorrect = optionIndex === currentQuestion.correctAnswer
    const isSelected = optionIndex === selectedAnswer

    if (isCorrect) {
      return (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )
    }

    if (isSelected && !isCorrect) {
      return (
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )
    }

    return null
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-4">
      {/* Progress Bar */}
      <Card className="shadow-lg">
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-blue-600 dark:text-blue-400">
                Question {currentQuestionIndex + 1} of {quizData.length}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="shadow-xl">
        <CardContent className="pt-5 pb-5 space-y-4">
          {/* Question Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <span className="text-lg">❓</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`p-3 border-2 rounded-lg flex items-start gap-3 ${getOptionClass(index)}`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-sm text-gray-700 dark:text-gray-300">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                    {option}
                  </span>
                </div>
                {getOptionIcon(index)}
              </div>
            ))}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <Card className={`shadow-lg border-2 ${
              selectedAnswer === currentQuestion.correctAnswer 
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/40 border-green-300 dark:border-green-700' 
                : 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/40 border-red-300 dark:border-red-700'
            }`}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    selectedAnswer === currentQuestion.correctAnswer 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`}>
                    {selectedAnswer === currentQuestion.correctAnswer ? (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <h3 className={`text-lg font-bold ${
                    selectedAnswer === currentQuestion.correctAnswer 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                  </h3>
                </div>
                
                <div className="space-y-2 pl-9">
                  <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Correct Answer:
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {String.fromCharCode(65 + currentQuestion.correctAnswer)}. {currentQuestion.options[currentQuestion.correctAnswer]}
                    </p>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Explanation:
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center gap-3 pt-2">
            <Button 
              onClick={handleStop}
              className="flex-1 sm:flex-none bg-red-700 hover:bg-red-800 text-white"
            >
              🏁 Stop Quiz
            </Button>

            {showExplanation && (
              currentQuestionIndex < quizData.length - 1 ? (
                <Button 
                  onClick={handleNext}
                  className="flex-1 sm:flex-none"
                >
                  Next Question →
                </Button>
              ) : (
                <Button 
                  onClick={handleFinish}
                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                >
                  🎉 View Results
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
