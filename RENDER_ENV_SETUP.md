# Setting Up Environment Variables on Render

This guide explains how to configure environment variables for your AI Quiz & Flashcard Generator application on Render.

## Overview

The application now reads all API keys from environment variables instead of requiring users to enter them in the frontend. This provides better security and a seamless user experience.

## Required Environment Variables

You need to set the following environment variables in your Render dashboard:

### 1. OPENROUTER_API_KEY (Required)
- **Description**: Your OpenRouter API key for AI-powered quiz and flashcard generation
- **Get it from**: https://openrouter.ai/
- **Format**: `sk-or-v1-...` (starts with sk-or-v1-)

### 2. OPENROUTER_MODEL_NAME (Required)
- **Description**: The AI model to use for generation
- **Example**: `google/gemini-2.5-pro` or `google/gemini-2.0-flash-exp:free`
- **Note**: You can change this to any model available on OpenRouter

### 3. FIRECRAWL_API_KEY (Required for website scraping)
- **Description**: Your Firecrawl API key for scraping website content
- **Get it from**: https://firecrawl.dev
- **Format**: `fc-...` (starts with fc-)

### 4. SUPADATA_API_KEY (Optional, but recommended)
- **Description**: Your Supadata API key for fetching YouTube transcripts
- **Get it from**: https://supadata.ai (100 free requests/month)
- **Format**: `sd_...` (starts with sd_)
- **Note**: If not provided, the app will fall back to Tor proxy (slower and less reliable)

### 5. PERPLEXITY_API_KEY (Optional - Not currently used)
- **Description**: Your Perplexity API key (for future features)
- **Get it from**: https://www.perplexity.ai/
- **Format**: `pplx-...` (starts with pplx-)
- **Note**: Reserved for future functionality

## How to Set Environment Variables on Render

### For the Backend Service:

1. **Log in to your Render Dashboard**
   - Go to https://dashboard.render.com/

2. **Navigate to your Backend Service**
   - Find and click on your backend service (e.g., "ai-quiz-backend-qbm7")

3. **Go to Environment Settings**
   - Click on "Environment" in the left sidebar

4. **Add Environment Variables**
   - Click "Add Environment Variable" button
   - For each variable listed above:
     - Enter the **Key** (e.g., `OPENROUTER_API_KEY`)
     - Enter the **Value** (your actual API key)
     - Click "Add" or "Save Changes"

5. **Add Your Environment Variables**:
   
   Copy the values from your local `.env` file. For each variable:
   - Key: The environment variable name (e.g., `OPENROUTER_API_KEY`)
   - Value: Your actual API key from the `.env` file
   
   **Example format** (use your actual values):
   ```
   Key: OPENROUTER_API_KEY
   Value: [Your actual OpenRouter API key from .env file]

   Key: OPENROUTER_MODEL_NAME
   Value: [Your preferred model name from .env file]

   Key: FIRECRAWL_API_KEY
   Value: [Your actual Firecrawl API key from .env file]

   Key: SUPADATA_API_KEY
   Value: [Your actual Supadata API key from .env file]

   Key: PERPLEXITY_API_KEY
   Value: [Your actual Perplexity API key from .env file]
   ```

6. **Save and Redeploy**
   - After adding all environment variables, Render will automatically trigger a redeploy
   - Wait for the deployment to complete (usually 2-5 minutes)

## Verification

After setting up the environment variables and redeploying:

1. **Visit your application URL**
   - The app should load directly to the content creation screen
   - No API configuration screen should appear

2. **Test the functionality**
   - Try uploading a document and generating a quiz
   - Try fetching a YouTube transcript
   - Try scraping a website

3. **Check for errors**
   - If you see "Configuration Error" on the generate button, check that all required environment variables are set correctly
   - Check the Render logs for any error messages

## Security Benefits

✅ **API keys are never exposed to the browser or frontend code**
✅ **Users can't see or modify your API keys**
✅ **Centralized management - update once, affects all users**
✅ **Follows industry best practices for credential management**
✅ **No risk of API keys being committed to version control**

## Troubleshooting

### Error: "Configuration Error"
- **Cause**: Missing or incorrect `OPENROUTER_API_KEY` or `OPENROUTER_MODEL_NAME`
- **Solution**: Verify these environment variables are set correctly in Render

### Error: "Firecrawl API key not configured"
- **Cause**: Missing `FIRECRAWL_API_KEY` when trying to scrape a website
- **Solution**: Add the `FIRECRAWL_API_KEY` environment variable

### App doesn't load configuration
- **Cause**: Backend service might not be running or environment variables not loaded
- **Solution**: 
  1. Check Render service status
  2. Verify environment variables are saved
  3. Trigger a manual redeploy
  4. Check backend logs for errors

## Updating API Keys

To update an API key:

1. Go to your Render dashboard
2. Select your backend service
3. Go to "Environment" section
4. Find the variable you want to update
5. Click "Edit" next to the variable
6. Enter the new value
7. Save changes
8. Render will automatically redeploy with the new values

## Important Notes

- Environment variables are encrypted and stored securely by Render
- Never share your API keys publicly or commit them to version control
- The `.env` file in your local project is only for local development
- Production environment variables are managed entirely through Render's dashboard
- Changes to environment variables trigger automatic redeployment

## Local Development

For local development, you can still use the `.env` file in your project root:

```env
OPENROUTER_API_KEY=your-key-here
OPENROUTER_MODEL_NAME=google/gemini-2.5-pro
FIRECRAWL_API_KEY=your-key-here
SUPADATA_API_KEY=your-key-here
PERPLEXITY_API_KEY=your-key-here
```

The backend will automatically read from this file when running locally.

## Support

If you encounter issues:
1. Check Render logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure your API keys are valid and have sufficient credits
4. Test the backend health endpoint: `https://your-backend-url.onrender.com/health`
