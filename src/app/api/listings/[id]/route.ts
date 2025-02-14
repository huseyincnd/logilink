import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Listing from '@/models/Listing';
import { verifyAuth } from '@/lib/auth';

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
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    await dbConnect();

    // İlanı sil
    const listing = await Listing.findByIdAndDelete(id);

    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
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
  context: { params: { id: string } }
) {
  try {
    // Await params before using
    const params = await context.params;
    const { id } = params;
    
    await dbConnect();

    const listing = await Listing.findById(id)
      .populate('userId', 'name companyName rating totalRatings memberSince completedDeliveries')
      .populate('eslesmisKullanici', 'name companyName rating totalRatings memberSince completedDeliveries')
      .lean();
    
    if (!listing) {
      return NextResponse.json(
        { error: 'İlan bulunamadı' },
        { status: 404 }
      );
    }

    console.log('Populate edilmiş ilan:', listing);

    return NextResponse.json(listing);
  } catch (error: any) {
    console.error('İlan getirme hatası:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu', details: error.message },
      { status: 500 }
    );
  }
} 