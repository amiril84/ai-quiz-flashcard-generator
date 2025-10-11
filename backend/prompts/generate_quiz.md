Based on the following document content, generate {{numQuestions}} multiple-choice questions in {{language}}. 

Document content:
{{documentContent}}

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
- Questions should be in {{language}}
- DO NOT include filler phrases like "according to the document", "according to the file", "based on the text", or similar references in questions or explanations
- Write questions and explanations as direct statements of fact
- Return ONLY valid JSON, no additional text
