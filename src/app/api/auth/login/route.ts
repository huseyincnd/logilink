import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

export async function POST(request: Request) {
  console.log('Login API: İstek alındı');
  try {
    await dbConnect();
    
    const { email, password } = await request.json();
    console.log('Login API: Giriş denemesi:', { email });

    // Email ve şifre kontrolü
    if (!email || !password) {
      console.log('Login API: Email veya şifre eksik');
      return NextResponse.json(
        { error: 'Email ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    console.log('Login API: Kullanıcı bulundu mu:', !!user);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    // Şifreyi kontrol et
    const isMatch = await bcryptjs.compare(password, user.password);
    console.log('Login API: Şifre eşleşiyor mu:', isMatch);
    
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Geçersiz email veya şifre' },
        { status: 401 }
      );
    }

    // JWT token oluştur
    console.log('Login API: Token oluşturuluyor...');
    const token = jwt.sign(
      { userId: user._id.toString() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('Login API: Token oluşturuldu');

    // Response objesi oluştur
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        surname: user.surname,
        companyName: user.companyName,
        companyType: user.companyType
      },
      token
    });

    // Token'ı cookie'ye kaydet
    console.log('Login API: Cookie ayarlanıyor...');
    
    // Cookie'yi doğrudan response headers'a ekle
    response.headers.set('Set-Cookie', 
      `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    );
    
    console.log('Login API: Cookie ayarlandı');
    console.log('Login API: Response headers:', Object.fromEntries(response.headers.entries()));

    return response;
  } catch (error) {
    console.error('Login API: Hata:', error);
    return NextResponse.json(
      { error: 'Giriş yapılırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 