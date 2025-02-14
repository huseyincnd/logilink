import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Listing from '@/models/Listing';

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Params'ı await et
    const params = await context.params;
    const { id } = params;

    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
    }

    await dbConnect();

    // İlanı bul
    const listing = await Listing.findById(id);
    if (!listing) {
      return NextResponse.json({ error: 'İlan bulunamadı' }, { status: 404 });
    }

    // İlan sahibi kontrolü
    if (listing.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    // Request body'den eşleşecek kullanıcı ID'sini al
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json(
        { error: 'Eşleşecek kullanıcı seçilmedi' },
        { status: 400 }
      );
    }

    // İlanı güncelle
    listing.durum = 'eşleşti';
    listing.eslesmisKullanici = userId;
    listing.eslesmeTarihi = new Date();
    await listing.save();

    return NextResponse.json({ message: 'İlan başarıyla eşleştirildi' });
  } catch (error: any) {
    console.error('İlan eşleştirme hatası:', error);
    return NextResponse.json(
      { error: 'İlan eşleştirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 