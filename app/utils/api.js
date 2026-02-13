import Cookies from 'js-cookie';

/**
 * Lahore Portal: Base URL fetching logic
 * Environment variables ko prioritize karta hai
 */
const getBaseUrl = () => {
  let base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  // Trim trailing slash for consistency
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

/**
 * Lahore Portal: API URL Generator
 * Automatic /api prefix logic (Adjusted for Railway compatibility)
 */
export const getApiUrl = (endpoint) => {
  const base = getBaseUrl();
  if (!endpoint) return base;

  let cleanEndpoint = endpoint.trim();
  if (!cleanEndpoint.startsWith('/')) {
    cleanEndpoint = `/${cleanEndpoint}`;
  }

  const baseHasApi = base.toLowerCase().endsWith('/api');
  const endpointHasApi = cleanEndpoint.toLowerCase().startsWith('/api/');

  // Double '/api/api' se bachne ke liye logic
  if (baseHasApi && endpointHasApi) {
    return `${base}${cleanEndpoint.substring(4)}`; 
  }

  // Agar backend direct endpoints mangta hai to '/api' prefix yahan control hota hai
  // Agar aapko error aaye to yahan check karein ke backend route /api se shuru hota hai ya nahi
  if (!baseHasApi && !endpointHasApi) {
    return `${base}/api${cleanEndpoint}`;
  }

  return `${base}${cleanEndpoint}`;
};

/**
 * Lahore Portal: Fetch with Retry Mechanism
 * Token fetching hierarchy: Params -> Cookies -> LocalStorage
 */
export const fetchWithRetry = async (url, options = {}, retries = 1) => {
  // ✅ Token Fetching Hierarchy
  const tokenFromHeaders = options.headers?.Authorization?.replace('Bearer ', '');
  const tokenFromCookies = Cookies.get('token');
  const tokenFromLocal = (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

  const token = tokenFromHeaders || tokenFromCookies || tokenFromLocal;

  // Prepare Headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers, 
  };

  // Duplicate Authorization remove karna (safety)
  if (options.headers?.Authorization) {
    delete options.headers.Authorization;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: options.credentials || 'include',
      cache: 'no-store' 
    });

    // Agar response sahi hai
    if (response.ok) return response;

    // Retry logic for Server Errors (500+)
    if (retries > 0 && response.status >= 500) {
      console.warn(`⚠️ Lahore Portal: Server error ${response.status}, retrying in 500ms...`);
      await new Promise(res => setTimeout(res, 500));
      return fetchWithRetry(url, options, retries - 1);
    }

    return response;
  } catch (err) {
    // Network errors (Internet issue) ke liye retry
    if (retries > 0) {
      console.warn(`⚠️ Lahore Portal: Network error, retrying...`);
      await new Promise(res => setTimeout(res, 500));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
};

/**
 * Lahore Portal: Safe API Wrapper
 * Main function for all UI components
 */
export const safeApiCall = async (endpoint, options = {}) => {
  try {
    const url = getApiUrl(endpoint);
    console.log("🌐 Lahore Portal Request:", url); 
    
    const response = await fetchWithRetry(url, options);

    // Response Type Check
    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const errorBody = await response.text();
      console.error("⚠️ Non-JSON Response received:", errorBody);
      return {
        success: false,
        error: 'Invalid response format from server',
        status: response.status
      };
    }

    // Success Check
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: data?.error || data?.message || `Error: ${response.status}`
      };
    }

    // Returning Clean Data
    return {
      success: true,
      data: data,
      status: response.status
    };

  } catch (error) {
    console.error(`❌ Lahore Portal API Error:`, error.message);
    return {
      success: false,
      error: `Connection fail: Lahore Portal server se rabta nahi ho saka.`
    };
  }
};