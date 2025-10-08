# 🚀 Complete Redeployment Guide - Tor Proxy Fix for YouTube Transcripts

This guide walks you through the complete process of deploying the Tor proxy solution for fixing YouTube transcript IP blocking on Render.

---

## 📋 Pre-Deployment Checklist

Before starting, verify you have:
- ✅ All code changes from the fix (Dockerfile, backend/app.py, render.yaml)
- ✅ Access to your GitHub repository
- ✅ Access to your Render dashboard
- ✅ Existing backend service running on Render

---

## Phase 1: Commit Changes to GitHub

### Step 1: Review Changed Files

Open your terminal in the project directory and check what files were modified:

```bash
git status
```

**Expected output:**
```
modified:   backend/app.py
modified:   render.yaml
modified:   RENDER_DEPLOYMENT.md
new file:   Dockerfile
new file:   YOUTUBE_PROXY_FIX.md
new file:   REDEPLOYMENT_GUIDE.md
```

### Step 2: Stage All Changes

```bash
git add .
```

**What this does:** Prepares all modified and new files for commit.

### Step 3: Commit Changes

```bash
git commit -m "Add Tor proxy solution for YouTube transcript IP blocking on Render"
```

**What this does:** Creates a commit with a descriptive message about the changes.

### Step 4: Push to GitHub

```bash
git push origin main
```

**Notes:**
- Replace `main` with your branch name if different (e.g., `master`)
- Enter GitHub credentials if prompted
- Wait for push to complete successfully

**Verification:** Go to your GitHub repository in a browser and verify the new files are there.

---

## Phase 2: Deploy with Docker (Two Options)

⚠️ **CRITICAL DISCOVERY:** Render **does NOT allow** changing the runtime type of an existing service. Once a service is created as "Python", it cannot be converted to "Docker". You must use one of these approaches:

### Understanding the Limitation

**The Problem:**
- Your existing backend service was created with "Python 3" runtime
- Render service types are **immutable** - they cannot be changed
- There's no "Runtime" dropdown in Settings to switch from Python to Docker

**The Solution:**
You have two options to deploy the Docker-based Tor proxy solution:

---

## OPTION 1: Blueprint Deployment (RECOMMENDED ✅)

This is the easiest and most maintainable approach using your existing `render.yaml` file.

### Step 5: Delete Existing Backend Service

⚠️ **Important:** You'll recreate it immediately, so don't worry!

1. Go to Render Dashboard: https://dashboard.render.com
2. Click on your existing **backend service** (e.g., "ai-quiz-backend")
3. Go to **"Settings"** tab
4. Scroll to the very bottom
5. Find **"Delete Web Service"** section
6. Click **"Delete Web Service"** button
7. Type the service name to confirm
8. Click **"Delete"**

**What happens:**
- Service is deleted
- No code is lost (it's all in GitHub)
- You'll recreate it in the next step

### Step 6: Deploy Using Blueprint

1. In Render Dashboard, click **"New +"** button (top right)
2. Select **"Blueprint"**
3. Connect your GitHub repository (if not already connected)
4. Render will automatically detect your `render.yaml` file
5. You'll see a preview showing:
   - Backend service (Docker-based) ✓
   - **Note:** Frontend is NOT included (it remains as-is)
6. Click **"Apply"** button

**What happens:**
- Render reads your `render.yaml`
- Creates a NEW backend service with Docker runtime automatically
- Frontend service is unchanged (keeps running with current configuration)
- No manual configuration needed!

**Why frontend not included?**
- Render Blueprint doesn't support static sites in yaml format
- Your existing frontend is working fine and doesn't need Docker
- You'll just update the backend URL in frontend code after deployment

### Step 7: Monitor Blueprint Deployment

1. Watch the deployment progress
2. Only the backend service will deploy
3. Backend will take 10-15 minutes (first Docker build)

**Expected status:**
```
✅ Backend: Building Docker image...
```

**Note:** Frontend remains unchanged from your existing deployment.

### Step 8: Note Your New Backend URL

⚠️ **IMPORTANT:** Your backend will have a **new URL**!

1. Once backend deployment completes, find the URL
2. It will be something like: `https://ai-quiz-backend-xxxx.onrender.com`
3. **Copy this URL** - you'll need it for Step 9

### Step 9: Update Frontend with New Backend URL

Since your backend URL changed, update the frontend:

1. Open `script.js` in your local repository
2. Find the BACKEND_URL line:
   ```javascript
   const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
       ? 'http://localhost:5000'
       : 'https://your-backend-name.onrender.com'; // ← Update this
   ```
3. Replace with your **new backend URL** from Step 8
4. Save the file

### Step 10: Commit and Push Frontend Update

```bash
git add script.js
git commit -m "Update backend URL after Blueprint deployment"
git push origin main
```

**What happens:**
- Render detects the push
- Auto-deploys frontend with new backend URL
- Frontend now points to Docker-based backend

### Step 11: Verify Deployment

1. Check backend URL: `https://your-new-backend-url.onrender.com/health`
2. Should return: `{"status": "healthy"}`
3. Check frontend URL - should load normally

**Blueprint deployment complete! Skip to Phase 3.**

---

## OPTION 2: Manual Service Creation (Alternative)

If you prefer not to use Blueprint, create a new Docker service manually.

### Step 5: Delete Existing Backend Service

Same as Option 1, Step 5 above.

### Step 6: Create New Docker Service

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:

**Basic Settings:**
- **Name:** `ai-quiz-backend` (or choose new name)
- **Region:** Oregon (or closest to your users)
- **Branch:** `main`
- **Root Directory:** `.` (repository root)
- **Environment:** **Docker** ⚠️ (NOT Python!)

**Build & Deploy:**
- **Dockerfile Path:** `./Dockerfile`
- Build Command: (leave blank - Docker handles it)
- Start Command: (leave blank - Docker handles it)

**Instance Type:**
- Select **Free** or **Starter**

4. Click **"Create Web Service"**

### Step 7: Monitor Deployment

Same as Blueprint Option - watch logs for Docker build progress.

### Step 8-11: Update Frontend

Same as Blueprint Option - update `script.js` with new backend URL, commit, and push.

---

## Phase 3: Monitor Deployment Logs

### Step 12: Watch the Build Process

1. Click on **"Logs"** tab (top navigation)
2. You'll see live deployment logs
3. Watch the deployment process unfold

**Expected Log Output:**

```
==> Cloning from https://github.com/your-username/your-repo...
==> Downloading cache...
==> Building Docker image...
Step 1/8 : FROM python:3.11-slim
Step 2/8 : RUN apt-get update && apt-get install -y tor
==> Installing system dependencies...
==> Installing Tor...
Step 3/8 : WORKDIR /app
Step 4/8 : COPY backend/requirements.txt .
Step 5/8 : RUN pip install --no-cache-dir -r requirements.txt
==> Installing Python packages...
Step 6/8 : COPY backend/ .
Step 7/8 : Creating startup script...
Step 8/8 : CMD ["/app/start.sh"]
==> Build successful
==> Starting container...
==> Tor starting...
==> Waiting for Tor to start...
[wait ~15 seconds]
==> Tor started successfully
==> Starting gunicorn
[INFO] Booting worker with pid: xxx
[INFO] Listening at: http://0.0.0.0:10000
==> Your service is live 🎉
```

**Timing Expectations:**
- **First build:** 10-15 minutes
  - Downloading base image: ~2 min
  - Installing Tor: ~3 min
  - Installing Python packages: ~2 min
  - Building image: ~3 min
  - Starting Tor: ~15 seconds
  - Starting Flask: ~10 seconds

- **Subsequent builds:** 5-10 minutes (Docker layer caching speeds this up)

### Step 13: Verify Deployment Success

Once logs show "Your service is live 🎉":

1. Note your backend URL (e.g., `https://ai-quiz-backend.onrender.com`)
2. Click on the URL or copy it
3. Add `/health` to the end: `https://ai-quiz-backend.onrender.com/health`
4. Open in browser

**Expected Response:**
```json
{"status": "healthy"}
```

**If you get an error:**
- Wait 30 seconds and try again (service might still be starting)
- Check logs for errors
- See Troubleshooting section below

---

## Phase 4: Test YouTube Transcript Functionality

### Step 14: Test YouTube Transcripts

1. Open your **frontend URL** in a browser
2. Navigate to the YouTube transcript section
3. Enter a test YouTube URL:
   - Example: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Or any valid YouTube video URL

4. Click the button to fetch transcript
5. **Monitor the request** (may take 2-5 seconds longer than before)

**Expected Results:**
- ✅ Transcript fetches successfully
- ✅ No IP blocking error
- ✅ Content displays correctly
- ⏱️ Takes 2-5 seconds longer (Tor routing overhead)

**Check Backend Logs:**
```
[INFO] Fetching transcript for video: dQw4w9WgXcQ
[INFO] Using Tor proxy: socks5://127.0.0.1:9050
[INFO] Transcript fetched successfully
```

If you see retry attempts (normal):
```
[WARNING] Attempt 1 failed, retrying...
[INFO] Attempt 2 successful
```

### Step 15: Test Edge Cases

Try these scenarios:

**Different Video Types:**
- Music videos
- Educational videos
- Videos with multiple language options
- Very long videos (>1 hour)

**Expected Failures (Should Fail Gracefully):**
- Videos without transcripts
- Private videos
- Age-restricted videos

**Error Message Should Be Clear:**
```json
{
  "success": false,
  "error": "Transcript not available: No transcripts found"
}
```

### Step 16: Verify Other Features Still Work

**Critical:** Ensure Tor proxy only affects YouTube, not other features.

Test these at **normal speed** (no slowdown):

1. **Document Upload → Quiz Generation**
   - Upload a text file
   - Generate quiz
   - ✅ Should work at normal speed

2. **Website Scraping (Firecrawl)**
   - Enter a website URL
   - Scrape content
   - ✅ Should work at normal speed (uses direct connection)

3. **Flashcard Generation**
   - Generate flashcards from content
   - ✅ Should work at normal speed

**If any of these are slow:**
- Something is wrong (they shouldn't use Tor)
- Check backend/app.py to ensure proxy is only on YouTube endpoints
- See Troubleshooting section

---

## Phase 5: Monitor and Verify

### Step 17: Check Logs for Tor Success

In Render dashboard → Logs tab:

**Look for these key messages:**
```
✅ Tor started successfully
✅ Starting gunicorn
✅ Listening at: http://0.0.0.0:10000
```

**Warning signs (investigate if you see these):**
```
❌ Warning: Tor may not have started properly
❌ Error: Failed to bind to port
❌ Connection refused to 127.0.0.1:9050
```

### Step 18: Monitor First Few Requests

Watch the logs as you make the first few YouTube transcript requests:

**Healthy behavior:**
```
[INFO] Received transcript request
[INFO] Video ID: dQw4w9WgXcQ
[INFO] Using Tor proxy
[INFO] Transcript fetched (language: en)
[INFO] Response sent
```

**If you see retries (normal occasionally):**
```
[WARNING] Attempt 1 failed: Connection timeout
[INFO] Retrying in 1 second...
[INFO] Attempt 2 successful
```

**Too many failures (investigate):**
```
[ERROR] Failed after 3 attempts
```

### Step 19: Performance Check

Make 5-10 YouTube transcript requests and note:
- **Average response time:** Should be 2-5 seconds
- **Success rate:** Should be >95%
- **Retry rate:** Occasional (1-2 out of 10) is normal
- **Failure rate:** Should be <5%

**If performance is worse than this, see Troubleshooting.**

---

## 🐛 Troubleshooting Guide

### Issue: Deployment Fails During Build

**Symptoms:**
- Build process stops with error
- "Dockerfile not found" error
- Build times out

**Solutions:**

1. **Verify Dockerfile location:**
   ```bash
   # In your local repository
   ls -la Dockerfile
   ```
   - Should be at repository root, not in backend folder

2. **Check Root Directory setting in Render:**
   - Should be `.` not `backend`
   - Settings → Build & Deploy → Root Directory

3. **Try clearing cache and rebuilding:**
   - Manual Deploy → Clear build cache & deploy

4. **Check Dockerfile syntax:**
   - No typos in Dockerfile
   - Proper line endings (not Windows CRLF)

### Issue: "Tor Started Successfully" Not in Logs

**Symptoms:**
- Deployment completes but no Tor message
- YouTube transcripts still fail
- Port 9050 connection errors

**Solutions:**

1. **Verify Docker runtime selected:**
   - Settings → Environment → Should say "Docker"
   - NOT "Python 3"

2. **Check startup script in Dockerfile:**
   - Verify the startup script waits for Tor
   - Check for `sleep 15` command

3. **Try manual redeploy:**
   - Manual Deploy → Clear build cache & deploy

4. **Check container logs:**
   - Look for Tor-related errors
   - Search logs for "tor" keyword

### Issue: YouTube Transcripts Still Fail with IP Block

**Symptoms:**
- Same IP blocking error as before
- Transcripts fail immediately
- No retry attempts

**Solutions:**

1. **Verify proxy configuration in backend/app.py:**
   ```python
   proxies = {
       "https": "socks5://127.0.0.1:9050",
       "http": "socks5://127.0.0.1:9050"
   }
   ```

2. **Check if Tor is actually running:**
   - Look in logs for "Tor started successfully"
   - If missing, see previous troubleshooting section

3. **Verify code was pushed to GitHub:**
   - Check GitHub repository for updated backend/app.py
   - Confirm changes are in the deployed commit

4. **Try different YouTube video:**
   - Some videos genuinely don't have transcripts
   - Test with known working video

5. **Wait and retry:**
   - Tor exit node might be temporarily blocked
   - Try again after 5-10 minutes

### Issue: Other Features (Firecrawl) Became Slow

**Symptoms:**
- Website scraping takes longer
- Document upload slower
- Everything routing through Tor (BAD!)

**Solutions:**

1. **Verify proxy is ONLY on YouTube endpoints:**
   - Check backend/app.py
   - Proxy should ONLY be in:
     - `/api/transcript` endpoint
     - `/api/list-transcripts` endpoint
   - NOT in:
     - `/api/scrape-website` endpoint
     - Other endpoints

2. **Check for environment variable proxies:**
   - Should NOT have `HTTP_PROXY` or `HTTPS_PROXY` env vars set
   - These would affect ALL requests

3. **Redeploy if code is wrong:**
   - Fix backend/app.py
   - Commit and push
   - Render will auto-deploy

### Issue: Build Takes Too Long (>20 minutes)

**Symptoms:**
- Build running for >20 minutes
- Timeout errors
- Stuck at package installation

**Solutions:**

1. **First time is normal:**
   - 10-15 minutes is expected for first Docker build
   - Subsequent builds are faster (5-10 min)

2. **Check Render status:**
   - https://status.render.com
   - Might be platform-wide slowdown

3. **Try during off-peak hours:**
   - Early morning or late night (your timezone)
   - Less load on Render infrastructure

4. **Upgrade plan if on free tier:**
   - Paid plans have faster build resources

### Issue: Service Keeps Failing Health Check

**Symptoms:**
- Service shows "Unhealthy"
- `/health` endpoint returns error
- Service restarts repeatedly

**Solutions:**

1. **Check health endpoint response:**
   ```bash
   curl https://your-backend.onrender.com/health
   ```
   - Should return: `{"status": "healthy"}`

2. **Verify Flask is listening on correct port:**
   - Check logs for: "Listening at: http://0.0.0.0:10000"
   - $PORT environment variable should be set

3. **Check Tor startup time:**
   - Tor takes ~15 seconds to start
   - Health check might be too early
   - Solution: Wait 30 seconds after deployment

4. **Increase health check timeout:**
   - Settings → Health Check
   - Increase timeout to 60 seconds

### Issue: Free Tier Service Goes to Sleep

**Symptoms:**
- First request after inactivity takes 30-60 seconds
- Service shows "Sleeping" status
- Works fine after waking up

**Solutions:**

1. **Expected behavior on free tier:**
   - Services sleep after 15 minutes of inactivity
   - First request wakes service (30-60 seconds)
   - Subsequent requests are normal speed

2. **First request includes Tor startup:**
   - Service wake: ~15 seconds
   - Tor startup: ~15 seconds
   - Total: ~30 seconds

3. **If unacceptable:**
   - Upgrade to paid plan ($7/month Starter)
   - Paid plans don't sleep

4. **Workaround for free tier:**
   - Use uptime monitoring service (e.g., UptimeRobot)
   - Pings your service every 5 minutes
   - Keeps it awake during active hours

---

## ✅ Success Criteria

Your deployment is successful when ALL of these are true:

### Deployment Status
- ✅ Render shows service status as "Live" (green)
- ✅ No errors in deployment logs
- ✅ Build completed in 10-15 minutes (first time)

### Tor Functionality
- ✅ Logs show "Tor started successfully"
- ✅ No errors related to Tor or port 9050
- ✅ Tor process running in container

### Health Check
- ✅ `/health` endpoint returns `{"status": "healthy"}`
- ✅ Service stays healthy (doesn't restart)
- ✅ Response time <1 second

### YouTube Transcripts
- ✅ YouTube transcripts fetch successfully
- ✅ No IP blocking errors
- ✅ Response time: 2-5 seconds (acceptable)
- ✅ Success rate >95%
- ✅ Retry logic works (visible in logs when needed)

### Other Features
- ✅ Document upload works at normal speed
- ✅ Firecrawl scraping works at normal speed
- ✅ Quiz generation works at normal speed
- ✅ No unexpected slowdowns

### Configuration
- ✅ Runtime set to "Docker" (not Python)
- ✅ Root directory set to `.`
- ✅ Dockerfile path set to `./Dockerfile`
- ✅ Auto-deploy enabled
- ✅ No unnecessary environment variables

---

## 📊 Post-Deployment Monitoring

### First 24 Hours

Monitor these metrics:

**Success Rate:**
- Track YouTube transcript requests
- Should be >95% successful
- <5% requiring retries
- <1% complete failures

**Performance:**
- YouTube transcripts: 2-5 seconds
- Other features: Normal speed (no change)
- Health check: <1 second

**Errors:**
- Watch for Tor-related errors
- Monitor retry attempts
- Check for unexpected failures

### Ongoing Monitoring

**Weekly:**
- Check service status
- Review error logs
- Verify YouTube transcripts still work

**Monthly:**
- Review Render usage/costs
- Check for any deprecated packages
- Update dependencies if needed

---

## 🔄 Future Deployments

Good news! After this initial setup, future deployments are automatic:

### For Code Changes:

```bash
# Make your changes
git add .
git commit -m "Your commit message"
git push origin main
```

**What happens:**
1. Render detects push
2. Auto-deploys using Docker configuration
3. Builds in 5-10 minutes (faster due to caching)
4. Tor starts automatically
5. Service goes live

**No manual configuration needed!**

### For Emergency Rollback:

If a deployment breaks something:

1. Go to Render dashboard
2. Deployments tab
3. Find previous working deployment
4. Click "Redeploy" on that version
5. Service rolls back to working state

---

## 💡 Tips and Best Practices

### Performance Optimization

1. **Monitor retry rates:**
   - If >10% of requests retry, Tor might be having issues
   - Consider upgrading to paid proxy if critical

2. **Cache common requests:**
   - If users request same videos repeatedly
   - Implement caching in future update

3. **Use paid tier for production:**
   - No sleep time
   - Faster builds
   - Better reliability

### Cost Management

**Free Tier:**
- 750 hours/month (enough for 1 service always-on)
- Sleeps after 15 min inactivity
- Slower builds
- **Cost: $0/month**

**Starter Tier ($7/month):**
- Always-on
- Faster builds
- More resources
- **Cost: $7/month per service**

**Recommendation:**
- Start with free tier
- Upgrade if you need always-on or faster performance

### Security

1. **Never commit API keys:**
   - OpenRouter API key: User enters in frontend
   - Firecrawl API key: User enters in frontend
   - Keep it this way

2. **Monitor logs:**
   - Watch for suspicious activity
   - Check for unusual traffic patterns

3. **Keep dependencies updated:**
   - Run `pip list --outdated` monthly
   - Update packages with security patches

---

## 📚 Additional Resources

- **Render Documentation:** https://render.com/docs
- **Render Docker Guide:** https://render.com/docs/docker
- **Tor Project:** https://www.torproject.org
- **YouTube Transcript API:** https://github.com/jdepoix/youtube-transcript-api
- **Your Documentation:**
  - `YOUTUBE_PROXY_FIX.md` - Technical details of the fix
  - `RENDER_DEPLOYMENT.md` - General Render deployment guide

---

## 🆘 Getting Help

If you're still stuck after troubleshooting:

1. **Check Render Status:**
   - https://status.render.com
   - Verify no platform-wide issues

2. **Review Logs Thoroughly:**
   - Search for error keywords
   - Check full stack traces
   - Note exact error messages

3. **Render Community:**
   - https://community.render.com
   - Search for similar issues
   - Post your problem with logs

4. **GitHub Issues:**
   - YouTube Transcript API issues
   - Check if others have same problem

---

**Congratulations! You've successfully deployed the Tor proxy fix for YouTube transcripts! 🎉**

Your app is now fully functional on Render with all features working as expected.
