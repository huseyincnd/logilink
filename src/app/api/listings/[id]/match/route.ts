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

    // Request body'den seçilen taşıyıcı ID'sini al
    const { carrierId } = await request.json();
    if (!carrierId) {
      return NextResponse.json(
        { error: 'Taşıyıcı ID\'si gerekli' },
        { status: 400 }
      );
    }

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

    // İlanın aktif olduğundan emin ol
    if (listing.durum !== 'aktif') {
      return NextResponse.json(
        { error: 'Bu ilan artık aktif değil' },
        { status: 400 }
      );
    }

    // Seçilen taşıyıcının başvuranlar arasında olduğundan emin ol
    if (!listing.basvuranlar.includes(carrierId)) {
      return NextResponse.json(
        { error: 'Seçilen taşıyıcı bu ilana başvurmamış' },
        { status: 400 }
      );
    }

    // İlanı güncelle
    listing.durum = 'eşleşti';
    listing.eslestigiKullanici = carrierId;
    listing.eslesmeTarihi = new Date();
    await listing.save();

    return NextResponse.json({ message: 'İlan başarıyla eşleştirildi' });
  } catch (error: any) {
    console.error('Eşleştirme hatası:', error);
    return NextResponse.json(
      { error: 'Eşleştirme yapılırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 