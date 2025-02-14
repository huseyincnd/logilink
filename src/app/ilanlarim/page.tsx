'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import AuthCheck from '@/components/AuthCheck';

interface Listing {
  _id: string;
  tip: 'taşıyıcı' | 'mal_sahibi';
  nereden: string;
  nereye: string;
  durum: string;
  yuklemeTarihi: string;
  teslimatTarihi: string;
  fiyat: {
    miktar: number;
    birim: string;
  };
  userId: {
    _id: string;
    name: string;
    companyName: string;
  };
  eslesmisKullanici?: {
    _id: string;
    name: string;
    companyName: string;
  };
  createdAt: string;
}

export default function IlanlarimPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'aktif' | 'tamamlandi' | 'iptal'>('aktif');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        let durumFilter = '';
        
        switch (activeTab) {
          case 'aktif':
            durumFilter = 'aktif,eşleşti';
            break;
          case 'tamamlandi':
            durumFilter = 'tamamlandı';
            break;
          case 'iptal':
            durumFilter = 'iptal';
            break;
        }

        const response = await fetch(
          `/api/listings?userId=${session.user.id}&durum=${durumFilter}`
        );
        
        if (!response.ok) {
          throw new Error('İlanlar yüklenirken bir hata oluştu');
        }

        const data = await response.json();
        setListings(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [session?.user?.id, activeTab]);

  return (
    <AuthCheck>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">İlanlarım</h1>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('aktif')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'aktif'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Aktif İlanlar
            </button>
            <button
              onClick={() => setActiveTab('tamamlandi')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tamamlandi'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tamamlanan İlanlar
            </button>
            <button
              onClick={() => setActiveTab('iptal')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'iptal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              İptal Edilen İlanlar
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-8">{error}</div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Bu kategoride ilan bulunamadı</p>
            <Link
              href="/ilan-ver"
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
            >
              Yeni İlan Ver
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((ilan) => (
              <div
                key={ilan._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ilan.tip === 'taşıyıcı' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {ilan.tip === 'taşıyıcı' ? 'Taşıyıcı İlanı' : 'Mal Sahibi İlanı'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ilan.durum === 'aktif' ? 'bg-yellow-100 text-yellow-700' :
                        ilan.durum === 'eşleşti' ? 'bg-blue-100 text-blue-700' :
                        ilan.durum === 'tamamlandı' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {ilan.durum.charAt(0).toUpperCase() + ilan.durum.slice(1)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">
                      {ilan.nereden} → {ilan.nereye}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {ilan.fiyat.miktar.toLocaleString('tr-TR')} {ilan.fiyat.birim}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(ilan.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">Yükleme:</span>{' '}
                    {new Date(ilan.yuklemeTarihi).toLocaleDateString('tr-TR')}
                  </div>
                  <div>
                    <span className="font-medium">Teslimat:</span>{' '}
                    {new Date(ilan.teslimatTarihi).toLocaleDateString('tr-TR')}
                  </div>
                </div>

                {ilan.eslesmisKullanici && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                    <div className="font-medium text-gray-700 mb-1">Eşleşilen Kullanıcı</div>
                    <div>{ilan.eslesmisKullanici.companyName || ilan.eslesmisKullanici.name}</div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/ilanlar/${ilan._id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 rounded-xl hover:bg-blue-700 transition"
                  >
                    İlanı Görüntüle
                  </Link>
                  {ilan.durum === 'tamamlandı' && !ilan.eslesmisKullanici && (
                    <Link
                      href={`/degerlendirme/${ilan._id}`}
                      className="flex-1 bg-green-600 text-white text-center py-2 rounded-xl hover:bg-green-700 transition"
                    >
                      Değerlendir
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthCheck>
  );
} 