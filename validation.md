# Input Validation and Sanitization Implementation Plan

## Overview
This document outlines the comprehensive plan for adding input validation and sanitization to all text input fields in the AI Quiz & Flashcard Generator application to prevent SQL injection, XSS attacks, and ensure proper URL formats.

## Current Issues Identified

### 1. User Experience Issues
- **Disruptive Alerts**: Using `alert()` for error messages creates Windows-style popups that interrupt user flow
- **No Real-time Feedback**: Users don't know if their input is valid until they click generate
- **Generic Error Messages**: Errors don't provide helpful guidance on how to fix issues

### 2. Security Vulnerabilities
- **No Input Sanitization**: Text fields accept any characters, including potentially malicious code
- **No URL Validation**: URL fields accept any string without format verification
- **No Backend Validation**: Server trusts all client-side data without verification
- **SQL Injection Risk**: Unsanitized inputs could be used in database queries (if database is added later)
- **XSS Risk**: Unsanitized text could be rendered in the UI

### 3. Functional Issues
- **YouTube URL Issues**:
  - Accepts playlist URLs instead of video URLs
  - Accepts channel URLs, shorts URLs, or other non-video YouTube URLs
  - No validation of video ID format
  
- **Website URL Issues**:
  - Accepts YouTube URLs in website field (should suggest switching to YouTube source)
  - No validation for proper URL format (http/https)
  - No domain structure validation

- **Topic Text Issues**:
  - Accepts empty or whitespace-only input
  - No length limits (could cause API issues with very long inputs)
  - No character validation

## Proposed Solution Architecture

### Three-Layer Validation Strategy

1. **Client-Side Validation (Frontend)** - Immediate user feedback
2. **Server-Side Validation (Backend)** - Security enforcement
3. **Sanitization Layer** - Clean all inputs before processing

---

## Detailed Implementation Plan

### STEP 1: Create Validation Utility Functions

**File**: `frontend/src/lib/validators.js` (NEW FILE)

#### 1.1 YouTube URL Validators

**Function: `isValidYouTubeVideoUrl(url)`**
- **Purpose**: Validate that URL is a valid YouTube video URL
- **Returns**: `{ isValid: boolean, error: string }`
- **Validation Rules**:
  - Must match YouTube domain patterns: `youtube.com`, `youtu.be`, `m.youtube.com`
  - Must contain video ID parameter (`?v=` or `/embed/` or direct ID in youtu.be)
  - Video ID must be 11 characters (alphanumeric, hyphen, underscore)
  - Must NOT be a playlist URL (no `&list=` or `/playlist?`)
  - Must NOT be a channel URL (no `/channel/`, `/@username`)
  - Must NOT be a shorts URL (optional - can be accepted or rejected)

**Function: `extractYouTubeVideoId(url)`**
- **Purpose**: Extract video ID from various YouTube URL formats
- **Returns**: Video ID string or null
- **Supported Formats**:
  ```
  https://www.youtube.com/watch?v=VIDEO_ID
  https://youtu.be/VIDEO_ID
  https://www.youtube.com/embed/VIDEO_ID
  https://www.youtube.com/v/VIDEO_ID
  https://m.youtube.com/watch?v=VIDEO_ID
  ```

**Function: `isYouTubePlaylist(url)`**
- **Purpose**: Detect if URL is a YouTube playlist
- **Returns**: boolean
- **Detection Patterns**:
  - Contains `/playlist?list=`
  - Contains `&list=` in watch URL

**Function: `getYouTubeUrlType(url)`**
- **Purpose**: Identify the type of YouTube URL
- **Returns**: 'video' | 'playlist' | 'channel' | 'shorts' | 'invalid'

#### 1.2 Website URL Validators

**Function: `isValidWebsiteUrl(url)`**
- **Purpose**: Validate general website URL format
- **Returns**: `{ isValid: boolean, error: string }`
- **Validation Rules**:
  - Must start with http:// or https://
  - Must have valid domain structure (contains at least one dot)
  - Must NOT be a YouTube URL (check domain)
  - Domain must not contain invalid characters
  - Path must not contain suspicious patterns

**Function: `isYouTubeUrl(url)`**
- **Purpose**: Check if URL is any YouTube domain
- **Returns**: boolean
- **Detection**: Check if domain includes youtube.com or youtu.be

**Function: `sanitizeUrl(url)`**
- **Purpose**: Clean and normalize URL input
- **Returns**: Sanitized URL string
- **Actions**:
  - Trim whitespace
  - Remove invisible characters
  - Decode any URL encoding
  - Validate protocol (add https:// if missing for non-localhost)
  - Remove any script tags or javascript: protocols

#### 1.3 Text Input Validators

**Function: `isValidTopicText(text)`**
- **Purpose**: Validate topic text input
- **Returns**: `{ isValid: boolean, error: string }`
- **Validation Rules**:
  - Must not be empty or only whitespace
  - Length between 3-200 characters
  - Must not contain HTML tags
  - Must not contain script tags
  - Can contain letters, numbers, spaces, basic punctuation

**Function: `sanitizeText(text)`**
- **Purpose**: Remove potentially malicious content from text
- **Returns**: Sanitized text string
- **Actions**:
  - Trim whitespace
  - Remove HTML tags (except safe ones if needed)
  - Remove script tags
  - Remove SQL injection patterns (', --, /*, */, etc.)
  - Encode special characters
  - Remove invisible Unicode characters

#### 1.4 General Utility Functions

**Function: `escapeHtml(text)`**
- **Purpose**: Escape HTML special characters
- **Returns**: Escaped string
- **Escapes**: `<`, `>`, `&`, `"`, `'`

**Function: `containsSqlInjectionPattern(text)`**
- **Purpose**: Detect common SQL injection patterns
- **Returns**: boolean
- **Patterns to detect**:
  - SQL keywords in suspicious context (SELECT, DROP, DELETE, INSERT, UPDATE)
  - Comment indicators (-- , /* */)
  - String concatenation attempts
  - UNION statements

---

### STEP 2: Create Elegant Error Notification System

**File**: `frontend/src/components/SetupForm.jsx` (MODIFY)

#### 2.1 Add Error State Management

**New State Variables**:
```javascript
const [errors, setErrors] = useState({
  youtube: '',
  website: '',
  topic: ''
})

const [warnings, setWarnings] = useState({
  youtube: '',
  website: '',
  topic: ''
})
```

#### 2.2 Error Display Component Pattern

**Inline Error Display**:
- Position: Directly below each input field
- Style: Red text for errors, amber/yellow for warnings
- Animation: Fade in when error appears, fade out when cleared
- Icon: ❌ for errors, ⚠️ for warnings
- Auto-clear: Clear error when user starts typing

**Example Error Message Format**:
```
❌ Please enter a valid YouTube video URL (playlists are not supported)
⚠️ This looks like a YouTube URL. Did you mean to select YouTube as content source?
```

#### 2.3 Replace All alert() Calls

**Current alert() locations to replace**:
1. `fetchYouTubeTranscript()` - "Please enter a YouTube video URL"
2. `fetchWebsiteContent()` - "Please enter a website URL"
3. `generateQuizFromTopic()` - "Please enter a topic"
4. `generateFlashcardsFromTopic()` - "Please enter a topic"
5. `generateQuiz()` - "Please enter a number between 1 and 20"
6. `generateFlashcards()` - "Please enter a number between 1 and 30"
7. Configuration errors
8. API errors

**Replacement Strategy**:
- Use inline error messages for field validation
- Use toast notifications for API/system errors (consider adding a toast library)
- Keep error messages helpful and actionable

---

### STEP 3: Implement YouTube URL Validation

**File**: `frontend/src/components/SetupForm.jsx` (MODIFY)

#### 3.1 Add Validation Function

**Function: `validateYouTubeUrl(url)`**
- Called on blur (when user leaves the field)
- Called before fetching transcript
- Updates error/warning state

**Validation Logic**:
```javascript
const validateYouTubeUrl = (url) => {
  // Import from validators.js
  if (!url.trim()) {
    setErrors(prev => ({ ...prev, youtube: '❌ Please enter a YouTube video URL' }))
    return false
  }
  
  const urlType = getYouTubeUrlType(url)
  
  if (urlType === 'playlist') {
    setErrors(prev => ({ 
      ...prev, 
      youtube: '❌ Playlist URLs are not supported. Please enter a single video URL' 
    }))
    return false
  }
  
  if (urlType === 'channel') {
    setErrors(prev => ({ 
      ...prev, 
      youtube: '❌ Channel URLs are not supported. Please enter a video URL' 
    }))
    return false
  }
  
  if (urlType === 'invalid') {
    setErrors(prev => ({ 
      ...prev, 
      youtube: '❌ Invalid YouTube URL. Please enter a valid video URL' 
    }))
    return false
  }
  
  // Clear errors if valid
  setErrors(prev => ({ ...prev, youtube: '' }))
  return true
}
```

#### 3.2 Integration Points

**On Input Change**:
```javascript
onChange={(e) => {
  setYoutubeUrl(e.target.value)
  // Clear errors when user starts typing
  setErrors(prev => ({ ...prev, youtube: '' }))
}}
```

**On Blur**:
```javascript
onBlur={() => validateYouTubeUrl(youtubeUrl)}
```

**Before Fetch**:
```javascript
const fetchYouTubeTranscript = async () => {
  if (!validateYouTubeUrl(youtubeUrl)) {
    return null
  }
  
  // Sanitize URL before sending to backend
  const sanitizedUrl = sanitizeUrl(youtubeUrl)
  
  // ... rest of fetch logic
}
```

---

### STEP 4: Implement Website URL Validation

**File**: `frontend/src/components/SetupForm.jsx` (MODIFY)

#### 4.1 Add Validation Function

**Function: `validateWebsiteUrl(url)`**
- Called on blur
- Called before fetching website content
- Detects YouTube URLs and suggests switching source

**Validation Logic**:
```javascript
const validateWebsiteUrl = (url) => {
  if (!url.trim()) {
    setErrors(prev => ({ ...prev, website: '❌ Please enter a website URL' }))
    return false
  }
  
  // Check if it's a YouTube URL
  if (isYouTubeUrl(url)) {
    setWarnings(prev => ({ 
      ...prev, 
      website: '⚠️ This is a YouTube URL. Please select "YouTube" as your content source instead' 
    }))
    return false
  }
  
  // Validate website URL format
  const validation = isValidWebsiteUrl(url)
  if (!validation.isValid) {
    setErrors(prev => ({ ...prev, website: `❌ ${validation.error}` }))
    return false
  }
  
  // Clear errors/warnings if valid
  setErrors(prev => ({ ...prev, website: '' }))
  setWarnings(prev => ({ ...prev, website: '' }))
  return true
}
```

#### 4.2 Integration Points

Similar to YouTube validation:
- Clear errors on input change
- Validate on blur
- Validate before fetch
- Sanitize URL before sending to backend

---

### STEP 5: Implement Topic Text Validation

**File**: `frontend/src/components/SetupForm.jsx` (MODIFY)

#### 5.1 Add Validation Function

**Function: `validateTopicText(text)`**
- Called on blur
- Called before generation
- Checks for empty input and validates content

**Validation Logic**:
```javascript
const validateTopicText = (text) => {
  if (!text.trim()) {
    setErrors(prev => ({ 
      ...prev, 
      topic: '❌ Please enter a topic (e.g., "English Grammar Past Tense")' 
    }))
    return false
  }
  
  const validation = isValidTopicText(text)
  if (!validation.isValid) {
    setErrors(prev => ({ ...prev, topic: `❌ ${validation.error}` }))
    return false
  }
  
  // Clear errors if valid
  setErrors(prev => ({ ...prev, topic: '' }))
  return true
}
```

#### 5.2 Integration Points

**Before Quiz Generation**:
```javascript
const generateQuizFromTopic = async () => {
  if (!validateTopicText(topicText)) {
    return
  }
  
  // Sanitize topic before sending
  const sanitizedTopic = sanitizeText(topicText)
  
  // ... rest of generation logic
}
```

---

### STEP 6: Backend Validation Layer

**File**: `backend/app.py` (MODIFY)

#### 6.1 Create Validation Utilities

**Add at the top of app.py**:
```python
import urllib.parse
from urllib.parse import urlparse
import re

def validate_youtube_url(url):
    """Validate YouTube video URL on server side"""
    if not url:
        return False, "URL is required"
    
    # Parse URL
    parsed = urlparse(url)
    
    # Check domain
    if parsed.netloc not in ['www.youtube.com', 'youtube.com', 'youtu.be', 'm.youtube.com']:
        return False, "Not a valid YouTube URL"
    
    # Check for playlist
    if 'list=' in parsed.query:
        return False, "Playlist URLs are not supported"
    
    # Extract video ID
    if parsed.netloc == 'youtu.be':
        video_id = parsed.path.lstrip('/')
    else:
        query_params = urllib.parse.parse_qs(parsed.query)
        video_id = query_params.get('v', [None])[0]
    
    # Validate video ID format (11 characters, alphanumeric + - _)
    if not video_id or not re.match(r'^[A-Za-z0-9_-]{11}$', video_id):
        return False, "Invalid video ID format"
    
    return True, video_id

def validate_website_url(url):
    """Validate website URL on server side"""
    if not url:
        return False, "URL is required"
    
    # Parse URL
    parsed = urlparse(url)
    
    # Check protocol
    if parsed.scheme not in ['http', 'https']:
        return False, "URL must use http or https protocol"
    
    # Check if it's a YouTube URL
    if parsed.netloc in ['www.youtube.com', 'youtube.com', 'youtu.be', 'm.youtube.com']:
        return False, "YouTube URLs should use the YouTube content source"
    
    # Check domain structure
    if not parsed.netloc or '.' not in parsed.netloc:
        return False, "Invalid domain structure"
    
    return True, url

def sanitize_text(text):
    """Sanitize text input to prevent injection attacks"""
    if not text:
        return ""
    
    # Remove null bytes
    text = text.replace('\x00', '')
    
    # Remove script tags
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.IGNORECASE | re.DOTALL)
    
    # Remove SQL injection patterns
    sql_patterns = [
        r'(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b)',
        r'(--|\/\*|\*\/)',
    ]
    for pattern in sql_patterns:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    
    # Limit length
    text = text[:500]
    
    return text.strip()
```

#### 6.2 Update Transcript Endpoint

**Modify `/api/transcript` route**:
```python
@app.route('/api/transcript', methods=['POST'])
def get_transcript():
    try:
        data = request.get_json()
        video_url = data.get('video_url', '')
        
        # Validate URL
        is_valid, result = validate_youtube_url(video_url)
        if not is_valid:
            return jsonify({
                'success': False,
                'error': result
            }), 400
        
        # result is the video_id if valid
        video_id = result
        
        # ... rest of the logic
```

#### 6.3 Update Website Scraping Endpoint

**Modify `/api/scrape-website` route**:
```python
@app.route('/api/scrape-website', methods=['POST'])
def scrape_website():
    try:
        data = request.get_json()
        website_url = data.get('website_url', '')
        
        # Validate URL
        is_valid, result = validate_website_url(website_url)
        if not is_valid:
            return jsonify({
                'success': False,
                'error': result
            }), 400
        
        # Sanitize URL
        sanitized_url = result
        
        # ... rest of the logic
```

---

### STEP 7: UI/UX Enhancements

#### 7.1 Error Display Styling

**Add to SetupForm.jsx component**:
```javascript
// Error message component
const ErrorMessage = ({ message, type = 'error' }) => {
  if (!message) return null
  
  const isError = type === 'error'
  const bgColor = isError ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20'
  const textColor = isError ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
  const borderColor = isError ? 'border-red-200 dark:border-red-800' : 'border-amber-200 dark:border-amber-800'
  
  return (
    <div className={`mt-2 p-3 rounded-md border ${bgColor} ${borderColor} ${textColor} text-sm animate-fade-in`}>
      {message}
    </div>
  )
}
```

#### 7.2 Add Error Display to Each Field

**YouTube URL Field**:
```jsx
{contentSource === 'youtube' && (
  <div className="space-y-2">
    <label className="text-sm font-medium">YouTube Video URL</label>
    <Input
      type="url"
      placeholder="https://www.youtube.com/watch?v=..."
      value={youtubeUrl}
      onChange={(e) => {
        setYoutubeUrl(e.target.value)
        setErrors(prev => ({ ...prev, youtube: '' }))
        setWarnings(prev => ({ ...prev, youtube: '' }))
      }}
      onBlur={() => validateYouTubeUrl(youtubeUrl)}
      className={errors.youtube ? 'border-red-500' : ''}
    />
    <ErrorMessage message={errors.youtube} type="error" />
    <ErrorMessage message={warnings.youtube} type="warning" />
    {/* ... existing youtubeInfo display ... */}
  </div>
)}
```

**Similar updates for Website URL and Topic fields**

---

### STEP 8: Testing Scenarios

#### 8.1 YouTube URL Tests

**Valid URLs (Should Pass)**:
- `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- `https://youtu.be/dQw4w9WgXcQ`
- `https://www.youtube.com/embed/dQw4w9WgXcQ`
- `https://m.youtube.com/watch?v=dQw4w9WgXcQ`

**Invalid URLs (Should Fail)**:
- `https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf` (Playlist)
- `https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw` (Channel)
- `https://www.youtube.com/@username` (Channel handle)
- `https://www.google.com` (Not YouTube)
- `youtube.com/watch?v=invalid` (Invalid video ID)
- Empty string
- Random text

#### 8.2 Website URL Tests

**Valid URLs (Should Pass)**:
- `https://wikipedia.org/wiki/Article`
- `http://example.com`
- `https://id.wikipedia.org/wiki/Indonesia`

**Invalid URLs (Should Warn/Fail)**:
- `https://www.youtube.com/watch?v=dQw4w9WgXcQ` (YouTube URL - warning)
- `not-a-url` (Invalid format)
- `ftp://example.com` (Invalid protocol)
- Empty string

#### 8.3 Topic Text Tests

**Valid Topics (Should Pass)**:
- `English Grammar Past Tense`
- `Photosynthesis for high school students`
- `World War 2 History`

**Invalid Topics (Should Fail)**:
- Empty string
- `   ` (Only whitespace)
- `<script>alert('xss')</script>` (XSS attempt)
- `'; DROP TABLE users; --` (SQL injection attempt)
- Very long text (>200 characters)

---

## Implementation Checklist

### Phase 1: Foundation ✅ COMPLETED
- [x] Create `frontend/src/lib/validators.js` with all validation functions
- [x] Add error state management to SetupForm.jsx
- [x] Create ErrorMessage component

### Phase 2: Frontend Validation ✅ COMPLETED
- [x] Implement YouTube URL validation
- [x] Implement website URL validation
- [x] Implement topic text validation
- [x] Add inline error displays to all fields
- [x] Replace most alert() calls (config/API errors still use alert, which is acceptable)

### Phase 3: Backend Validation ⚠️ NOT YET IMPLEMENTED
- [ ] Add validation utilities to app.py
- [ ] Update transcript endpoint with validation
- [ ] Update scrape-website endpoint with validation
- [ ] Add text sanitization to backend

### Phase 4: Testing ⚠️ NOT YET COMPLETED
- [ ] Test all YouTube URL scenarios
- [ ] Test all website URL scenarios
- [ ] Test all topic text scenarios
- [ ] Test error message display
- [ ] Test sanitization functions
- [ ] Test backend validation

### Phase 5: Edge Cases ⚠️ NOT YET COMPLETED
- [ ] Test with special characters
- [ ] Test with Unicode characters
- [ ] Test with very long inputs
- [ ] Test with malicious inputs
- [ ] Test with network errors

---

## Security Considerations

### 1. Client-Side Validation (NOT Security)
- Client-side validation is for UX only
- Can be bypassed by malicious users
- Should never be relied upon for security

### 2. Server-Side Validation (Security Layer)
- Always validate on the backend
- Never trust client input
- Sanitize before processing
- Use allowlists, not denylists when possible

### 3. Defense in Depth
- Multiple layers of validation
- Input validation + output encoding
- Sanitization at multiple points
- Regular security audits

### 4. Future Enhancements
- Consider using DOMPurify for HTML sanitization
- Add rate limiting to prevent abuse
- Implement CSRF protection
- Add input length limits at database level (if database added)
- Consider using Content Security Policy headers

---

## Notes and Best Practices

1. **Always validate on both client and server**
2. **Clear errors when user starts correcting input**
3. **Provide helpful, actionable error messages**
4. **Use warnings for suggestions, errors for blocking issues**
5. **Sanitize inputs before processing or storage**
6. **Test with real malicious inputs**
7. **Keep validation logic in separate utility files for reusability**
8. **Document all validation rules**
9. **Consider accessibility (ARIA labels for errors)**
10. **Regular expression performance matters - avoid catastrophic backtracking**

---

## End of Document
