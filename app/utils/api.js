/**
 * Centralized API Helper for Lahore Portal
 * Optimized for Railway Production and Vercel
 */

const getBaseUrl = () => {
  // 1. Get base from env or default to localhost
  let base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  
  // 2. Remove trailing slash if exists (e.g., .../api/ -> .../api)
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

/**
 * Constructs the full API URL for an endpoint without duplication
 */
export const getApiUrl = (endpoint) => {
  const base = getBaseUrl();
  if (!endpoint) return base;

  // 1. Clean endpoint: trim spaces and ensure leading slash
  let cleanEndpoint = endpoint.trim();
  if (!cleanEndpoint.startsWith('/')) {
    cleanEndpoint = `/${cleanEndpoint}`;
  }

  // 2. Logic to prevent double "/api/api"
  const baseHasApi = base.toLowerCase().endsWith('/api');
  const endpointHasApi = cleanEndpoint.toLowerCase().startsWith('/api/');

  if (baseHasApi && endpointHasApi) {
    // Agar dono jagah /api hai, to endpoint wala remove karein
    return `${base}${cleanEndpoint.substring(4)}`; 
  }

  if (!baseHasApi && !endpointHasApi) {
    // Agar kisi jagah bhi nahi hai, to manually add karein
    return `${base}/api${cleanEndpoint}`;
  }

  // 3. Normal case (ek jagah /api maujood hai)
  return `${base}${cleanEndpoint}`;
};

/**
 * Fetch wrapper with automatic retry logic and cross-domain support
 */
export const fetchWithRetry = async (url, options = {}, retries = 1) => {
  try {
    const response = await fetch(url, {
      ...options,
      // Production mein session cookies ke liye 'include' barkarar rakha hai
      credentials: options.credentials || 'include',
      cache: 'no-store' 
    });

    if (response.ok) return response;

    // Retry only for Server Errors (500+)
    if (retries > 0 && response.status >= 500) {
      console.warn(`⚠️ Lahore Portal: Server error ${response.status}, retrying...`);
      await new Promise(res => setTimeout(res, 500));
      return fetchWithRetry(url, options, retries - 1);
    }

    return response;
  } catch (err) {
    if (retries > 0) {
      console.warn(`⚠️ Lahore Portal: Network error, retrying...`);
      await new Promise(res => setTimeout(res, 500));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw err;
  }
};

/**
 * Safe fetch with unified error handling
 */
export const safeApiCall = async (endpoint, options = {}) => {
  try {
    const url = getApiUrl(endpoint);
    // Debugging line taake aap console mein sahi URL dekh sakein
    console.log("🌐 Lahore Portal Request:", url); 
    
    const response = await fetchWithRetry(url, options);

    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Non-JSON response (like 404 HTML) ko debug karne ke liye
      const errorBody = await response.text();
      console.error("⚠️ Non-JSON Response received:", errorBody);
    }

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: data?.error || data?.message || `Error: ${response.status}`
      };
    }

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