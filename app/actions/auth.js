'use server'
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// ✅ Centralized API URL construction (Wahi purana logic jo aapne diya)
const getApiUrl = (endpoint) => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const withoutApi = cleanEndpoint.replace(/^\/api/, '');
  return `${BASE_URL}/api${withoutApi}`;
};

export async function handleLogin(formData) {
  const email = formData.get('email');
  const password = formData.get('password');
  const API_URL = getApiUrl('/auth/login');

  try {
    console.log(`📡 Attempting login to: ${API_URL}`);

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
      credentials: 'include'
    });

    const contentType = res.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text().catch(() => "<no-body>");
      console.error(`❌ Expected JSON but got status=${res.status} body=${text}`);
      throw new Error(`Backend ne JSON response nahi diya! status=${res.status} body=${text}`);
    }

    if (!res.ok) {
      return { success: false, error: data.error || "Login fail ho gaya!" };
    }

    const user = data.user; 
    const cookieStore = await cookies();

    // ✅ Session Cookies Setup (Aapka original logic)
    cookieStore.set('token', data.token, { 
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 
    });

    cookieStore.set('userId', user.id.toString(), { 
      httpOnly: false, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 
    });
    
    cookieStore.set('role', user.role, { 
      httpOnly: false, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24
    });

    return { 
      success: true, 
      token: data.token, 
      role: user.role, 
      userId: user.id 
    };

  } catch (error) {
    console.error("❌ Auth Action Error:", error.message);
    return { success: false, error: "Server se rabta nahi ho saka! " + error.message };
  }
}

export async function handleSignup(formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const dob = formData.get('dob');
  const password = formData.get('password'); // ✅ Password field yahan pakri
  const API_URL = getApiUrl('/auth/signup');

  try {
    // Input validation (Ab password zaroori hai)
    if (!name || !email || !password) {
      return { success: false, error: "Name, Email aur Password zaroori hain!" };
    }

    console.log(`📝 Direct Registration attempt for: ${email}`);
    console.log(`📡 Sending to: ${API_URL}`);

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: name.trim(), 
        email: email.toLowerCase().trim(), 
        password: password, // ✅ Password payload mein bhej diya
        dob: dob || null, 
        role: 'student' 
      }),
      cache: 'no-store',
      credentials: 'include'
    });

    const contentType = res.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text().catch(() => "<no-body>");
      console.error(`❌ Non-JSON response received status=${res.status} body=${text}`);
      throw new Error(`Backend ne JSON response nahi diya! status=${res.status} body=${text}`);
    }

    if (!res.ok) {
      console.error("❌ Registration failed:", data);
      return { 
        success: false, 
        error: data.error || "Registration fail ho gaya! Phir se try karein." 
      };
    }

    console.log("✅ Registration successful:", data);
    return { 
      success: true, 
      message: data.message || "Account ban gaya hai! Ab isi password se login karein.", // ✅ Message updated
      userId: data.userId
    };

  } catch (error) {
    console.error("❌ Signup Action Error:", error.message);
    return { 
      success: false, 
      error: "Server se rabta nahi ho saka! " + (error.message || "Network error") 
    };
  }
}

export async function handleLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('userId');
  cookieStore.delete('role');
  cookieStore.delete('token');
  redirect('/login');
}