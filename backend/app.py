from flask import Flask, request, jsonify
from flask_cors import CORS
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, VideoUnavailable, NoTranscriptFound
from youtube_transcript_api.proxies import GenericProxyConfig
from firecrawl import FirecrawlApp
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

@app.route('/api/transcript', methods=['POST'])
def get_transcript():
    """
    Fetch YouTube transcript for a given video URL or ID
    Uses Tor SOCKS5 proxy to bypass IP blocking on cloud platforms
    """
    try:
        data = request.get_json()
        video_url = data.get('video_url', '')
        languages = data.get('languages', ['en'])
        
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
                
                # Fetch transcript directly using the new API
                fetched_transcript = ytt_api.fetch(video_id, languages=languages)
                
                # Convert transcript to text (join snippet text)
                transcript_text = ' '.join([snippet.text for snippet in fetched_transcript])
                
                # Return transcript data
                return jsonify({
                    'success': True,
                    'video_id': fetched_transcript.video_id,
                    'transcript': transcript_text,
                    'language': fetched_transcript.language,
                    'language_code': fetched_transcript.language_code,
                    'is_generated': fetched_transcript.is_generated,
                    'snippet_count': len(fetched_transcript)
                })
                
            except (TranscriptsDisabled, VideoUnavailable, NoTranscriptFound) as e:
                # These errors won't be fixed by retrying
                return jsonify({
                    'success': False,
                    'error': f'Transcript not available: {str(e)}'
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
                        'error': f'Failed to retrieve transcript after {max_retries} attempts: {str(e)}'
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
