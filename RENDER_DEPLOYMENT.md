# 🚀 Deploying to Render - Complete Guide (React Edition)

This guide provides step-by-step instructions for deploying the React-based AI Quiz & Flashcard Generator to Render.com.

## 🎯 Deployment Strategy

This app uses a **two-service deployment**:
1.  **Backend** - A Python Flask API running in a Docker container with a Tor proxy to handle YouTube requests.
2.  **Frontend** - A React static site built with Vite and served by Render.

### 📦 Monorepo Structure

Our repository is a **monorepo**. Both frontend and backend code live in the same GitHub repository, but in separate directories:
- **Backend**: Lives in the `/backend` directory.
- **Frontend**: Lives in the `/frontend` directory.

Render's **Root Directory** setting allows us to manage this structure efficiently, preventing unnecessary rebuilds.

### 🔐 YouTube Transcript Solution: Tor Proxy

**Problem**: YouTube blocks requests from most cloud hosting providers (like Render), which prevents the app from fetching video transcripts.

**Solution**: The backend is deployed within a Docker container that includes a **Tor SOCKS5 proxy**.
- Only YouTube API requests are routed through Tor, which cycles IP addresses to bypass a block.
- All other requests (like Firecrawl for website scraping) use a direct connection for maximum speed.
- This solution is free, secure, and integrated into the deployment configuration.

## 📝 Step-by-Step Deployment

Follow these steps carefully to get your application live.

### Step 1: Push Your Code to GitHub

Ensure your latest code, including the `frontend`, `backend`, `Dockerfile`, and `render.yaml` files, is pushed to your GitHub repository.

### Step 2: Deploy the Backend (Docker Web Service)

1.  From the [Render Dashboard](https://dashboard.render.com), click **New +** → **Web Service**.
2.  Connect your GitHub account and select your repository.
3.  Configure the service with the following settings:
    -   **Name**: `ai-quiz-backend` (or a name of your choice).
    -   **Region**: Choose a region close to your users.
    -   **Branch**: `main` (or your primary branch).
    -   **Runtime**: `Docker`. Render will automatically detect your `Dockerfile`.
    -   **Dockerfile Path**: `./Dockerfile` (should be the default).
    -   **Instance Type**: **Free** is sufficient for testing. Note that free services "spin down" after inactivity, causing a 30-60 second delay on the first request.
4.  Click **"Create Web Service"**.
5.  The first build will take 10-15 minutes as it builds the Docker image and initializes the Tor service.
6.  Once the deployment is complete, find and **copy your backend URL**. It will look like `https://ai-quiz-backend.onrender.com`. You will need this for the next step.

### Step 3: Deploy the Frontend (Static Site)

1.  Go back to the [Render Dashboard](https://dashboard.render.com) and click **New +** → **Static Site**.
2.  Select the same GitHub repository.
3.  Configure the service with these settings:
    -   **Name**: `ai-quiz-frontend` (or a name of your choice).
    -   **Branch**: `main`.
    -   **Root Directory**: `frontend`. This tells Render to run commands from within the `frontend` folder.
    -   **Build Command**: `npm install && npm run build`. This installs dependencies and builds the production-ready static files.
    -   **Publish Directory**: `dist`. This is the directory where Vite places the built files.
4.  Click **"Advanced"** to add an environment variable. This is how you'll securely tell your frontend the URL of your backend.
    -   Click **"Add Environment Variable"**.
    -   **Key**: `VITE_BACKEND_URL`
    -   **Value**: Paste the backend URL you copied in Step 2 (e.g., `https://ai-quiz-backend.onrender.com`).
5.  Click **"Create Static Site"**.
6.  This deployment should be much faster. Once it's live, you can visit your frontend URL.

### Step 4: Test Your Live Application

1.  Navigate to your frontend URL provided by Render.
2.  Enter your OpenRouter API key and desired model in the settings.
3.  Test the core features:
    -   ✅ Document upload.
    -   ✅ YouTube video transcript fetching.
    -   ✅ Website scraping (if you have a Firecrawl key).

## 🐛 Troubleshooting

**Backend build fails:**
- Check the build logs on Render for any errors in the `Dockerfile` execution.
- Ensure `Dockerfile`, `backend/app.py`, and `backend/requirements.txt` are correctly configured.

**Frontend build fails:**
- Check the build logs. The most common issue is a failure during `npm install`.
- Ensure your `frontend/package.json` is valid and all dependencies are correct.

**YouTube transcripts don't work on the live site:**
- Check the backend logs. You should see messages indicating that Tor is running.
- The first YouTube request after the service starts or wakes up may be slow as Tor connects. Give it up to a minute.
- If it consistently fails, redeploy the backend service with "Clear build cache" selected.

**CORS errors in the browser console:**
- By default, the backend is configured to allow requests from all origins (`*`). For better security in production, you can restrict this.
- In `backend/app.py`, find the `CORS(app, ...)` line and change the origins to your specific frontend URL:
  ```python
  # from:
  CORS(app, resources={r"/api/*": {"origins": "*"}})
  # to:
  CORS(app, resources={r"/api/*": {"origins": "https://ai-quiz-frontend.onrender.com"}})
  ```
- Commit and push this change. Render will automatically redeploy your backend.

## 🔄 Continuous Deployment

Render is configured for continuous deployment out of the box. Any `git push` to your main branch will automatically trigger a new build and deployment for the relevant service (frontend or backend), ensuring your application stays up-to-date.
