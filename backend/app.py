from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, VideoUnavailable, NoTranscriptFound
from youtube_transcript_api.proxies import GenericProxyConfig
from firecrawl import FirecrawlApp
import requests
import re
import os
import time

app = Flask(__name__)

# Configure CORS to allow requests from your frontend
# In production, replace '*' with your actual frontend domain
CORS(app, resources={r"/api/*": {"origins": "*"}})

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

def fetch_transcript_via_supadata(video_id, api_key, languages=['en']):
    """
    Fetch transcript using Supadata.ai API
    """
    url = f"https://api.supadata.ai/v1/youtube/transcript"
    
    params = {
        'videoId': video_id
    }
    
    headers = {
        'x-api-key': api_key
    }
    
    response = requests.get(url, params=params, headers=headers)
    response.raise_for_status()
    
    data = response.json()
    
    # Transform Supadata response to match our expected format
    if 'transcript' in data:
        transcript_items = data['transcript']
        transcript_text = ' '.join([item.get('text', '') for item in transcript_items])
        
        return {
            'success': True,
            'video_id': video_id,
            'transcript': transcript_text,
            'language': data.get('language', 'en'),
            'language_code': data.get('language', 'en'),
            'is_generated': data.get('isGenerated', False),
            'snippet_count': len(transcript_items),
            'method': 'supadata'
        }
    else:
        raise Exception("Invalid response from Supadata API")

def fetch_transcript_via_tor(video_id, languages=['en']):
    """
    Fetch transcript using Tor SOCKS5 proxy (fallback method)
    """
    # Configure Tor SOCKS5 proxy using GenericProxyConfig
    proxy_config = GenericProxyConfig(
        http_url="socks5://127.0.0.1:9050",
        https_url="socks5://127.0.0.1:9050",
    )
    
    # Create API instance with proxy configuration
    ytt_api = YouTubeTranscriptApi(proxy_config=proxy_config)
    
    # Fetch transcript
    fetched_transcript = ytt_api.fetch(video_id, languages=languages)
    
    # Convert transcript to text
    transcript_text = ' '.join([snippet.text for snippet in fetched_transcript])
    
    return {
        'success': True,
        'video_id': fetched_transcript.video_id,
        'transcript': transcript_text,
        'language': fetched_transcript.language,
        'language_code': fetched_transcript.language_code,
        'is_generated': fetched_transcript.is_generated,
        'snippet_count': len(fetched_transcript),
        'method': 'tor_proxy'
    }

@app.route('/api/transcript', methods=['POST'])
def get_transcript():
    """
    Fetch YouTube transcript for a given video URL or ID
    Uses Supadata.ai API (preferred) or falls back to Tor SOCKS5 proxy
    """
    try:
        data = request.get_json()
        video_url = data.get('video_url', '')
        languages = data.get('languages', ['en'])
        supadata_api_key = data.get('supadata_api_key', '')
        
        if not video_url:
            return jsonify({'error': 'Video URL is required'}), 400
        
        # Extract video ID from URL
        video_id = extract_video_id(video_url)
        
        # Try Supadata API first if API key is provided
        if supadata_api_key:
            try:
                result = fetch_transcript_via_supadata(video_id, supadata_api_key, languages)
                return jsonify(result)
            except requests.exceptions.HTTPError as e:
                # Supadata API failed, fall back to Tor proxy
                print(f"Supadata API failed: {str(e)}, falling back to Tor proxy")
            except Exception as e:
                # Supadata API failed, fall back to Tor proxy
                print(f"Supadata API error: {str(e)}, falling back to Tor proxy")
        
        # Use Tor proxy (either no API key provided or Supadata failed)
        # Retry logic with exponential backoff
        max_retries = 3
        for attempt in range(max_retries):
            try:
                result = fetch_transcript_via_tor(video_id, languages)
                return jsonify(result)
                
            except (TranscriptsDisabled, VideoUnavailable, NoTranscriptFound) as e:
                # These errors won't be fixed by retrying
                return jsonify({
                    'success': False,
                    'error': f'Transcript not available: {str(e)}',
                    'method': 'tor_proxy'
                }), 404
                
            except Exception as e:
                # For other errors, retry with exponential backoff
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt  # 1s, 2s, 4s
                    time.sleep(wait_time)
                    continue
                else:
                    # Final attempt failed
                    return jsonify({
                        'success': False,
                        'error': f'Failed to retrieve transcript after {max_retries} attempts: {str(e)}',
                        'method': 'tor_proxy'
                    }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/list-transcripts', methods=['POST'])
def list_transcripts():
    """
    List all available transcripts for a video
    Uses Tor SOCKS5 proxy to bypass IP blocking on cloud platforms
    """
    try:
        data = request.get_json()
        video_url = data.get('video_url', '')
        
        if not video_url:
            return jsonify({'error': 'Video URL is required'}), 400
        
        # Extract video ID from URL
        video_id = extract_video_id(video_url)
        
        # Configure Tor SOCKS5 proxy using GenericProxyConfig
        proxy_config = GenericProxyConfig(
            http_url="socks5://127.0.0.1:9050",
            https_url="socks5://127.0.0.1:9050",
        )
        
        # Retry logic with exponential backoff
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Create API instance with proxy configuration
                ytt_api = YouTubeTranscriptApi(proxy_config=proxy_config)
                
                # List available transcripts using the new API
                transcript_list = ytt_api.list(video_id)
                
                # Format transcript information
                transcripts = []
                for transcript in transcript_list:
                    transcripts.append({
                        'language': transcript.language,
                        'language_code': transcript.language_code,
                        'is_generated': transcript.is_generated,
                        'is_translatable': transcript.is_translatable
                    })
                
                return jsonify({
                    'success': True,
                    'video_id': video_id,
                    'transcripts': transcripts
                })
                
            except (TranscriptsDisabled, VideoUnavailable, NoTranscriptFound) as e:
                # These errors won't be fixed by retrying
                return jsonify({
                    'success': False,
                    'error': f'Transcripts not available: {str(e)}'
                }), 404
                
            except Exception as e:
                # For other errors, retry with exponential backoff
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt
                    time.sleep(wait_time)
                    continue
                else:
                    return jsonify({
                        'success': False,
                        'error': f'Failed to list transcripts after {max_retries} attempts: {str(e)}'
                    }), 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/scrape-website', methods=['POST'])
def scrape_website():
    """
    Scrape website content using Firecrawl
    """
    try:
        data = request.get_json()
        website_url = data.get('website_url', '')
        firecrawl_api_key = data.get('firecrawl_api_key', '')
        
        if not website_url:
            return jsonify({'error': 'Website URL is required'}), 400
        
        if not firecrawl_api_key:
            return jsonify({'error': 'Firecrawl API key is required'}), 400
        
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
