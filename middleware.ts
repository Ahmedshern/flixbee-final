import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect /admin routes, excluding the login page
  if (
    request.nextUrl.pathname.startsWith('/admin') && 
    !request.nextUrl.pathname.includes('/login')
  ) {
    const adminCookie = request.cookies.get('adminLoggedIn');
    
    if (!adminCookie?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};