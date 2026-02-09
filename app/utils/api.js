/**
 * Centralized API Helper for Lahore Portal
 * Ensures all requests go to the correct backend URL with retry logic
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Constructs the full API URL for an endpoint
 * Handle cases for double slashes and redundant /api prefixes
 */
export const getApiUrl = (endpoint) => {
  if (!endpoint) return BASE_URL;

  // 1. Trim spaces and ensure leading slash
  let cleanEndpoint = endpoint.trim();
  if (!cleanEndpoint.startsWith('/')) {
    cleanEndpoint = `/${cleanEndpoint}`;
  }

  // 2. Prevent duplicate /api if already passed in endpoint
  // Example: '/api/users' -> '/users'
  cleanEndpoint = cleanEndpoint.replace(/^\/api\//, '/');

  // 3. Remove trailing slash from BASE_URL if exists
  const base = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

  return `${base}/api${cleanEndpoint}`;
};

/**
 * Fetch wrapper with automatic retry logic
 * Now includes 'credentials: include' for cross-domain cookies
 */
export const fetchWithRetry = async (url, options = {}, retries = 1) => {
  try {
    const response = await fetch(url, {
      ...options,
      // Production mein session cookies ke liye ye lazmi hai
      credentials: options.credentials || 'include',
      cache: 'no-store' 
    });

    if (response.ok) return response;

    // Retry only for Server Errors (500, 502, 503, 504)
    if (retries > 0 && response.status >= 500) {
      console.warn(`⚠️ Server error ${response.status}, retrying in 500ms...`);
      await new Promise(res => setTimeout(res, 500));
      return fetchWithRetry(url, options, retries - 1);
    }

    return response;
  } catch (err) {
    if (retries > 0) {
      console.warn(`⚠️ Network error: ${err.message}, retrying in 500ms...`);
      await new Promise(res => setTimeout(res, 500));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
};

/**
 * Safe fetch with error handling
 * Combines URL building, Fetch, and JSON parsing
 */
export const safeApiCall = async (endpoint, options = {}) => {
  try {
    const url = getApiUrl(endpoint);
    const response = await fetchWithRetry(url, options);

    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      // Backend status code logic
      return {
        success: false,
        status: response.status,
        error: data?.error || data?.message || `Server Error: ${response.status}`
      };
    }

    // Return success response formatted consistently
    return {
      success: true,
      data: data,
      status: response.status
    };

  } catch (error) {
    console.error(`❌ API Call Failed:`, error.message);
    return {
      success: false,
      error: `Connection fail: Lahore Portal server se rabta nahi ho saka.`
    };
  }
};