# Website Scraping Feature - Implementation Plan

## Overview
Add website URL scraping functionality to the AI Quiz & Flashcard Generator, allowing users to generate quizzes and flashcards from website content using Firecrawl.

## Current Architecture Analysis

The application currently supports:
- **Document uploads** (text, PDF, DOC/DOCX files) - handled by frontend file reader
- **YouTube videos** - Python backend using youtube-transcript-api
- **Content generation** - OpenRouter API (Gemini 2.0 Flash)

## Proposed Architecture for Website Scraping

### Backend Changes (Python Flask)

#### 1. Install Firecrawl Python SDK
- Add `firecrawl-py` to `backend/requirements.txt`
- The Firecrawl SDK will handle website scraping and return clean markdown content

#### 2. Create New API Endpoint
```python
@app.route('/api/scrape-website', methods=['POST'])
def scrape_website():
    """
    Scrape website content using Firecrawl
    """
    # Accept: website_url, firecrawl_api_key
    # Return: success, content, metadata
```

#### 3. Configuration
- Users will need a Firecrawl API key (free tier available)
- API key will be stored in frontend configuration alongside OpenRouter key

### Frontend Changes

#### 1. Update Content Source Selector (index.html)
Add "Website URL" option to the existing dropdown:
- Upload Document
- YouTube Video URL
- **Website URL** (new)

#### 2. Add Website URL Input Group (index.html)
- Create new form group `websiteUrlGroup`
- Input field for website URL
- Status display area for scraping feedback

#### 3. Update API Configuration Section (index.html)
- Add Firecrawl API key input field
- Store alongside OpenRouter API key

#### 4. Update JavaScript Logic (script.js)
- Add `fetchWebsiteContent()` function to call backend scraping endpoint
- Update `updateContentSource()` to show/hide website input group
- Modify `generateContent()` to handle website scraping workflow
- Add Firecrawl API key to configuration management

## Implementation Flow

```
User enters website URL → 
Backend receives request with URL and Firecrawl API key →
Backend calls Firecrawl API →
Firecrawl scrapes and extracts clean content →
Backend returns markdown content to frontend →
Frontend stores in documentContent variable →
User generates quiz/flashcards from website content
```

## Key Benefits of Using Firecrawl

1. **JavaScript Rendering**: Handles modern SPAs and dynamic websites
2. **Clean Extraction**: Removes navigation, footers, ads - only main content
3. **Multiple Formats**: Returns markdown, HTML, or structured data
4. **PDF Support**: Can scrape PDF links directly
5. **Rate Limiting**: Built-in handling for polite scraping
6. **LLM-Ready**: Content formatted specifically for AI processing

## Configuration Requirements

**Users will need:**
- OpenRouter API key (already required)
- **Firecrawl API key** (new requirement)
  - Free tier available at https://firecrawl.dev
  - Provides limited scraping credits
  - Easy to obtain and configure

## Error Handling Considerations

- Invalid/unreachable URLs
- Websites that block scraping
- Rate limits exceeded
- API key issues
- Content extraction failures
- Network timeouts

## Testing Strategy

1. Test with simple static websites (e.g., Wikipedia articles)
2. Test with modern JavaScript-heavy sites
3. Test with various content types (blogs, documentation, news)
4. Verify error handling with invalid URLs
5. Test content generation from scraped data
6. Verify proper cleanup and state management

## Firecrawl Integration Details

Based on the latest Firecrawl documentation:

### Python SDK Usage
```python
from firecrawl import FirecrawlApp

app = FirecrawlApp(api_key="YOUR_API_KEY")
response = app.scrape_url(
    url="https://example.com",
    params={
        "formats": ["markdown"],
        "onlyMainContent": True  # Extract only main content
    }
)
```

### Response Structure
```python
{
    "success": True,
    "markdown": "Scraped content in markdown format",
    "metadata": {
        "title": "Page title",
        "description": "Page description",
        "language": "en",
        "sourceURL": "https://example.com"
    }
}
```

## Implementation Checklist

- [ ] Update backend/requirements.txt with firecrawl-py
- [ ] Add website scraping endpoint to backend/app.py
- [ ] Update index.html with website URL option and input field
- [ ] Add Firecrawl API key configuration to frontend
- [ ] Update script.js with website scraping functions
- [ ] Implement error handling for website scraping
- [ ] Test with various website types

## File Changes Summary

### Files to Modify:
1. `backend/requirements.txt` - Add firecrawl-py dependency
2. `backend/app.py` - Add new scraping endpoint
3. `index.html` - Add website URL option and input, Firecrawl API key field
4. `script.js` - Add website scraping logic and API key management

### No New Files Required
All changes are additions/modifications to existing files.

## Next Steps

Once approved, toggle to ACT MODE to begin implementation in this order:
1. Backend changes (requirements.txt and app.py)
2. Frontend UI changes (index.html)
3. Frontend logic changes (script.js)
4. Testing and validation
