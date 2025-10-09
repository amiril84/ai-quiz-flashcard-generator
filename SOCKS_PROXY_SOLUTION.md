# SOCKS Proxy Error - Complete Solution Guide

## 🔍 Problem Summary

**Error Message:**
```
SOCKSHTTPSConnectionPool(host='www.youtube.com', port=443): Max retries exceeded
WinError 10061: No connection could be made because the target machine actively refused it
```

**Root Cause:**
- Old `youtube-transcript-api` library was trying to directly scrape YouTube
- System or old Python process attempting to route requests through a non-existent SOCKS proxy
- The new RapidAPI/Supadata implementation doesn't use direct YouTube scraping

## ✅ Solution Implemented

### 1. Backend Improvements (backend/app.py)

Added the following fixes:

✅ **Explicit Proxy Bypass**
```python
proxies = {
    'http': None,
    'https': None
}
```
This tells the `requests` library to NEVER use system proxies, even if configured.

✅ **Session with Retry Logic**
- Automatic retries with exponential backoff
- Connection pooling for better performance
- Proper timeout handling (5s connect, 30s read)

✅ **Better Error Handling**
- Specific error messages for proxy, timeout, and connection errors
- Detailed logging to help debug issues
- Uses RapidAPI as the primary transcript service

✅ **Improved Request Configuration**
```python
session.get(
    url,
    proxies={'http': None, 'https': None},  # Bypass proxies
    timeout=(5, 30),  # Connect and read timeouts
    ...
)
```

## 🧹 Cleanup Steps (Windows)

### Option 1: Automated Cleanup (Recommended)

1. Open Command Prompt as Administrator
2. Navigate to the backend folder:
   ```cmd
   cd "d:\VSCode Projects\ai-quiz-flashcard-generator\backend"
   ```
3. Run the cleanup script:
   ```cmd
   cleanup_windows.bat
   ```

This will:
- Stop all Python processes
- Check for old packages
- Uninstall `youtube-transcript-api` and `PySocks`
- Reinstall fresh dependencies

### Option 2: Manual Cleanup

1. **Stop all Python processes:**
   - Open Task Manager (Ctrl+Shift+Esc)
   - End all `python.exe` and `pythonw.exe` processes
   
   OR use Command Prompt:
   ```cmd
   taskkill /F /IM python.exe
   taskkill /F /IM pythonw.exe
   ```

2. **Check for old packages:**
   ```cmd
   pip list | findstr "youtube-transcript-api"
   pip list | findstr "PySocks"
   ```

3. **Uninstall if found:**
   ```cmd
   pip uninstall youtube-transcript-api
   pip uninstall PySocks
   ```

4. **Reinstall dependencies:**
   ```cmd
   cd backend
   pip install -r requirements.txt --upgrade
   ```

## 🧪 Testing Procedure

### Step 1: Clear Browser Cache

**Chrome/Edge:**
1. Press `Ctrl+Shift+Delete`
2. Select "Cached images and files"
3. Time range: "All time"
4. Click "Clear data"

**Firefox:**
1. Press `Ctrl+Shift+Delete`
2. Select "Cache"
3. Click "Clear Now"

### Step 2: Verify Environment Variables

Check your `.env` file has the required keys:

```env
# OpenRouter API (Required)
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL_NAME=google/gemini-2.0-flash-exp:free

# YouTube Transcript API (Required)
RAPIDAPI_KEY=your_rapidapi_key

# Firecrawl API (For website scraping)
FIRECRAWL_API_KEY=your_firecrawl_api_key
```

### Step 3: Start Backend Fresh

1. Open a NEW Command Prompt window
2. Navigate to backend:
   ```cmd
   cd "d:\VSCode Projects\ai-quiz-flashcard-generator\backend"
   ```
3. Start the server:
   ```cmd
   python app.py
   ```

Expected output:
```
 * Running on http://0.0.0.0:5000
Press CTRL+C to quit
```

### Step 4: Test YouTube Transcript

**Test Video URL:** `https://www.youtube.com/watch?v=-qmLoJ7-A80`

#### Using Browser (Frontend):

1. Open `http://localhost:5000` or your frontend
2. Select "YouTube Video URL" from dropdown
3. Paste the test URL
4. Click "Generate Quiz" or "Generate Flash Cards"

**Expected Console Output (Backend):**
```
[INFO] Attempting to fetch transcript for video ID: -qmLoJ7-A80
[INFO] Using RapidAPI...
[SUCCESS] RapidAPI succeeded - 150 snippets
```

#### Using curl (Command Line Test):

```bash
curl -X POST http://localhost:5000/api/transcript \
  -H "Content-Type: application/json" \
  -d "{\"video_url\": \"https://www.youtube.com/watch?v=-qmLoJ7-A80\", \"languages\": [\"en\"]}"
```

**Expected Response:**
```json
{
  "success": true,
  "video_id": "-qmLoJ7-A80",
  "transcript": "...",
  "method": "rapidapi",
  "snippet_count": 150
}
```

### Step 5: Monitor for Errors

**❌ If you still see SOCKS errors:**

1. Check that you ran the cleanup script
2. Verify no old Python processes are running (Task Manager)
3. Check your system proxy settings again:
   - Windows Settings → Network & Internet → Proxy
   - Should be "Automatically detect settings" with no manual proxy

4. Check environment variables:
   ```cmd
   echo %HTTP_PROXY%
   echo %HTTPS_PROXY%
   ```
   Both should show nothing or "ECHO is off"

5. Check pip installed packages:
   ```cmd
   pip list | findstr "youtube-transcript-api"
   ```
   Should return nothing

## 🚨 Troubleshooting

### Error: "No API keys configured"

**Solution:** Make sure your `.env` file has `RAPIDAPI_KEY` set.

### Error: "Request timeout"

**Solution:** Check your internet connection. The timeout is set to 30 seconds for reading.

### Error: "Proxy error (check system proxy settings)"

**Solution:** 
1. Windows Settings → Network & Internet → Proxy
2. Turn off all manual proxy configurations
3. Run cleanup script again

### Error: Still getting SOCKS errors

**Solution:**
1. Restart your computer (to clear any stubborn processes)
2. Run cleanup script again
3. Check for VPN or security software that might inject proxies
4. Check if Tor Browser is running (uses SOCKS proxy on port 9150)

## 📊 Success Indicators

✅ **Backend logs show:**
```
[INFO] Attempting to fetch transcript for video ID: ...
[INFO] Using RapidAPI...
[SUCCESS] RapidAPI succeeded - 150 snippets
```

✅ **Frontend shows:**
```
✅ Transcript loaded successfully (via RapidAPI) - 150 snippets, en
```

✅ **No errors about:**
- SOCKS
- Proxy
- Connection refused
- WinError 10061

## 🎯 Next Steps After Success

1. **Deploy to Render:**
   - The updated code with proxy bypass is production-ready
   - Set environment variables on Render
   - Deploy and test

2. **Monitor Performance:**
   - Check backend logs for which API is being used
   - Monitor API quota usage
   - Set up error alerting if needed

3. **Clean Up Old Render Service:**
   - Suspend or delete the old deployment
   - Keep only the new updated service

## 📝 Technical Details

### Why This Works

1. **Proxy Bypass:** `proxies={'http': None, 'https': None}` explicitly tells requests library to ignore all proxy configurations
2. **Session Reuse:** Using a session with connection pooling prevents connection issues
3. **Retry Logic:** Automatic retries handle transient network issues
4. **Proper Timeouts:** Prevents hanging requests
5. **Better Logging:** Helps identify exactly where issues occur

### What Changed

**Before:**
- Used `youtube-transcript-api` which directly scraped YouTube
- No proxy handling
- Basic error handling
- No retry mechanism

**After:**
- Uses RapidAPI (no direct scraping)
- Explicit proxy bypass
- Comprehensive error handling
- Retry logic with exponential backoff
- Better timeout handling

## 🔐 Security Notes

- Proxy bypass only affects this application, not system-wide
- All API calls still use HTTPS (encrypted)
- No credentials are logged
- Environment variables keep API keys secure

## � Support

If you continue to experience issues:
1. Share the exact error message from backend console
2. Share output from: `pip list`
3. Share output from: `tasklist | findstr python`
4. Confirm you've run the cleanup script
5. Confirm browser cache was cleared
