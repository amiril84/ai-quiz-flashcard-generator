from flask import Flask, request, jsonify
from flask_cors import CORS
from firecrawl import FirecrawlApp
from dotenv import load_dotenv
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import re
import os
import time

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Configure CORS to allow requests from your frontend
# In production, replace '*' with your actual frontend domain
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Load API keys from environment variables
OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY', '')
OPENROUTER_MODEL_NAME = os.environ.get('OPENROUTER_MODEL_NAME', 'google/gemini-2.0-flash-exp:free')
FIRECRAWL_API_KEY = os.environ.get('FIRECRAWL_API_KEY', '')
RAPIDAPI_KEY = os.environ.get('RAPIDAPI_KEY', '')

@app.route('/api/config', methods=['GET'])
def get_config():
    """
    Return API configuration to frontend
    """
    if not OPENROUTER_API_KEY:
        return jsonify({
            'success': False,
            'error': 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable on Render.'
        }), 500
    
    return jsonify({
        'success': True,
        'openrouter_api_key': OPENROUTER_API_KEY,
        'model_name': OPENROUTER_MODEL_NAME
    })

def extract_video_id(url):
    """
    Extract video ID from various YouTube URL formats
    """
    # Pattern for different YouTube URL formats
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
        r'youtube\.com\/embed\/([^&\n?#]+)',
        r'youtube\.com\/v\/([^&\n?#]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    # If no pattern matches, assume the input is already a video ID
    return url

def create_session_with_retries():
    """
    Create a requests session with retry logic and proxy bypass
    """
    session = requests.Session()
    
    # Retry strategy with exponential backoff
    retry_strategy = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["HEAD", "GET", "POST", "OPTIONS"]
    )
    
    adapter = HTTPAdapter(
        max_retries=retry_strategy,
        pool_connections=10,
        pool_maxsize=20
    )
    
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    
    return session

def fetch_transcript_via_rapidapi(video_id, api_key, languages=['en']):
    """
    Fetch transcript using RapidAPI YouTube Transcript3 service with improved error handling
    """
    url = "https://youtube-transcript3.p.rapidapi.com/api/transcript"
    
    querystring = {"videoId": video_id}
    
    # Add language parameter if specified and not English
    if languages and languages[0] != 'en':
        querystring["lang"] = languages[0]
    
    headers = {
        "x-rapidapi-key": api_key,
        "x-rapidapi-host": "youtube-transcript3.p.rapidapi.com"
    }
    
    # Create session with retry logic
    session = create_session_with_retries()
    
    # Explicitly bypass any system proxies
    proxies = {
        'http': None,
        'https': None
    }
    
    try:
        response = session.get(
            url, 
            headers=headers, 
            params=querystring,
            proxies=proxies,
            timeout=(5, 30)  # 5s connect, 30s read timeout
        )
        response.raise_for_status()
    except requests.exceptions.ProxyError as e:
        raise Exception(f"Proxy error (check system proxy settings): {str(e)}")
    except requests.exceptions.Timeout as e:
        raise Exception(f"Request timeout: {str(e)}")
    except requests.exceptions.ConnectionError as e:
        raise Exception(f"Connection error: {str(e)}")
    
    data = response.json()
    
    # Transform RapidAPI response to match our expected format
    if data.get('success') and 'transcript' in data:
        transcript_items = data['transcript']
        
        # Combine all text snippets
        if isinstance(transcript_items, list):
            transcript_text = ' '.join([item.get('text', '') for item in transcript_items])
            language = transcript_items[0].get('lang', 'en') if transcript_items else 'en'
        else:
            # Handle flat_text response
            transcript_text = transcript_items
            language = 'en'
        
        return {
            'success': True,
            'video_id': video_id,
            'transcript': transcript_text,
            'language': language,
            'language_code': language,
            'is_generated': False,
            'snippet_count': len(transcript_items) if isinstance(transcript_items, list) else 0,
            'method': 'rapidapi'
        }
    else:
        raise Exception(data.get('error', 'Failed to fetch transcript from RapidAPI'))

@app.route('/api/transcript', methods=['POST'])
def get_transcript():
    """
    Fetch YouTube transcript for a given video URL or ID
    Uses RapidAPI YouTube Transcript3 service
    Improved with proxy bypass and better error handling
    """
    try:
        data = request.get_json()
        video_url = data.get('video_url', '')
        languages = data.get('languages', ['en'])
        rapidapi_key = RAPIDAPI_KEY
        
        if not video_url:
            return jsonify({
                'success': False,
                'error': 'Video URL is required'
            }), 400
        
        if not rapidapi_key:
            error_msg = 'RapidAPI key not configured. Please set RAPIDAPI_KEY environment variable.'
            print(f"[ERROR] {error_msg}")
            return jsonify({
                'success': False,
                'error': error_msg
            }), 500
        
        # Extract video ID from URL
        video_id = extract_video_id(video_url)
        
        print(f"[INFO] Attempting to fetch transcript for video ID: {video_id}")
        print("[INFO] Using RapidAPI...")
        
        try:
            result = fetch_transcript_via_rapidapi(video_id, rapidapi_key, languages)
            print(f"[SUCCESS] RapidAPI succeeded - {result.get('snippet_count', 0)} snippets")
            return jsonify(result)
        except requests.exceptions.HTTPError as e:
            error_msg = f'RapidAPI request failed (HTTP {e.response.status_code}): {str(e)}'
            print(f"[ERROR] {error_msg}")
            return jsonify({
                'success': False,
                'error': error_msg,
                'method': 'rapidapi'
            }), 500
        except Exception as e:
            error_msg = f'Failed to retrieve transcript via RapidAPI: {str(e)}'
            print(f"[ERROR] {error_msg}")
            return jsonify({
                'success': False,
                'error': error_msg,
                'method': 'rapidapi'
            }), 500
        
    except Exception as e:
        error_msg = f'Unexpected error: {str(e)}'
        print(f"[ERROR] {error_msg}")
        return jsonify({
            'success': False,
            'error': error_msg
        }), 500

@app.route('/api/scrape-website', methods=['POST'])
def scrape_website():
    """
    Scrape website content using Firecrawl
    """
    try:
        data = request.get_json()
        website_url = data.get('website_url', '')
        
        if not website_url:
            return jsonify({'error': 'Website URL is required'}), 400
        
        # Use environment variable for Firecrawl API key
        firecrawl_api_key = FIRECRAWL_API_KEY
        
        if not firecrawl_api_key:
            return jsonify({
                'success': False,
                'error': 'Firecrawl API key not configured. Please set FIRECRAWL_API_KEY environment variable on Render.'
            }), 500
        
        # Initialize Firecrawl with the provided API key
        app_firecrawl = FirecrawlApp(api_key=firecrawl_api_key)
        
        # Scrape the website
        response = app_firecrawl.scrape_url(
            url=website_url,
            params={
                "formats": ["markdown"],
                "onlyMainContent": True  # Extract only main content
            }
        )
        
        # Extract content and metadata
        content = response.get('markdown', '')
        metadata = response.get('metadata', {})
        
        return jsonify({
            'success': True,
            'content': content,
            'metadata': {
                'title': metadata.get('title', ''),
                'description': metadata.get('description', ''),
                'language': metadata.get('language', ''),
                'sourceURL': metadata.get('sourceURL', website_url)
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    # Use PORT environment variable for Render deployment, default to 5000 for local
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
