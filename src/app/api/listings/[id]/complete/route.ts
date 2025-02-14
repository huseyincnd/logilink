import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Listing from '@/models/Listing';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Params'ı await et
    const { id } = await params;

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

    // İlanın eşleşmiş olduğundan emin ol
    if (listing.durum !== 'eşleşti') {
      return NextResponse.json(
        { error: 'Bu ilan henüz eşleşmemiş' },
        { status: 400 }
      );
    }

    // İlanı güncelle
    listing.durum = 'tamamlandı';
    listing.tamamlanmaTarihi = new Date();
    await listing.save();

    return NextResponse.json({ message: 'İlan başarıyla tamamlandı' });
  } catch (error: any) {
    console.error('İlan tamamlama hatası:', error);
    return NextResponse.json(
      { error: 'İlan tamamlanırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 