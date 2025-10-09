import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResultsPage({ quizData, userAnswers, onReset }) {
  const score = userAnswers.reduce((total, answer, index) => {
    return total + (answer === quizData[index].correctAnswer ? 1 : 0)
  }, 0)

  const percentage = (score / quizData.length * 100).toFixed(1)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Score Card */}
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-3xl">Quiz Results</CardTitle>
          <CardDescription>Here's how you did!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 my-8">
            {score} / {quizData.length}
          </div>
          <p className="text-2xl text-gray-600 dark:text-gray-400">
            {percentage}% Correct
          </p>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {quizData.map((question, index) => {
            const userAnswer = userAnswers[index]
            const isCorrect = userAnswer === question.correctAnswer

            return (
              <Card
                key={index}
                className={isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}
              >
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className={`text-2xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? '✅' : '❌'}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        Question {index + 1}: {question.question}
                      </h3>

                      <div className="space-y-2">
                        <p className="text-sm">
                          <strong>Your Answer:</strong>{' '}
                          {userAnswer !== null
                            ? `${String.fromCharCode(65 + userAnswer)}. ${question.options[userAnswer]}`
                            : 'Not answered'}
                        </p>

                        <p className="text-sm">
                          <strong>Correct Answer:</strong>{' '}
                          {String.fromCharCode(65 + question.correctAnswer)}. {question.options[question.correctAnswer]}
                        </p>

                        {!isCorrect && (
                          <p className="text-sm mt-3 p-3 bg-white dark:bg-gray-800 rounded">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </CardContent>
      </Card>

      {/* Reset Button */}
      <div className="text-center">
        <Button onClick={onReset} size="lg">
          🔄 Start Over
        </Button>
      </div>
    </div>
  )
}
