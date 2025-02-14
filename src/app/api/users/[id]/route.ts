import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User, { IUser } from '@/models/User';
import Rating from '@/models/Rating';
import Listing from '@/models/Listing';
import { Types } from 'mongoose';

interface UserWithStats {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
  companyType?: string;
  address?: string;
  createdAt: Date;
  rating: number;
  totalRatings: number;
  fiveStarRatings: number;
  satisfactionRate: number;
  completedDeliveries: number;
}

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum gerekli' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Params'ı await et
    const params = await context.params;
    const { id } = params;

    // Kullanıcı bilgilerini getir
    const userDoc = await User.findById(id).select(
      '_id email name phone companyName companyType address createdAt rating totalRatings completedDeliveries'
    ).lean<IUser>();

    if (!userDoc) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Değerlendirme istatistiklerini getir
    const ratings = await Rating.find({ toUserId: new Types.ObjectId(id) });
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0
      ? ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings
      : 0;
    const fiveStarRatings = ratings.filter(r => r.rating === 5).length;
    const satisfactionRate = totalRatings > 0
      ? Math.round((ratings.filter(r => r.rating >= 4).length / totalRatings) * 100)
      : 0;

    // Tamamlanan teslimatları getir
    const completedListings = await Listing.countDocuments({
      $or: [
        { userId: new Types.ObjectId(id), durum: 'tamamlandı' },
        { eslesmisKullanici: new Types.ObjectId(id), durum: 'tamamlandı' }
      ]
    });

    // Kullanıcı bilgilerine istatistikleri ekle
    const userWithStats: UserWithStats = {
      _id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      phone: userDoc.phone,
      companyName: userDoc.companyName,
      companyType: userDoc.companyType,
      address: userDoc.address,
      createdAt: userDoc.createdAt,
      rating: Math.round(averageRating * 10) / 10,
      totalRatings,
      fiveStarRatings,
      satisfactionRate,
      completedDeliveries: completedListings
    };

    // Kullanıcı kendi profilini veya public profili görüntüleyebilir
    if (session.user.id !== id) {
      // Diğer kullanıcıların profillerinde hassas bilgileri gizle
      delete userWithStats.email;
      delete userWithStats.phone;
      delete userWithStats.address;
    }

    return NextResponse.json(userWithStats);
  } catch (error: any) {
    console.error('Kullanıcı getirme hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcı bilgileri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 