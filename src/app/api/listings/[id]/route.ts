import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Listing from '@/models/Listing';

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    await dbConnect();

    const data = await request.json();

    // İlanı güncelle
    const listing = await Listing.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error('İlan güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'İlan güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // İlanı sil
    await listing.deleteOne();

    return NextResponse.json({ message: 'İlan başarıyla silindi' });
  } catch (error) {
    console.error('İlan silme hatası:', error);
    return NextResponse.json(
      { error: 'İlan silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await dbConnect();

    const listing = await Listing.findById(id)
      .populate('userId', 'name companyName')
      .populate('eslesmisKullanici', 'name companyName')
      .lean();

    if (!listing) {
      return NextResponse.json({ error: 'İlan bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error('İlan detayı getirme hatası:', error);
    return NextResponse.json(
      { error: 'İlan detayı getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 