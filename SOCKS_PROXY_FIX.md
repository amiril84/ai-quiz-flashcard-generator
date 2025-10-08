# YouTube Transcript API - SOCKS Proxy Fix

## Issue Description

When attempting to retrieve YouTube transcripts via the Render deployment, the following error occurred:

```
❌ Error: Failed to retrieve transcript after 3 attempts: Missing dependencies for SOCKS support.
```

This error was caused by Render's cloud infrastructure being blocked by YouTube, combined with a missing Python dependency required for SOCKS proxy support.

## Root Cause

1. **YouTube blocks cloud provider IPs** - Render (and most cloud platforms like AWS, GCP, Azure) have their IP ranges blocked by YouTube
2. **Backend was configured to use Tor SOCKS proxy** - The code correctly used SOCKS5 proxy at `127.0.0.1:9050`
3. **Missing PySocks package** - The Python `requests` library requires the `PySocks` package to handle SOCKS proxy connections

## Solution Implemented

Added `PySocks==1.7.1` to `backend/requirements.txt`:

```python
Flask==3.0.0
flask-cors==4.0.0
youtube-transcript-api==1.2.2
firecrawl-py==1.5.0
gunicorn==21.2.0
PySocks==1.7.1  # ← Added for SOCKS proxy support
```

## How It Works

### Tor SOCKS Proxy Flow

```
Frontend Request → Backend API → SOCKS5 Proxy (Tor) → YouTube API → Response
```

1. **Dockerfile installs Tor** - System-level Tor installation
2. **Startup script starts Tor** - Runs before Flask app starts
3. **Flask app uses SOCKS proxy** - Routes YouTube API calls through Tor
4. **PySocks enables SOCKS support** - Python requests library can now use SOCKS proxies
5. **Tor anonymizes requests** - YouTube sees Tor exit node IP instead of Render's IP

### Current Configuration

**Backend Code (`backend/app.py`):**
```python
from youtube_transcript_api.proxies import GenericProxyConfig

proxy_config = GenericProxyConfig(
    http_url="socks5://127.0.0.1:9050",
    https_url="socks5://127.0.0.1:9050",
)

ytt_api = YouTubeTranscriptApi(proxy_config=proxy_config)
```

**Dockerfile:**
- Installs Tor: `apt-get install -y tor`
- Starts Tor: `tor &` in startup script
- Waits 15 seconds for Tor to establish connection
- Starts Flask app with gunicorn

## Deployment Steps

### Option 1: Automatic Deployment (If GitHub Connected)

1. Commit the changes:
```bash
git add backend/requirements.txt
git commit -m "Fix: Add PySocks for SOCKS proxy support"
git push origin main
```

2. Render will automatically detect the changes and redeploy

### Option 2: Manual Deployment

1. Go to your Render dashboard
2. Navigate to your web service
3. Click "Manual Deploy" → "Deploy latest commit"

### Verification

After deployment, test the YouTube transcript feature:

1. Open your deployed application
2. Try fetching a YouTube transcript
3. Monitor the Render logs for:
   - "Tor started successfully" - Confirms Tor is running
   - Successful transcript retrieval

## Expected Behavior

✅ **Before Fix:**
- Error: "Missing dependencies for SOCKS support"
- YouTube transcripts fail to load on Render

✅ **After Fix:**
- Tor routes requests through anonymous network
- YouTube transcripts load successfully
- No IP blocking errors

## Additional Notes

### Tor Startup Time
- Tor takes 10-30 seconds to establish connection
- Startup script waits 15 seconds before starting Flask app
- First request after deployment may take slightly longer

### Tor Limitations
- Slower than direct connections (due to routing through multiple nodes)
- Not suitable for high-volume production use
- Tor network is volunteer-operated

### Alternative Solutions

If Tor proves unreliable, consider:

1. **Residential Proxy Services** - Use paid proxies like Webshare
2. **VPN Solutions** - Route all traffic through VPN
3. **Proxy Rotation** - Implement multiple proxy sources

## Troubleshooting

### If transcripts still fail:

1. **Check Render logs** for Tor startup messages:
```bash
render logs --tail
```

2. **Verify Tor is running:**
- Look for "Tor started successfully" in logs
- Check for Tor process errors

3. **Test locally with Tor:**
```bash
# Install Tor
sudo apt-get install tor

# Start Tor
tor

# Run backend
python backend/app.py
```

4. **Increase Tor startup wait time** if needed:
   - Edit Dockerfile startup script
   - Change `sleep 15` to `sleep 30`

## Files Modified

- ✅ `backend/requirements.txt` - Added PySocks==1.7.1

## Files Already Configured

- ✅ `Dockerfile` - Tor installation and startup
- ✅ `backend/app.py` - SOCKS proxy configuration
- ✅ Startup script in Dockerfile - Tor initialization

## References

- [youtube-transcript-api Proxy Guide](https://github.com/jdepoix/youtube-transcript-api#working-around-ip-bans-requestblocked-or-ipblocked-exception)
- [PySocks Documentation](https://pypi.org/project/PySocks/)
- [Tor Project](https://www.torproject.org/)
