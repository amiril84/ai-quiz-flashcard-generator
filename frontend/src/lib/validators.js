/**
 * Input Validation and Sanitization Utilities
 * 
 * This module provides comprehensive validation and sanitization functions
 * for all user inputs in the AI Quiz & Flashcard Generator application.
 */

// ============================================================================
// YOUTUBE URL VALIDATORS
// ============================================================================

/**
 * Extract YouTube video ID from various URL formats
 * @param {string} url - The YouTube URL
 * @returns {string|null} - Video ID or null if invalid
 */
export function extractYouTubeVideoId(url) {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/v\/([A-Za-z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Check if URL is a YouTube playlist
 * @param {string} url - The URL to check
 * @returns {boolean}
 */
export function isYouTubePlaylist(url) {
  if (!url) return false;
  return url.includes('/playlist?') || url.includes('&list=');
}

/**
 * Check if URL is a YouTube channel
 * @param {string} url - The URL to check
 * @returns {boolean}
 */
export function isYouTubeChannel(url) {
  if (!url) return false;
  return url.includes('/channel/') || url.includes('/@');
}

/**
 * Check if URL is a YouTube Shorts
 * @param {string} url - The URL to check
 * @returns {boolean}
 */
export function isYouTubeShorts(url) {
  if (!url) return false;
  return url.includes('/shorts/');
}

/**
 * Get the type of YouTube URL
 * @param {string} url - The URL to check
 * @returns {string} - 'video' | 'playlist' | 'channel' | 'shorts' | 'invalid'
 */
export function getYouTubeUrlType(url) {
  if (!url) return 'invalid';

  // Trim whitespace
  url = url.trim();

  // Check if it's a YouTube domain
  if (!isYouTubeUrl(url)) {
    return 'invalid';
  }

  // Check specific types
  if (isYouTubePlaylist(url)) {
    return 'playlist';
  }

  if (isYouTubeChannel(url)) {
    return 'channel';
  }

  if (isYouTubeShorts(url)) {
    return 'shorts';
  }

  // Check if it has a valid video ID
  const videoId = extractYouTubeVideoId(url);
  if (videoId) {
    return 'video';
  }

  return 'invalid';
}

/**
 * Validate YouTube video URL
 * @param {string} url - The URL to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export function isValidYouTubeVideoUrl(url) {
  if (!url || !url.trim()) {
    return {
      isValid: false,
      error: 'Please enter a YouTube video URL'
    };
  }

  const urlType = getYouTubeUrlType(url);

  if (urlType === 'playlist') {
    return {
      isValid: false,
      error: 'Playlist URLs are not supported. Please enter a single video URL'
    };
  }

  if (urlType === 'channel') {
    return {
      isValid: false,
      error: 'Channel URLs are not supported. Please enter a video URL'
    };
  }

  if (urlType === 'shorts') {
    return {
      isValid: false,
      error: 'YouTube Shorts are not currently supported. Please enter a regular video URL'
    };
  }

  if (urlType === 'invalid') {
    return {
      isValid: false,
      error: 'Invalid YouTube URL. Please enter a valid video URL (e.g., https://www.youtube.com/watch?v=...)'
    };
  }

  return {
    isValid: true,
    error: ''
  };
}

// ============================================================================
// WEBSITE URL VALIDATORS
// ============================================================================

/**
 * Check if URL is any YouTube domain
 * @param {string} url - The URL to check
 * @returns {boolean}
 */
export function isYouTubeUrl(url) {
  if (!url) return false;
  
  const lowerUrl = url.toLowerCase();
  return lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be');
}

/**
 * Validate website URL format
 * @param {string} url - The URL to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export function isValidWebsiteUrl(url) {
  if (!url || !url.trim()) {
    return {
      isValid: false,
      error: 'Please enter a website URL'
    };
  }

  // Trim whitespace
  url = url.trim();

  // Check for protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return {
      isValid: false,
      error: 'URL must start with http:// or https://'
    };
  }

  // Check if it's a YouTube URL
  if (isYouTubeUrl(url)) {
    return {
      isValid: false,
      error: 'This is a YouTube URL. Please select "YouTube" as your content source instead'
    };
  }

  try {
    const urlObj = new URL(url);
    
    // Check domain structure
    if (!urlObj.hostname || !urlObj.hostname.includes('.')) {
      return {
        isValid: false,
        error: 'Invalid domain structure'
      };
    }

    // Check for suspicious patterns
    if (urlObj.protocol === 'javascript:' || urlObj.protocol === 'data:') {
      return {
        isValid: false,
        error: 'Invalid protocol'
      };
    }

    return {
      isValid: true,
      error: ''
    };
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL format. Please enter a valid website URL'
    };
  }
}

/**
 * Sanitize URL input
 * @param {string} url - The URL to sanitize
 * @returns {string} - Sanitized URL
 */
export function sanitizeUrl(url) {
  if (!url) return '';

  // Trim whitespace
  url = url.trim();

  // Remove invisible characters
  url = url.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Remove any potential script injections
  url = url.replace(/<script[^>]*>.*?<\/script>/gi, '');
  
  // Remove javascript: protocol
  if (url.toLowerCase().startsWith('javascript:')) {
    return '';
  }

  return url;
}

// ============================================================================
// TEXT INPUT VALIDATORS
// ============================================================================

/**
 * Check if text contains SQL injection patterns
 * @param {string} text - The text to check
 * @returns {boolean}
 */
export function containsSqlInjectionPattern(text) {
  if (!text) return false;

  const sqlPatterns = [
    /(\bSELECT\b.*\bFROM\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bUPDATE\b.*\bSET\b)/i,
    /(\bDELETE\b.*\bFROM\b)/i,
    /(\bDROP\b.*\bTABLE\b)/i,
    /(\bUNION\b.*\bSELECT\b)/i,
    /(--|\/\*|\*\/)/,
    /(\bOR\b.*=.*)/i,
    /('.*OR.*'.*=.*')/i,
  ];

  return sqlPatterns.some(pattern => pattern.test(text));
}

/**
 * Check if text contains XSS patterns
 * @param {string} text - The text to check
 * @returns {boolean}
 */
export function isUrl(text) {
  if (!text) return false;
  // A simple regex to check for a URL pattern.
  // This is not exhaustive but covers common cases.
  const urlPattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', // fragment locator
    'i'
  );
  return !!urlPattern.test(text);
}

/**
 * Check if text contains XSS patterns
 * @param {string} text - The text to check
 * @returns {boolean}
 */
export function containsXssPattern(text) {
  if (!text) return false;

  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /onerror\s*=/gi,
    /onload\s*=/gi,
    /onclick\s*=/gi,
  ];

  return xssPatterns.some(pattern => pattern.test(text));
}

/**
 * Validate topic text input
 * @param {string} text - The text to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export function isValidTopicText(text) {
  if (!text || !text.trim()) {
    return {
      isValid: false,
      error: 'Please enter a topic (e.g., "English Grammar Past Tense")'
    };
  }

  // Trim for length check
  const trimmed = text.trim();

    // Check if the input is a URL
  if (isUrl(trimmed)) {
    return {
      isValid: false,
      error: 'URLs are not allowed as a topic. Please enter a topic phrase.'
    };
  }

  // Check length
  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: 'Topic must be at least 3 characters long'
    };
  }

  if (trimmed.length > 200) {
    return {
      isValid: false,
      error: 'Topic must be less than 200 characters'
    };
  }

  // Check for SQL injection patterns
  if (containsSqlInjectionPattern(trimmed)) {
    return {
      isValid: false,
      error: 'Invalid characters detected. Please use only letters, numbers, and basic punctuation'
    };
  }

  // Check for XSS patterns
  if (containsXssPattern(trimmed)) {
    return {
      isValid: false,
      error: 'HTML tags and scripts are not allowed'
    };
  }

  return {
    isValid: true,
    error: ''
  };
}

/**
 * Escape HTML special characters
 * @param {string} text - The text to escape
 * @returns {string} - Escaped text
 */
export function escapeHtml(text) {
  if (!text) return '';

  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, char => htmlEscapes[char]);
}

/**
 * Sanitize text input
 * @param {string} text - The text to sanitize
 * @returns {string} - Sanitized text
 */
export function sanitizeText(text) {
  if (!text) return '';

  // Trim whitespace
  text = text.trim();

  // Remove null bytes
  text = text.replace(/\0/g, '');

  // Remove invisible Unicode characters
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Remove script tags
  text = text.replace(/<script[^>]*>.*?<\/script>/gi, '');

  // Remove iframe tags
  text = text.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '');

  // Remove event handlers
  text = text.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  // Remove SQL comment indicators
  text = text.replace(/--/g, '');
  text = text.replace(/\/\*/g, '');
  text = text.replace(/\*\//g, '');

  // Limit length
  if (text.length > 500) {
    text = text.substring(0, 500);
  }

  return text;
}

// ============================================================================
// EXPORT ALL VALIDATORS
// ============================================================================

export default {
  // YouTube validators
  extractYouTubeVideoId,
  isYouTubePlaylist,
  isYouTubeChannel,
  isYouTubeShorts,
  getYouTubeUrlType,
  isValidYouTubeVideoUrl,
  isYouTubeUrl,
  
  // Website validators
  isValidWebsiteUrl,
  sanitizeUrl,
  
  // Text validators
  isUrl,
  isValidTopicText,
  containsSqlInjectionPattern,
  containsXssPattern,
  escapeHtml,
  sanitizeText,
};
