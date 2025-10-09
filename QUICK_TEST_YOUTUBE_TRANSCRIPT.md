# Quick Test - YouTube Transcript Fix

## 🚀 Quick Start (5 Minutes)

### Step 1: Run Cleanup (1 min)

Open Command Prompt as Administrator and run:

```cmd
cd "d:\VSCode Projects\ai-quiz-flashcard-generator\backend"
cleanup_windows.bat
```

### Step 2: Clear Browser Cache (30 sec)

Press `Ctrl+Shift+Delete` and clear cached files.

### Step 3: Start Backend (30 sec)

In a NEW Command Prompt:

```cmd
cd "d:\VSCode Projects\ai-quiz-flashcard-generator\backend"
python app.py
```

### Step 4: Test (2 min)

Open another Command Prompt and test:

```cmd
curl -X POST http://localhost:5000/api/transcript -H "Content-Type: application/json" -d "{\"video_url\": \"https://www.youtube.com/watch?v=-qmLoJ7-A80\", \"languages\": [\"en\"]}"
```

**Expected Success:**
```json
{
  "success": true,
  "video_id": "-qmLoJ7-A80",
  "transcript": "...",
  "method": "rapidapi"
}
```

**Alternative Test (via Browser):**

1. Open your frontend (index.html or React app)
2. Select "YouTube Video URL"
3. Paste: `https://www.youtube.com/watch?v=-qmLoJ7-A80`
4. Click Generate

**Success Indicators:**

✅ Backend console shows:
```
[INFO] Attempting to fetch transcript for video ID: -qmLoJ7-A80
[INFO] Using RapidAPI...
[SUCCESS] RapidAPI succeeded - 150 snippets
```

✅ Frontend shows:
```
✅ Transcript loaded successfully (via RapidAPI) - 150 snippets, en
```

## ❌ Still Getting Errors?

### Check 1: Old Processes

```cmd
tasklist | findstr python
```

If you see Python processes, kill them:
```cmd
taskkill /F /IM python.exe
```

### Check 2: Old Packages

```cmd
pip list | findstr "youtube-transcript-api"
```

Should return nothing. If found:
```cmd
pip uninstall youtube-transcript-api
```

### Check 3: Environment Variables

```cmd
echo %HTTP_PROXY%
echo %HTTPS_PROXY%
```

Both should be blank.

### Check 4: API Key

Check your `.env` file has:
```env
RAPIDAPI_KEY=your_key_here
```

## 📋 What Was Fixed

1. ✅ Added explicit proxy bypass to prevent SOCKS errors
2. ✅ Added retry logic with exponential backoff
3. ✅ Added proper timeout handling
4. ✅ Added detailed error logging
5. ✅ Added graceful fallback between APIs

## 📞 Need Help?

See `SOCKS_PROXY_SOLUTION.md` for complete troubleshooting guide.
