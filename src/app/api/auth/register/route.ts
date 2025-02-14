import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { setTokenCookie } from '@/lib/auth';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email, sifre, name, surname, phone, companyName, companyType, taxNumber, address } = body;

    // E-posta adresi kullanılıyor mu kontrol et
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Yeni kullanıcı oluştur
    const user = await User.create({
      email,
      password: sifre,
      name,
      surname,
      phone,
      companyName,
      companyType,
      taxNumber,
      address
    });

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    // Token'ı cookie'ye kaydet
    await setTokenCookie(token);

    // Başarılı kayıt
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        surname: user.surname
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Kayıt olurken bir hata oluştu' },
      { status: 500 }
    );
  }
} 