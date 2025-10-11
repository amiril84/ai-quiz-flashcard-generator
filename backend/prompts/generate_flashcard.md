Based on the following document content, generate {{numCards}} flash cards in {{language}}. 

Document content:
{{documentContent}}

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
- Create {{numCards}} flash cards
- Each card should have a front (question/concept) and back (answer/explanation)
- Front should be concise and clear (max 15 words)
- Back should be VERY CONCISE - MAXIMUM 30 WORDS ONLY
- Keep the back answer brief, focused, and to the point
- Avoid lengthy explanations - summarize key points only
- Cards should be in {{language}}
- Cover the most important concepts from the document
- Return ONLY valid JSON, no additional text
