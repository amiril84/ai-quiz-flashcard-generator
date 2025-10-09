# RapidAPI YouTube Transcript Migration Guide

## Overview
This document outlines the migration from the YouTube Transcript API with Tor SOCKS5 proxy to RapidAPI's YouTube Transcript service.

## Problem Statement
The current implementation uses two methods for fetching YouTube transcripts:
1. **Supadata API** (Primary)
2. **YouTube Transcript API with Tor SOCKS5 proxy** (Fallback)

### Issues with Current Implementation
- Tor SOCKS5 proxy connection failures on cloud platforms (Render)
- Error: `SOCKSHTTPSConnectionPool: Max retries exceeded`
- Connection refused errors: `[WinError 10061] No connection could be made because the target machine actively refused it`
- Requires running Tor service locally, which is problematic for cloud deployments

## Solution: RapidAPI YouTube Transcript3

### API Details
- **Service**: YouTube Transcript3 by RapidAPI
- **Endpoint**: `https://youtube-transcript3.p.rapidapi.com/api/transcript`
- **Free Tier**: 100 requests per month
- **Reliability**: 100% uptime, multiple fallback support
- **Documentation**: https://rapidapi.com/ytjar/api/youtube-transcript3

### API Key
```
x-rapidapi-key: 5c4d84b79amsh11308407580c15dp1c1594jsnc66a22215dca
x-rapidapi-host: youtube-transcript3.p.rapidapi.com
```

## Migration Plan

### 1. Backend Changes (`backend/app.py`)

#### New Function: `fetch_transcript_via_rapidapi()`
```python
def fetch_transcript_via_rapidapi(video_id, api_key, languages=['en']):
    """
    Fetch transcript using RapidAPI YouTube Transcript3 service
    """
    url = "https://youtube-transcript3.p.rapidapi.com/api/transcript"
    
    querystring = {"videoId": video_id}
    
    # Add language parameter if specified
    if languages and languages[0] != 'en':
        querystring["lang"] = languages[0]
    
    headers = {
        "x-rapidapi-key": api_key,
        "x-rapidapi-host": "youtube-transcript3.p.rapidapi.com"
    }
    
    response = requests.get(url, headers=headers, params=querystring)
    response.raise_for_status()
    
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
```

#### Updated `/api/transcript` Endpoint Logic
1. Try **Supadata API** first (if key available)
2. Fall back to **RapidAPI** (if Supadata fails)
3. Return error if both methods fail

#### Removed Components
- `fetch_transcript_via_tor()` function (no longer needed)
- Tor SOCKS5 proxy configuration
- Retry logic for Tor proxy (replaced with simpler RapidAPI calls)

### 2. Dependencies Update (`backend/requirements.txt`)

#### Remove:
```
youtube-transcript-api==1.2.2
PySocks==1.7.1
```

#### Keep:
```
Flask==3.0.0
flask-cors==4.0.0
firecrawl-py==1.5.0
gunicorn==21.2.0
requests==2.31.0
python-dotenv==1.0.0
```

### 3. Environment Variables (`.env`)

#### Add New Variable:
```
RAPIDAPI_KEY=5c...
```

#### Load in `app.py`:
```python
RAPIDAPI_KEY = os.environ.get('RAPIDAPI_KEY', '')
```

### 4. `/api/list-transcripts` Endpoint

This endpoint currently uses the YouTube Transcript API with Tor proxy. Options:
1. **Remove it** - if not actively used by frontend
2. **Adapt it** - RapidAPI doesn't have a direct equivalent for listing transcripts
3. **Keep with warning** - mark as deprecated

**Recommendation**: Remove or deprecate, as RapidAPI focuses on fetching transcripts rather than listing available languages.

## Response Format Comparison

### RapidAPI Response:
```json
{
  "success": true,
  "transcript": [
    {
      "text": "I can almost hear the gears turning in",
      "duration": 3.24,
      "offset": 0.04,
      "lang": "en"
    }
  ]
}
```

### Our Transformed Response:
```json
{
  "success": true,
  "video_id": "ZacjOVVgoLY",
  "transcript": "I can almost hear the gears turning in...",
  "language": "en",
  "language_code": "en",
  "is_generated": false,
  "snippet_count": 150,
  "method": "rapidapi"
}
```

## Benefits of RapidAPI Migration

1. **Reliability**: No proxy connection issues
2. **Simplicity**: Direct API calls, no proxy configuration needed
3. **Cloud-Friendly**: Works seamlessly on cloud platforms (Render, AWS, etc.)
4. **Uptime**: 100% uptime guarantee with fallback support
5. **Maintenance**: Less complexity, easier to debug
6. **Free Tier**: 100 requests/month should be sufficient for development/testing

## Testing Checklist

After migration, test the following:

- [ ] Fetch transcript for a standard YouTube video
- [ ] Test with video ID only
- [ ] Test with full YouTube URL (various formats)
- [ ] Verify Supadata API still works as primary method
- [ ] Confirm RapidAPI works as fallback when Supadata fails
- [ ] Test error handling for invalid video IDs
- [ ] Test error handling for videos without transcripts
- [ ] Verify environment variable is loaded correctly
- [ ] Test in production environment (Render)

## Deployment Steps

1. **Update Code**: Deploy changes to `backend/app.py`
2. **Update Dependencies**: Deploy updated `requirements.txt`
3. **Set Environment Variable**: Add `RAPIDAPI_KEY` on Render
4. **Restart Service**: Restart the backend service
5. **Test**: Verify transcript fetching works correctly
6. **Monitor**: Check logs for any errors

## Rollback Plan

If issues arise after migration:

1. Revert `backend/app.py` to previous version
2. Restore `requirements.txt` dependencies
3. Remove `RAPIDAPI_KEY` environment variable
4. Restart service

**Note**: The old implementation will still have Tor proxy issues, so a proper fix would be needed.

## Cost Considerations

- **Free Tier**: 100 requests/month
- **If exceeded**: Monitor usage and upgrade plan if needed
- **Alternative**: Keep multiple API providers (Supadata, RapidAPI) for redundancy

## Maintenance Notes

- RapidAPI key is hardcoded in environment variable
- Consider rotating keys periodically for security
- Monitor API usage through RapidAPI dashboard
- Keep an eye on rate limits (100/month on free tier)

## Support

For issues with:
- **RapidAPI**: Contact via RapidAPI platform
- **Supadata**: Check Supadata documentation
- **Application**: Check application logs and error messages

---

**Migration Date**: January 2025  
**Status**: In Progress  
**Updated By**: System Administrator
