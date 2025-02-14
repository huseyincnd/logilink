'use client';

import { useEffect, useState } from 'react';

interface Rating {
  _id: string;
  fromUserId: {
    _id: string;
    name: string;
    companyName?: string;
  };
  ilanId: {
    _id: string;
    nereden: string;
    nereye: string;
    tip: 'taşıyıcı' | 'mal_sahibi';
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface RatingListProps {
  userId: string;
}

export default function RatingList({ userId }: RatingListProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('RatingList bileşeni yüklendi, userId:', userId);
    
    const fetchRatings = async () => {
      if (!userId) {
        console.log('userId boş, istek yapılmıyor');
        setLoading(false);
        return;
      }

      try {
        const url = `/api/ratings?toUserId=${userId}`;
        console.log('Değerlendirmeler için istek yapılıyor:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Değerlendirmeler yüklenirken bir hata oluştu');
        }

        console.log('Gelen değerlendirmeler:', data);
        setRatings(data);
      } catch (err: any) {
        console.error('Değerlendirme getirme hatası:', err);
        setError(err.message || 'Değerlendirmeler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        {error}
      </div>
    );
  }

  if (ratings.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        Henüz değerlendirme yapılmamış
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ratings.map((rating) => (
        <div key={rating._id} className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">
              {rating.fromUserId.companyName || rating.fromUserId.name}
            </div>
            <div className="flex items-center">
              <span className="text-yellow-400 mr-1">★</span>
              <span>{rating.rating}</span>
            </div>
          </div>
          <div className="text-sm text-gray-500 mb-2">
            {rating.ilanId.nereden} → {rating.ilanId.nereye}
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100">
              {rating.ilanId.tip === 'taşıyıcı' ? 'Taşıyıcı İlanı' : 'Mal Sahibi İlanı'}
            </span>
          </div>
          <p className="text-gray-600">{rating.comment}</p>
          <div className="text-gray-400 text-sm mt-2">
            {new Date(rating.createdAt).toLocaleDateString('tr-TR')}
          </div>
        </div>
      ))}
    </div>
  );
} 