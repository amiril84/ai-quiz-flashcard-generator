# 🚀 Deploying to Render - Complete Guide

This guide provides step-by-step instructions for deploying your AI Quiz & Flashcard Generator to Render.com.

## 📋 Prerequisites

Before deploying, ensure you have:
- A GitHub account
- A Render.com account ([Sign up here](https://render.com))
- Your repository pushed to GitHub
- OpenRouter API key
- Firecrawl API key (optional, for website scraping)

## 🔧 Pre-Deployment Checklist

✅ All changes from this guide have been applied:
- ✅ `backend/requirements.txt` includes Gunicorn
- ✅ `backend/app.py` configured for production with Tor proxy support
- ✅ `script.js` updated with environment-aware backend URL
- ✅ `render.yaml` configuration file created
- ✅ `Dockerfile` created for Docker-based deployment with Tor

## 🎯 Deployment Strategy

This app uses a **two-service deployment**:
1. **Backend** - Python Flask API with Tor proxy (Docker Web Service)
2. **Frontend** - Static HTML/CSS/JS (Static Site)

### 🔐 YouTube Transcript Solution: Tor Proxy

**Issue**: YouTube blocks IP addresses from cloud providers (AWS, GCP, Azure, Render, etc.), causing transcript fetching to fail with IP blocking errors.

**Solution**: This deployment uses **Tor SOCKS5 proxy** to bypass YouTube's IP restrictions:
- ✅ **100% Free** - No additional costs
- ✅ **Safe** - No YouTube account required or risk of banning
- ✅ **Isolated** - Only YouTube requests use the proxy; Firecrawl and other features run at normal speed
- ✅ **Reliable** - Includes retry logic with exponential backoff

**How it works**:
1. Dockerfile installs and runs Tor service
2. Backend routes YouTube API requests through Tor's SOCKS5 proxy (port 9050)
3. Tor rotates IP addresses through its network, bypassing cloud provider IP blocks
4. All other requests (Firecrawl, health checks) use direct connections

**Trade-offs**:
- YouTube transcripts may take 2-5 seconds longer (acceptable for personal projects)
- First Tor connection on app startup takes ~15 seconds

### 📦 Monorepo Structure

Your repository is organized as a **monorepo** with both frontend and backend in the same GitHub repository:
- **Frontend files** (index.html, script.js, styles.css) are at the **root level**
- **Backend files** are in the `/backend` subdirectory

Render fully supports monorepo deployments using the **Root Directory** setting:
- For **Backend**: Set root directory to `backend` - Render treats this as the app root
- For **Frontend**: Set root directory to `.` (root) - Frontend files are already at repository root
- **Smart Deploys**: Backend deploys only trigger when `/backend` files change, frontend deploys only trigger when root-level files change

This setup prevents unnecessary rebuilds and saves resources.

## 📝 Step-by-Step Deployment

### Step 1: Push Code to GitHub

1. Ensure all changes are committed:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

### Step 2: Deploy Backend (Flask API with Tor Proxy)

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

   **Basic Settings:**
   - **Name**: `ai-quiz-backend` (or your preferred name)
   - **Region**: Choose closest to your users (e.g., Oregon)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `.` ⚠️ **IMPORTANT: Leave as root (`.`) for Docker deployment**
   - **Runtime**: `Docker`

   **Build & Deploy Settings:**
   - **Dockerfile Path**: `./Dockerfile`
   - Render will automatically detect and use the Dockerfile

   **Advanced Settings (Click "Advanced"):**
   - **Environment Variables**:
     - `PORT` = `10000` (automatically set by Dockerfile)
     - No other environment variables needed

   **Instance Type:**
   - Select **Free** (for testing) or **Starter** (for production)
   - **Note**: First deployment may take 10-15 minutes to build Docker image and start Tor

5. Click **"Create Web Service"**
6. Wait for deployment to complete (10-15 minutes first time, faster on subsequent deploys)
7. **Monitor the logs** to see:
   - Docker image building
   - Tor starting up
   - Flask application launching
8. **Copy your backend URL** (e.g., `https://ai-quiz-backend.onrender.com`)

**Expected Startup Logs:**
```
==> Building...
==> Tor starting...
==> Waiting for Tor to start...
==> Tor started successfully
==> Starting gunicorn
```

### Step 3: Update Frontend with Backend URL

1. Open `script.js` in your local repository
2. Find this line:
   ```javascript
   const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
       ? 'http://localhost:5000'
       : 'https://your-backend-name.onrender.com'; // Replace with your actual Render backend URL
   ```
3. Replace `'https://your-backend-name.onrender.com'` with your **actual backend URL** from Step 2
4. Save the file
5. Commit and push:
   ```bash
   git add script.js
   git commit -m "Update backend URL for production"
   git push origin main
   ```

### Step 4: Deploy Frontend (Static Site)

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect the same GitHub repository
3. Configure the service:

   **Basic Settings:**
   - **Name**: `ai-quiz-frontend` (or your preferred name)
   - **Branch**: `main`
   - **Root Directory**: `.` (or leave blank - frontend files are at repository root)

   **Build Settings:**
   - **Build Command**: `echo "No build needed"`
   - **Publish Directory**: `.` (current directory)

4. Click **"Create Static Site"**
5. Wait for deployment (2-5 minutes)
6. **Copy your frontend URL** (e.g., `https://ai-quiz-frontend.onrender.com`)

### Step 5: Test Your Deployment

1. Visit your frontend URL
2. Enter your OpenRouter API key and model name
3. Test all features:
   - ✅ Document upload and quiz generation
   - ✅ YouTube video transcript fetching
   - ✅ Website scraping (with Firecrawl API key)
   - ✅ Flashcard generation

## 🔒 Environment Variables

### Backend Service Environment Variables

Set these in your backend web service settings:

| Variable | Description | Required |
|----------|-------------|----------|
| `PYTHON_VERSION` | Python version (e.g., `3.11.0`) | Yes |
| `PORT` | Auto-generated by Render | Auto |

**Note**: API keys (OpenRouter, Firecrawl) are entered by users in the frontend, not stored in backend.

## 🌐 Custom Domain (Optional)

### For Frontend:
1. Go to your static site settings
2. Click **"Custom Domain"**
3. Add your domain and follow DNS instructions

### For Backend:
1. Go to your web service settings
2. Click **"Custom Domain"**
3. Add your API subdomain (e.g., `api.yourdomain.com`)
4. Update `script.js` with your custom domain

## 🐛 Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- **Solution**: Check build logs for errors
- Verify Dockerfile is in repository root
- Ensure Docker build completes successfully
- Wait for Tor to start (takes ~15 seconds)

**Problem**: Health check failing
- **Solution**: Verify `/health` endpoint works
- Check if Gunicorn is binding to correct port
- Ensure Tor service started successfully

**Problem**: YouTube transcripts still failing
- **Solution**: 
  - Check logs to confirm Tor is running
  - Verify proxy configuration in `backend/app.py`
  - Test if Tor service is accessible on port 9050
  - Try redeploying the service
  - Check that you're using the Docker deployment (not Python environment)

**Problem**: CORS errors in browser
- **Solution**: Update CORS settings in `backend/app.py`
- Replace `"origins": "*"` with your frontend domain:
  ```python
  CORS(app, resources={r"/api/*": {"origins": "https://your-frontend.onrender.com"}})
  ```

### Frontend Issues

**Problem**: Can't connect to backend
- **Solution**: Verify backend URL in `script.js` is correct
- Check browser console for errors
- Ensure backend service is running

**Problem**: YouTube transcripts not working
- **Solution**: 
  - Confirm backend is using Docker deployment (check logs for "Tor started successfully")
  - YouTube requests may take 2-5 seconds longer due to Tor routing
  - Check for retry attempts in logs (up to 3 retries)
  - If still failing, Tor exit node may be temporarily blocked - wait a few minutes and try again

**Problem**: Website scraping (Firecrawl) not working
- **Solution**: 
  - Verify Firecrawl API key is correct
  - Check backend logs for specific errors
  - Note: Firecrawl doesn't use Tor proxy, runs at normal speed

### Deployment Issues

**Problem**: Free tier limitations
- **Solution**: 
  - Free services sleep after 15 min of inactivity
  - First request may take 30-60 seconds to wake up
  - Upgrade to paid plan for always-on service

**Problem**: Build fails
- **Solution**: Check build logs
- Verify all files are committed and pushed
- Ensure build commands are correct

## 💰 Cost Considerations

### Free Tier Includes:
- ✅ 750 hours/month for web services (Docker services count the same as Python)
- ✅ 100 GB bandwidth/month
- ✅ Unlimited static sites
- ❌ Services sleep after 15 min inactivity
- ❌ Slower build times
- ❌ First wake-up after sleep includes Tor startup (~30 seconds total)

### Paid Plans:
- **Starter**: $7/month per service
  - Always-on
  - Faster builds
  - More resources

## 🔄 Continuous Deployment

Render automatically deploys when you push to your connected branch:

1. Make changes locally
2. Commit and push to GitHub
3. Render automatically builds and deploys
4. Check deployment status in dashboard

**Note**: Docker builds take longer than Python builds (~10-15 minutes first time, ~5-10 minutes for updates), but provide the Tor proxy functionality needed for YouTube transcripts.

To disable auto-deploy:
- Go to service settings
- Disable "Auto-Deploy"

## 📊 Monitoring

### View Logs:
1. Go to your service dashboard
2. Click **"Logs"** tab
3. Monitor real-time application logs

### Health Checks:
- Backend: `https://your-backend.onrender.com/health`
- Should return: `{"status": "healthy"}`

### Performance:
- Monitor response times in logs
- Check for errors or warnings
- Upgrade instance type if needed

## 🔐 Security Best Practices

1. **API Keys**: Never commit API keys to repository
   - Users enter keys in frontend (not stored)
   - Keys stored only in browser memory

2. **CORS**: Restrict to your frontend domain in production
   ```python
   CORS(app, resources={r"/api/*": {"origins": "https://your-frontend.onrender.com"}})
   ```

3. **HTTPS**: Render provides free SSL certificates
   - Always use HTTPS URLs
   - No additional configuration needed

4. **Environment Variables**: Use Render's environment variable system
   - Never hardcode sensitive data
   - Access via `os.environ.get()`

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Docker Deployment](https://render.com/docs/docker)
- [Flask Deployment Guide](https://flask.palletsprojects.com/en/2.3.x/deploying/)
- [Gunicorn Documentation](https://docs.gunicorn.org/)
- [Tor Project](https://www.torproject.org/)
- [YouTube Transcript API](https://github.com/jdepoix/youtube-transcript-api)

## 🆘 Getting Help

If you encounter issues:
1. Check Render's [Status Page](https://status.render.com/)
2. Review [Render Community](https://community.render.com/)
3. Contact Render Support (paid plans)

---

**Congratulations! Your app is now live on Render! 🎉**

Share your frontend URL and start creating AI-powered quizzes!
