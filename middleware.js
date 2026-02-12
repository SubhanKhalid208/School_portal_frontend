import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Cookies se authentication data nikalna
  const userId = request.cookies.get('userId')?.value;
  const role = request.cookies.get('role')?.value;
  const token = request.cookies.get('token')?.value; // Token check lazmi hai security ke liye

  // 1. PUBLIC PATHS CHECK
  // Agar user pehle se login hai aur /login ya /register pe jaye, to usay home bhej do
  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (isAuthPage && userId) {
    if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
    if (role === 'teacher') return NextResponse.redirect(new URL('/teacher', request.url));
    return NextResponse.redirect(new URL(`/dashboard/student/${userId}`, request.url));
  }

  // 2. PROTECTED PATHS CHECK
  // Agar user login NAHI hai aur woh protected pages pe jana chahta hai
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                           pathname.startsWith('/admin') || 
                           pathname.startsWith('/teacher');

  if (!userId && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. ROLE-BASED ACCESS CONTROL (RBAC)
  
  // Student Protection: Student sirf apna dashboard dekh sakta hai
  if (role === 'student') {
    if (pathname.startsWith('/admin') || pathname.startsWith('/teacher')) {
      return NextResponse.redirect(new URL(`/dashboard/student/${userId}`, request.url));
    }
  }

  // Teacher Protection: Teacher admin pages nahi dekh sakta
  if (role === 'teacher') {
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/teacher', request.url));
    }
  }

  // Admin Protection: Admin ko student dashboard se door rakhein (cleanliness)
  if (role === 'admin') {
    if (pathname.startsWith('/dashboard/student')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

// Config: Kin paths par ye middleware chalna chahiye
export const config = {
  // Is matcher mein wo sab paths shamil karein jo protect karne hain
  matcher: [
    '/dashboard/:path*', 
    '/admin/:path*', 
    '/teacher/:path*',
    '/login',
    '/register'
  ],
};