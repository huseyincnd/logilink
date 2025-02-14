import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Korumalı rotalar
const protectedRoutes = [
  '/ilan-ver',
  '/ilanlarim',
  '/degerlendirmeler',
  '/profil',
  '/hesap-ayarlari'
];

// Giriş gerektirmeyen rotalar
const publicRoutes = [
  '/',
  '/ilanlar',
  '/giris',
  '/kayit',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/check'
];

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (NextAuth.js API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('Middleware: İstek alındı:', pathname);

  // Korumalı sayfalar için auth kontrolü
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    console.log('Middleware: Korumalı sayfa için auth kontrolü yapılıyor');
    
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    
    if (!token) {
      console.log('Middleware: Oturum bulunamadı, giriş sayfasına yönlendiriliyor');
      const loginUrl = new URL('/giris', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  console.log('Middleware: İstek devam ediyor');
  return NextResponse.next();
} 