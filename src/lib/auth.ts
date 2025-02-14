import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { JWT } from 'next-auth/jwt';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}

export async function verifyAuth(request: NextRequest) {
  console.log('verifyAuth: Token kontrolü başlıyor');
  try {
    // Token'ı cookie'den al
    const token = request.cookies.get('token')?.value;
    console.log('verifyAuth: Cookie token:', token ? 'Mevcut' : 'Yok');

    if (!token) {
      console.log('verifyAuth: Token bulunamadı');
      return null;
    }

    // Token'ı doğrula
    console.log('verifyAuth: Token doğrulanıyor...');
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    console.log('verifyAuth: Token doğrulandı:', decoded);
    return decoded;
  } catch (error) {
    console.error('verifyAuth: Token doğrulama hatası:', error);
    return null;
  }
}

export async function getTokenFromCookies() {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}

export async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 gün
    path: '/'
  });
}

export async function removeTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email ve şifre gerekli');
        }

        await dbConnect();
        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password) {
          throw new Error('Kullanıcı bulunamadı');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Hatalı şifre');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name
        };
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 60 * 60 * 24 * 7 // 7 days
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/giris',
  },
  debug: process.env.NODE_ENV === 'development'
}; 