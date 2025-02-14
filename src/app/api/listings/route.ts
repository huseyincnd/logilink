import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// İlan oluşturma
export async function POST(request: Request) {
  console.log('Listings API: POST isteği alındı');
  try {
    await dbConnect();

    // Session kontrolü
    const session = await getServerSession(authOptions);
    console.log('Listings API: Session:', session);

    if (!session?.user?.id) {
      console.log('Listings API: Oturum bulunamadı');
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    const data = await request.json();
    console.log('Listings API: Gelen veri:', data);

    const listing = await Listing.create({
      ...data,
      userId: session.user.id
    });

    console.log('Listings API: İlan oluşturuldu');
    return NextResponse.json({
      success: true,
      listing
    });
  } catch (error: any) {
    console.error('Listings API: İlan oluşturma hatası:', error);
    return NextResponse.json(
      { 
        error: 'İlan oluşturulurken bir hata oluştu',
        details: error.message || 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

// Tüm ilanları getir
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const durum = searchParams.get('durum');

    let query: any = {};

    // Kullanıcıya özel ilanlar için filtre
    if (userId) {
      query.$or = [
        { userId: userId },
        { eslesmisKullanici: userId }
      ];
    }

    // Durum filtresi
    if (durum) {
      if (durum === 'aktif,eşleşti') {
        query.durum = { $in: ['aktif', 'eşleşti'] };
      } else if (durum === 'tamamlandı') {
        query.durum = 'tamamlandı';
      } else if (durum === 'iptal') {
        query.durum = 'iptal';
      } else {
        query.durum = durum;
      }
    } else {
      // Varsayılan olarak aktif ilanları getir
      query.durum = 'aktif';
    }

    console.log('Listings API Query:', query); // Debug için

    const listings = await Listing.find(query)
      .sort({ createdAt: -1 }) // En yeni ilanlar önce
      .populate('userId', 'name companyName')
      .populate('eslesmisKullanici', 'name companyName')
      .lean();

    console.log('Listings API Results:', listings.length); // Debug için

    return NextResponse.json(listings);
  } catch (error) {
    console.error('İlanları getirme hatası:', error);
    return NextResponse.json(
      { error: 'İlanlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 