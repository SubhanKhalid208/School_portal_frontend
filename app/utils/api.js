
import Cookies from 'js-cookie';

const getBaseUrl = () => {
  let base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  
  
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

export const getApiUrl = (endpoint) => {
  const base = getBaseUrl();
  if (!endpoint) return base;

  let cleanEndpoint = endpoint.trim();
  if (!cleanEndpoint.startsWith('/')) {
    cleanEndpoint = `/${cleanEndpoint}`;
  }

  const baseHasApi = base.toLowerCase().endsWith('/api');
  const endpointHasApi = cleanEndpoint.toLowerCase().startsWith('/api/');

  if (baseHasApi && endpointHasApi) {
    return `${base}${cleanEndpoint.substring(4)}`; 
  }

  if (!baseHasApi && !endpointHasApi) {
    return `${base}/api${cleanEndpoint}`;
  }

  return `${base}${cleanEndpoint}`;
};


export const fetchWithRetry = async (url, options = {}, retries = 1) => {
  const token = Cookies.get('token'); 

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers, 
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: options.credentials || 'include',
      cache: 'no-store' 
    });

    if (response.ok) return response;

    
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


export const safeApiCall = async (endpoint, options = {}) => {
  try {
    const url = getApiUrl(endpoint);
    console.log("🌐 Lahore Portal Request:", url); 
    
    const response = await fetchWithRetry(url, options);

    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
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