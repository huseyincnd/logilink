'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import AuthCheck from '@/components/AuthCheck';

interface Rating {
  _id: string;
  fromUserId: {
    _id: string;
    name: string;
    companyName?: string;
  };
  toUserId: {
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

export default function DegerlendirmelerimPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'alinan' | 'verilen'>('alinan');
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    fiveStarRatings: 0,
    satisfactionRate: 0
  });

  useEffect(() => {
    const fetchRatings = async () => {
      if (!session?.user?.id) return;

      try {
        const url = activeTab === 'alinan' 
          ? `/api/ratings?toUserId=${session.user.id}`
          : `/api/ratings?fromUserId=${session.user.id}`;
        
        console.log('Fetching ratings from:', url);
        const response = await fetch(url);
        const data = await response.json();
        console.log('API Response:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Değerlendirmeler yüklenemedi');
        }

        // API yanıtı array değilse veya boşsa boş array kullan
        const ratingsArray = Array.isArray(data) ? data : [];
        setRatings(ratingsArray);

        // İstatistikleri hesapla (alınan değerlendirmeler için)
        if (activeTab === 'alinan' && ratingsArray.length > 0) {
          const totalRatings = ratingsArray.length;
          const averageRating = ratingsArray.reduce((acc: number, curr: Rating) => acc + curr.rating, 0) / totalRatings;
          const fiveStarRatings = ratingsArray.filter((r: Rating) => r.rating === 5).length;
          const satisfactionRate = Math.round((ratingsArray.filter((r: Rating) => r.rating >= 4).length / totalRatings) * 100);

          setStats({
            averageRating,
            totalRatings,
            fiveStarRatings,
            satisfactionRate
          });
        } else if (activeTab === 'verilen') {
          // Verilen değerlendirmeler için istatistikleri sıfırla
          setStats({
            averageRating: 0,
            totalRatings: 0,
            fiveStarRatings: 0,
            satisfactionRate: 0
          });
        }
      } catch (error: any) {
        console.error('Değerlendirme getirme hatası:', error);
        console.error('Hata detayı:', error.message);
        setRatings([]);
        setStats({
          averageRating: 0,
          totalRatings: 0,
          fiveStarRatings: 0,
          satisfactionRate: 0
        });
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchRatings();
  }, [session?.user?.id, activeTab]);

  return (
    <AuthCheck>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Değerlendirmelerim
          </h1>
        </div>

        {/* Değerlendirme İstatistikleri */}
        {activeTab === 'alinan' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">{stats.averageRating.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Ortalama Puan</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">{stats.totalRatings}</div>
                <div className="text-sm text-gray-600">Toplam Değerlendirme</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">{stats.fiveStarRatings}</div>
                <div className="text-sm text-gray-600">5 Yıldız</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">%{stats.satisfactionRate}</div>
                <div className="text-sm text-gray-600">Memnuniyet Oranı</div>
              </div>
            </div>
          </div>
        )}

        {/* Değerlendirme Tabları */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('alinan')}
            className={`px-6 py-2 rounded-xl font-medium transition ${
              activeTab === 'alinan'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Alınan Değerlendirmeler
          </button>
          <button
            onClick={() => setActiveTab('verilen')}
            className={`px-6 py-2 rounded-xl font-medium transition ${
              activeTab === 'verilen'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Verilen Değerlendirmeler
          </button>
        </div>

        {/* Yükleniyor */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Değerlendirmeler Listesi */}
        {!loading && (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div 
                key={rating._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-fade-in"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        rating.ilanId.tip === "taşıyıcı" 
                          ? "bg-green-50 text-green-700" 
                          : "bg-blue-50 text-blue-700"
                      }`}>
                        {rating.ilanId.tip === "taşıyıcı" ? "Taşıyıcı" : "Yük"}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(rating.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    <Link 
                      href={`/ilanlar/${rating.ilanId._id}`}
                      className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-2 hover:text-blue-600 transition"
                    >
                      <span>{rating.ilanId.nereden}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <span>{rating.ilanId.nereye}</span>
                    </Link>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= rating.rating
                            ? 'text-yellow-400'
                            : 'text-gray-200'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-600">{rating.comment}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
                      {activeTab === 'alinan' 
                        ? (rating.fromUserId?.name || 'A').charAt(0).toUpperCase()
                        : (rating.toUserId?.name || 'A').charAt(0).toUpperCase()
                      }
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {activeTab === 'alinan'
                          ? rating.fromUserId?.name || 'Anonim'
                          : rating.toUserId?.name || 'Anonim'
                        }
                      </div>
                      {((activeTab === 'alinan' ? rating.fromUserId?.companyName : rating.toUserId?.companyName)) && (
                        <div className="text-sm text-gray-500">
                          {activeTab === 'alinan'
                            ? rating.fromUserId?.companyName
                            : rating.toUserId?.companyName
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {ratings.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Henüz Değerlendirme Yok</h3>
                <p className="text-gray-600">
                  {activeTab === 'alinan' 
                    ? 'Henüz hiç değerlendirme almadınız.'
                    : 'Henüz hiç değerlendirme yapmadınız.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AuthCheck>
  );
} 