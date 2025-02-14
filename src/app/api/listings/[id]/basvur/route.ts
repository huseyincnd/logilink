import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Listing from '@/models/Listing';

type Context = {
  params: {
    id: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function POST(
  request: NextRequest,
  context: Context
) {
  try {
    const { id } = context.params;

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

    // İlan sahibinin kendisine başvurmasını engelle
    if (listing.userId.toString() === session.user.id) {
      return NextResponse.json(
        { error: 'Kendi ilanınıza başvuramazsınız' },
        { status: 400 }
      );
    }

    // İlanın aktif olduğundan emin ol
    if (listing.durum !== 'aktif') {
      return NextResponse.json(
        { error: 'Bu ilan artık aktif değil' },
        { status: 400 }
      );
    }

    // Daha önce başvuru yapılmış mı kontrol et
    if (listing.basvuranlar.includes(session.user.id)) {
      return NextResponse.json(
        { error: 'Bu ilana zaten başvurdunuz' },
        { status: 400 }
      );
    }

    // Başvuruyu kaydet
    listing.basvuranlar.push(session.user.id);
    await listing.save();

    return NextResponse.json({ message: 'Başvurunuz alındı' });
  } catch (error: any) {
    console.error('Başvuru hatası:', error);
    return NextResponse.json(
      { error: 'Başvuru yapılırken bir hata oluştu' },
      { status: 500 }
    );
  }
}