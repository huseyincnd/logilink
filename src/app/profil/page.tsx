'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import AuthCheck from '@/components/AuthCheck';
import RatingList from '@/components/RatingList';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  companyName?: string;
  companyType?: string;
  phone?: string;
  address?: string;
  rating: number;
  totalRatings: number;
  completedDeliveries: number;
  createdAt: string;
}

export default function ProfilPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'genel' | 'degerlendirmeler'>('genel');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/users/${session.user.id}`);
        if (!response.ok) {
          throw new Error('Profil bilgileri alınamadı');
        }
        const data = await response.json();
        console.log('API Response:', data);

        // Default değerleri ekle
        setProfile({
          ...data,
          rating: data.rating || 0,
          totalRatings: data.totalRatings || 0,
          completedDeliveries: data.completedDeliveries || 0
        });
      } catch (error) {
        console.error('Profil getirme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session?.user?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Profil bilgileri yüklenemedi</p>
      </div>
    );
  }

  // Rating değerlerini güvenli bir şekilde formatla
  const formattedRating = (profile.rating || 0).toFixed(1);
  const totalRatings = profile.totalRatings || 0;
  const completedDeliveries = profile.completedDeliveries || 0;

  return (
    <AuthCheck>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profil Başlığı */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`}
                alt={profile.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {profile.name}
              </h1>
              {profile.companyName && (
                <p className="text-lg text-gray-600 mb-2">{profile.companyName}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Üyelik: {profile._id ? new Date(parseInt(profile._id.substring(0, 8), 16) * 1000).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Belirtilmemiş'}</span>
                <span>•</span>
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span>{formattedRating}</span>
                  <span className="ml-1">({totalRatings} değerlendirme)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-sm text-gray-500 mb-1">Toplam Değerlendirme</div>
            <div className="text-2xl font-bold text-gray-900">{totalRatings}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-sm text-gray-500 mb-1">Ortalama Puan</div>
            <div className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="text-yellow-400 mr-2">★</span>
              {formattedRating}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-sm text-gray-500 mb-1">Tamamlanan Teslimat</div>
            <div className="text-2xl font-bold text-gray-900">{completedDeliveries}</div>
          </div>
        </div>

        {/* Sekmeler */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('genel')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'genel'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Genel Bilgiler
              </button>
              <button
                onClick={() => setActiveTab('degerlendirmeler')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'degerlendirmeler'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Değerlendirmeler
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'genel' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">İletişim Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">E-posta</div>
                      <div className="text-gray-900">{profile.email}</div>
                    </div>
                    {profile.phone && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Telefon</div>
                        <div className="text-gray-900">{profile.phone}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Firma Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profile.companyName && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Firma Adı</div>
                        <div className="text-gray-900">{profile.companyName}</div>
                      </div>
                    )}
                    {profile.companyType && (
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Firma Türü</div>
                        <div className="text-gray-900">{profile.companyType}</div>
                      </div>
                    )}
                    {profile.address && (
                      <div className="md:col-span-2">
                        <div className="text-sm text-gray-500 mb-1">Adres</div>
                        <div className="text-gray-900">{profile.address}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <RatingList userId={profile._id} />
            )}
          </div>
        </div>
      </div>
    </AuthCheck>
  );
} 