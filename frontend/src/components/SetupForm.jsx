import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function SetupForm({ backendUrl, onQuizGenerated, onFlashcardsGenerated }) {
  const [apiKey, setApiKey] = useState('')
  const [modelName, setModelName] = useState('')
  const [contentSource, setContentSource] = useState('document')
  const [contentType, setContentType] = useState('quiz')
  const [language, setLanguage] = useState('english')
  const [numQuestions, setNumQuestions] = useState(5)
  const [numCards, setNumCards] = useState(10)
  const [documentContent, setDocumentContent] = useState('')
  const [fileInfo, setFileInfo] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [youtubeInfo, setYoutubeInfo] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [websiteInfo, setWebsiteInfo] = useState('')
  const [isScrapingWebsite, setIsScrapingWebsite] = useState(false)
  const [isFetchingYoutube, setIsFetchingYoutube] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [configError, setConfigError] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/config`)
      const data = await response.json()

      if (!data.success) {
        setConfigError(true)
        alert('Configuration Error: ' + data.error + '\n\nPlease ensure all environment variables are set on Render.')
        return
      }

      setApiKey(data.openrouter_api_key)
      setModelName(data.model_name)
    } catch (error) {
      setConfigError(true)
      alert('Failed to load configuration from backend. Please ensure the backend server is running.\n\nError: ' + error.message)
      console.error('Configuration error:', error)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setFileInfo(`📄 File loaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`)

    try {
      const text = await file.text()
      setDocumentContent(text)
    } catch (error) {
      alert('Error reading file. Please try again.')
      console.error(error)
    }
  }

  const fetchYouTubeTranscript = async () => {
    if (!youtubeUrl.trim()) {
      alert('Please enter a YouTube video URL')
      return null
    }

    try {
      setIsFetchingYoutube(true)
      setYoutubeInfo('⏳ Fetching YouTube transcript...')

      const languageCode = language === 'english' ? 'en' : 'id'

      const response = await fetch(`${backendUrl}/api/transcript`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_url: youtubeUrl,
          languages: [languageCode, 'en']
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch transcript')
      }

      setDocumentContent(data.transcript)

      const methodText = data.method === 'supadata' ? '(via Supadata.ai)' : '(via Tor proxy)'
      setYoutubeInfo(`✅ Transcript loaded successfully ${methodText} - ${data.snippet_count} snippets, ${data.language}`)

      return data.transcript
    } catch (error) {
      setYoutubeInfo(`❌ Error: ${error.message}. Make sure the backend server is running.`)
      console.error('Error fetching YouTube transcript:', error)
      return null
    } finally {
      setIsFetchingYoutube(false)
    }
  }

  const fetchWebsiteContent = async () => {
    if (!websiteUrl.trim()) {
      alert('Please enter a website URL')
      return null
    }

    try {
      setIsScrapingWebsite(true)
      setWebsiteInfo('⏳ Scraping website content...')

      const response = await fetch(`${backendUrl}/api/scrape-website`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          website_url: websiteUrl
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to scrape website')
      }

      setDocumentContent(data.content)
      const metadata = data.metadata
      setWebsiteInfo(`✅ Website content loaded successfully - ${metadata.title || 'Content extracted'}`)

      return data.content
    } catch (error) {
      setWebsiteInfo(`❌ Error: ${error.message}. Make sure the backend server is running and Firecrawl API key is configured.`)
      console.error('Error fetching website content:', error)
      return null
    } finally {
      setIsScrapingWebsite(false)
    }
  }

  const generateContent = async () => {
    let contentToUse = documentContent

    // Fetch content based on source
    if (contentSource === 'youtube') {
      const transcript = await fetchYouTubeTranscript()
      if (!transcript) return
      contentToUse = transcript
    } else if (contentSource === 'website') {
      const content = await fetchWebsiteContent()
      if (!content) return
      contentToUse = content
    } else if (contentSource === 'document' && !documentContent) {
      // Only check for document content if using document source
      alert('Please upload a document first')
      return
    }

    if (contentType === 'quiz') {
      await generateQuiz(contentToUse)
    } else {
      await generateFlashcards(contentToUse)
    }
  }

  const generateQuiz = async (content) => {
    if (numQuestions < 1 || numQuestions > 20) {
      alert('Please enter a number between 1 and 20')
      return
    }

    setIsGenerating(true)

    try {
      const languageText = language === 'english' ? 'English' : 'Indonesian'
      const prompt = `Based on the following document content, generate ${numQuestions} multiple-choice questions in ${languageText}. 

Document content:
${content}

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
- Return ONLY valid JSON, no additional text`

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
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const aiResponse = data.choices[0].message.content

      // Extract JSON from response
      let jsonContent = aiResponse
      if (aiResponse.includes('```json')) {
        jsonContent = aiResponse.split('```json')[1].split('```')[0].trim()
      } else if (aiResponse.includes('```')) {
        jsonContent = aiResponse.split('```')[1].split('```')[0].trim()
      }

      const quizResponse = JSON.parse(jsonContent)
      onQuizGenerated(quizResponse.questions)

    } catch (error) {
      alert('Error generating quiz: ' + error.message)
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateFlashcards = async (content) => {
    if (numCards < 1 || numCards > 30) {
      alert('Please enter a number between 1 and 30')
      return
    }

    setIsGenerating(true)

    try {
      const languageText = language === 'english' ? 'English' : 'Indonesian'
      const prompt = `Based on the following document content, generate ${numCards} flash cards in ${languageText}. 

Document content:
${content}

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
- Return ONLY valid JSON, no additional text`

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
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const aiResponse = data.choices[0].message.content

      // Extract JSON from response
      let jsonContent = aiResponse
      if (aiResponse.includes('```json')) {
        jsonContent = aiResponse.split('```json')[1].split('```')[0].trim()
      } else if (aiResponse.includes('```')) {
        jsonContent = aiResponse.split('```')[1].split('```')[0].trim()
      }

      const flashcardResponse = JSON.parse(jsonContent)
      onFlashcardsGenerated(flashcardResponse.cards)

    } catch (error) {
      alert('Error generating flashcards: ' + error.message)
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleContentSourceChange = (value) => {
    setContentSource(value)
    setDocumentContent('')
    setFileInfo('')
    setYoutubeUrl('')
    setYoutubeInfo('')
    setWebsiteUrl('')
    setWebsiteInfo('')
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Setup Your Content</CardTitle>
        <CardDescription>Choose your content source and type to get started</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Content Source */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Content Source</label>
          <div className="flex gap-3">
            <button
              onClick={() => handleContentSourceChange('document')}
              className={`flex-1 h-10 px-6 rounded-md text-sm font-medium transition-all inline-flex items-center justify-center gap-2 ${
                contentSource === 'document'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              📄 Document
            </button>
            <button
              onClick={() => handleContentSourceChange('youtube')}
              className={`flex-1 h-10 px-6 rounded-md text-sm font-medium transition-all inline-flex items-center justify-center gap-2 ${
                contentSource === 'youtube'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              🎥 YouTube
            </button>
            <button
              onClick={() => handleContentSourceChange('website')}
              className={`flex-1 h-10 px-6 rounded-md text-sm font-medium transition-all inline-flex items-center justify-center gap-2 ${
                contentSource === 'website'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              🌐 Website
            </button>
          </div>
        </div>

        {/* Document Upload */}
        {contentSource === 'document' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Document</label>
            <Input type="file" accept=".txt" onChange={handleFileUpload} />
            {fileInfo && <p className="text-sm text-green-600 dark:text-green-400">{fileInfo}</p>}
          </div>
        )}

        {/* YouTube URL */}
        {contentSource === 'youtube' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">YouTube Video URL</label>
            <Input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
            {youtubeInfo && (
              <p className={`text-sm ${youtubeInfo.startsWith('✅') ? 'text-green-600 dark:text-green-400' : youtubeInfo.startsWith('❌') ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                {youtubeInfo}
              </p>
            )}
          </div>
        )}

        {/* Website URL */}
        {contentSource === 'website' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Website URL</label>
            <Input
              type="url"
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
            {websiteInfo && (
              <p className={`text-sm ${websiteInfo.startsWith('✅') ? 'text-green-600 dark:text-green-400' : websiteInfo.startsWith('❌') ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                {websiteInfo}
              </p>
            )}
          </div>
        )}

        {/* Content Type */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Content Type</label>
          <div className="flex gap-3">
            <button
              onClick={() => setContentType('quiz')}
              className={`flex-1 h-10 px-6 rounded-md text-sm font-medium transition-all inline-flex items-center justify-center gap-2 ${
                contentType === 'quiz'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              📝 Quiz
            </button>
            <button
              onClick={() => setContentType('flashcards')}
              className={`flex-1 h-10 px-6 rounded-md text-sm font-medium transition-all inline-flex items-center justify-center gap-2 ${
                contentType === 'flashcards'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              🎴 Flash Cards
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Language</label>
          <div className="flex gap-3">
            <button
              onClick={() => setLanguage('english')}
              className={`flex-1 h-10 px-6 rounded-md text-sm font-medium transition-all inline-flex items-center justify-center gap-2 ${
                language === 'english'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              🇬🇧 English
            </button>
            <button
              onClick={() => setLanguage('indonesian')}
              className={`flex-1 h-10 px-6 rounded-md text-sm font-medium transition-all inline-flex items-center justify-center gap-2 ${
                language === 'indonesian'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              🇮🇩 Indonesian
            </button>
          </div>
        </div>

        {/* Number of Questions/Cards */}
        {contentType === 'quiz' ? (
          <div className="space-y-2">
            <label className="text-sm font-medium">Number of Questions (1-20)</label>
            <Input
              type="number"
              min="1"
              max="20"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value))}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium">Number of Flash Cards (1-30)</label>
            <Input
              type="number"
              min="1"
              max="30"
              value={numCards}
              onChange={(e) => setNumCards(parseInt(e.target.value))}
            />
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={generateContent}
          disabled={isScrapingWebsite || isFetchingYoutube || isGenerating || configError}
          className={`w-full ${isScrapingWebsite || isFetchingYoutube ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
          size="lg"
        >
          {isScrapingWebsite ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">🌐</span>
              Scraping website...
            </span>
          ) : isFetchingYoutube ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">🎥</span>
              Fetching YouTube transcript...
            </span>
          ) : isGenerating ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              {contentType === 'quiz' ? 'Generating Quiz...' : 'Generating Flash Cards...'}
            </span>
          ) : configError ? (
            '⚠️ Configuration Error'
          ) : (
            `🚀 Generate ${contentType === 'quiz' ? 'Quiz' : 'Flash Cards'}`
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
