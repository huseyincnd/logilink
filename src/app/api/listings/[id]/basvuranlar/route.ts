import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Listing from '@/models/Listing';
import User from '@/models/User';

export async function GET(
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

    // Başvuranları getir
    const basvuranlar = await User.find(
      { _id: { $in: listing.basvuranlar || [] } },
      'name companyName'
    );

    return NextResponse.json(basvuranlar);
  } catch (error: any) {
    console.error('Başvuranlar getirme hatası:', error);
    return NextResponse.json(
      { error: 'Başvuranlar yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 