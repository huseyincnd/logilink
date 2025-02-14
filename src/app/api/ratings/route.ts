import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Rating from '@/models/Rating';
import User from '@/models/User';
import Listing from '@/models/Listing';

// Kullanıcının değerlendirmelerini getirme
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const toUserId = searchParams.get('toUserId');
    const fromUserId = searchParams.get('fromUserId');

    if (!toUserId && !fromUserId) {
      return NextResponse.json({ error: 'toUserId veya fromUserId gerekli' }, { status: 400 });
    }

    await dbConnect();

    // Sorgu kriterlerini oluştur
    const query = toUserId ? { toUserId } : { fromUserId };

    const ratings = await Rating.find(query)
      .populate('fromUserId', 'name companyName')
      .populate('toUserId', 'name companyName')
      .populate('ilanId', 'nereden nereye tip')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(ratings);
  } catch (error: any) {
    console.error('Değerlendirme getirme hatası:', error);
    return NextResponse.json(
      { error: 'Değerlendirmeler getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Değerlendirme oluşturma
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 });
    }

    const body = await request.json();
    const { ilanId, toUserId, rating, comment } = body;

    // Validasyon
    if (!ilanId || !toUserId || !rating) {
      return NextResponse.json(
        { error: 'İlan ID, değerlendirilecek kullanıcı ID ve puan gereklidir' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Puan 1-5 arasında olmalıdır' },
        { status: 400 }
      );
    }

    await dbConnect();

    // İlanı kontrol et
    const listing = await Listing.findById(ilanId);
    if (!listing) {
      return NextResponse.json({ error: 'İlan bulunamadı' }, { status: 404 });
    }

    // İlanın tamamlanmış olduğundan emin ol
    if (listing.durum !== 'tamamlandı') {
      return NextResponse.json(
        { error: 'Bu ilan henüz tamamlanmamış olduğu için değerlendirme yapılamaz' },
        { status: 400 }
      );
    }

    // Kullanıcının bu ilanla ilgisi olduğundan emin ol
    const isInvolved = 
      listing.userId.toString() === session.user.id || 
      (listing.eslesmisKullanici && listing.eslesmisKullanici.toString() === session.user.id);

    if (!isInvolved) {
      return NextResponse.json(
        { error: 'Bu ilanı değerlendirme yetkiniz yok' },
        { status: 403 }
      );
    }

    // Doğru kullanıcıyı değerlendirdiğinden emin ol
    const isValidTarget = 
      (listing.userId.toString() === session.user.id && listing.eslesmisKullanici.toString() === toUserId) ||
      (listing.eslesmisKullanici.toString() === session.user.id && listing.userId.toString() === toUserId);

    if (!isValidTarget) {
      return NextResponse.json(
        { error: 'Geçersiz değerlendirme hedefi' },
        { status: 400 }
      );
    }

    // Daha önce değerlendirme yapılmış mı kontrol et
    const existingRating = await Rating.findOne({
      ilanId,
      fromUserId: session.user.id
    });

    if (existingRating) {
      return NextResponse.json(
        { error: 'Bu ilan için zaten değerlendirme yapmışsınız' },
        { status: 400 }
      );
    }

    // Değerlendirmeyi kaydet
    const newRating = await Rating.create({
      ilanId,
      fromUserId: session.user.id,
      toUserId,
      rating,
      comment: comment || '',
      createdAt: new Date()
    });

    // Kullanıcının ortalama puanını güncelle
    const allRatings = await Rating.find({ toUserId });
    const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allRatings.length;

    await User.findByIdAndUpdate(toUserId, {
      $set: {
        rating: Math.round(averageRating * 10) / 10,
        totalRatings: allRatings.length
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Değerlendirmeniz başarıyla kaydedildi',
      rating: newRating
    });
  } catch (error: any) {
    console.error('Değerlendirme kaydetme hatası:', error);
    return NextResponse.json(
      { error: 'Değerlendirme kaydedilirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 