'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import RatingForm from '@/components/RatingForm';
import RatingList from '@/components/RatingList';
import Modal from '@/components/Modal';

interface Ilan {
  _id: string;
  userId: {
    _id: string;
    name: string;
    companyName?: string;
    rating?: number;
    totalRatings?: number;
    memberSince?: string;
    completedDeliveries?: number;
  };
  tip: 'taşıyıcı' | 'mal_sahibi';
  nereden: string;
  nereye: string;
  detay: string;
  arac?: {
    tip: string;
    kapasite: string;
    ozellikler: string[];
    kasaTipi: string;
    frigoSicaklik?: string;
    tasmaOlcusu?: string;
    lashingKapasitesi?: string;
    rampaYuksekligi?: string;
    ekOzellikler: string[];
  };
  yukBilgisi?: {
    tip: string;
    miktar: string;
    gereklilikler: string[];
    uzunluk?: string;
    genislik?: string;
    yukseklik?: string;
    agirlik?: string;
    paketlemeTipi?: string;
    tehlikeliMadde: boolean;
    unKodu?: string;
    sicaklikIhtiyaci?: string;
    ozelTasimaGereklilikleri: string[];
  };
  iletisim: string;
  fiyat: {
    miktar: number;
    birim: string;
  };
  yuklemeTarihi: string;
  teslimatTarihi: string;
  durum: string;
  createdAt: string;
  eslesmisKullanici?: string | { name: string; companyName?: string };
  basvuranlar?: Array<{ _id: string, name: string, companyName?: string }>;
}

export default function IlanDetay() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [ilan, setIlan] = useState<Ilan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [basvuranlar, setBasvuranlar] = useState<Array<{ _id: string, name: string, companyName?: string }>>([]);

  useEffect(() => {
    console.log('Session durumu:', {
      session: session,
      userId: session?.user?.id,
      email: session?.user?.email
    });
  }, [session]);

  useEffect(() => {
    const fetchIlan = async () => {
      try {
        const response = await fetch(`/api/listings/${id}`);
        if (!response.ok) {
          throw new Error('İlan bulunamadı');
        }
        const data = await response.json();
        console.log('Gelen ilan verisi:', data);
        if (!data.userId?._id) {
          console.error('İlan sahibi ID\'si bulunamadı:', data);
        }
        setIlan(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchIlan();
  }, [id]);

  const handleMatch = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`/api/listings/${id}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser })
      });

      if (!response.ok) throw new Error('Eşleştirme başarısız oldu');

      // İlanı güncelle
      setIlan(prev => prev ? { ...prev, durum: 'eşleşti', eslesmisKullanici: selectedUser } : null);
      setShowMatchModal(false);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleComplete = async () => {
    try {
      const response = await fetch(`/api/listings/${id}/complete`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('İş tamamlama başarısız oldu');

      // Değerlendirme sayfasına yönlendir
      router.push(`/degerlendirme/${id}`);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleApply = async () => {
    if (status !== 'authenticated' || !session) {
      alert('Başvuru yapabilmek için giriş yapmanız gerekmektedir.');
      router.push('/giris');
      return;
    }

    try {
      const response = await fetch(`/api/listings/${id}/basvur`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Başvuru yapılırken bir hata oluştu');
      }

      alert('Başvurunuz başarıyla alındı!');
      window.location.reload();
    } catch (error: any) {
      console.error('Başvuru hatası:', error);
      alert(error.message);
    }
  };

  // İlana başvuranları getir
  useEffect(() => {
    if (ilan?.durum === 'aktif' && session?.user?.id === ilan.userId._id) {
      fetch(`/api/listings/${id}/basvuranlar`)
        .then(res => res.json())
        .then(data => setBasvuranlar(data))
        .catch(err => console.error('Başvuranlar yüklenirken hata:', err));
    }
  }, [ilan, session]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !ilan) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error || 'İlan bulunamadı'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Üst Bilgi Kartı */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  ilan.tip === 'taşıyıcı' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {ilan.tip === 'taşıyıcı' ? 'Taşıyıcı İlanı' : 'Mal Sahibi İlanı'}
                </span>
                <span className="text-gray-500 text-sm">
                  {new Date(ilan.createdAt).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {ilan.nereden} → {ilan.nereye}
              </h1>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {ilan.fiyat.miktar.toLocaleString('tr-TR')} {ilan.fiyat.birim}
              </div>
              <div className="flex flex-col gap-2">
                {/* İlan sahibi değilse ve ilan aktifse başvuru butonu göster */}
                {session?.user?.id !== ilan.userId._id && ilan.durum === 'aktif' && (
                  <button
                    onClick={handleApply}
                    className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-green-700 transition transform hover:scale-105 shadow-sm hover:shadow-md w-full md:w-auto"
                  >
                    İlana Başvur
                  </button>
                )}
                <button 
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition transform hover:scale-105 shadow-sm hover:shadow-md w-full md:w-auto"
                  onClick={() => window.location.href = `tel:${ilan.iletisim}`}
                >
                  İletişime Geç
                </button>
              </div>
            </div>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sol Kolon - İlan Detayları */}
          <div className="lg:col-span-2 space-y-6">
            {/* İlan Sahibi Bilgileri */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">İlan Sahibi</h2>
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 rounded-full p-4">
                  <span className="text-2xl text-blue-600">
                    {ilan.userId?.name ? ilan.userId.name.charAt(0).toUpperCase() : '?'}
                  </span>
            </div>
            <div>
                  <div className="font-medium text-lg">
                    {ilan.userId?.companyName || ilan.userId?.name || 'İsimsiz Kullanıcı'}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">⭐</span>
                      <span>{ilan.userId?.rating?.toFixed(1) || 'Yeni'}</span>
                      {ilan.userId?.totalRatings && (
                        <span className="ml-1">({ilan.userId.totalRatings})</span>
                      )}
            </div>
                    {ilan.userId?.memberSince && (
            <div>
                        {new Date(ilan.userId.memberSince).getFullYear()}'den beri üye
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {ilan.userId?.completedDeliveries && ilan.userId.completedDeliveries > 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-xl text-green-700 text-sm">
                  ✓ {ilan.userId.completedDeliveries} başarılı taşıma tamamlandı
                </div>
              )}
            </div>

            {/* Detay Bilgileri */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">İlan Detayı</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{ilan.detay}</p>
        </div>

            {/* Araç veya Yük Bilgileri */}
            {ilan.tip === 'taşıyıcı' && ilan.arac && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Araç Bilgileri</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-gray-500 text-sm">Araç Tipi</div>
                    <div className="font-medium">{ilan.arac.tip}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm">Kasa Tipi</div>
                    <div className="font-medium">{ilan.arac.kasaTipi}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm">Kapasite</div>
                    <div className="font-medium">{ilan.arac.kapasite}</div>
                  </div>
                  {ilan.arac.frigoSicaklik && (
                    <div>
                      <div className="text-gray-500 text-sm">Frigorifik Sıcaklık</div>
                      <div className="font-medium">{ilan.arac.frigoSicaklik}</div>
                    </div>
                  )}
                  {ilan.arac.tasmaOlcusu && (
                    <div>
                      <div className="text-gray-500 text-sm">Taşma Ölçüsü</div>
                      <div className="font-medium">{ilan.arac.tasmaOlcusu}</div>
                    </div>
                  )}
                  {ilan.arac.lashingKapasitesi && (
                    <div>
                      <div className="text-gray-500 text-sm">Lashing Kapasitesi</div>
                      <div className="font-medium">{ilan.arac.lashingKapasitesi}</div>
                    </div>
                  )}
                  {ilan.arac.rampaYuksekligi && (
                    <div>
                      <div className="text-gray-500 text-sm">Rampa Yüksekliği</div>
                      <div className="font-medium">{ilan.arac.rampaYuksekligi}</div>
                    </div>
                  )}
                </div>

                {ilan.arac.ozellikler.length > 0 && (
                  <div className="mt-6">
                    <div className="text-gray-500 text-sm mb-2">Araç Özellikleri</div>
                    <div className="flex flex-wrap gap-2">
                      {ilan.arac.ozellikler.map((ozellik, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          {ozellik}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {ilan.arac.ekOzellikler.length > 0 && (
                  <div className="mt-4">
                    <div className="text-gray-500 text-sm mb-2">Ek Özellikler</div>
                    <div className="flex flex-wrap gap-2">
                      {ilan.arac.ekOzellikler.map((ozellik, index) => (
                        <span key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                          {ozellik}
                        </span>
                      ))}
                  </div>
                </div>
                )}
              </div>
            )}

            {ilan.tip === 'mal_sahibi' && ilan.yukBilgisi && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Yük Bilgileri</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-gray-500 text-sm">Yük Tipi</div>
                    <div className="font-medium">{ilan.yukBilgisi.tip}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm">Miktar</div>
                    <div className="font-medium">{ilan.yukBilgisi.miktar}</div>
                  </div>
                  {ilan.yukBilgisi.uzunluk && (
                    <div>
                      <div className="text-gray-500 text-sm">Uzunluk</div>
                      <div className="font-medium">{ilan.yukBilgisi.uzunluk} metre</div>
                    </div>
                  )}
                  {ilan.yukBilgisi.genislik && (
                    <div>
                      <div className="text-gray-500 text-sm">Genişlik</div>
                      <div className="font-medium">{ilan.yukBilgisi.genislik} metre</div>
                    </div>
                  )}
                  {ilan.yukBilgisi.yukseklik && (
                    <div>
                      <div className="text-gray-500 text-sm">Yükseklik</div>
                      <div className="font-medium">{ilan.yukBilgisi.yukseklik} metre</div>
                    </div>
                  )}
                  {ilan.yukBilgisi.agirlik && (
                    <div>
                      <div className="text-gray-500 text-sm">Ağırlık</div>
                      <div className="font-medium">{ilan.yukBilgisi.agirlik} ton</div>
                    </div>
                  )}
                  {ilan.yukBilgisi.paketlemeTipi && (
                    <div>
                      <div className="text-gray-500 text-sm">Paketleme Tipi</div>
                      <div className="font-medium">{ilan.yukBilgisi.paketlemeTipi}</div>
                    </div>
                  )}
                  {ilan.yukBilgisi.tehlikeliMadde && ilan.yukBilgisi.unKodu && (
                    <div>
                      <div className="text-gray-500 text-sm">UN Kodu</div>
                      <div className="font-medium">{ilan.yukBilgisi.unKodu}</div>
                    </div>
                  )}
                  {ilan.yukBilgisi.sicaklikIhtiyaci && (
                    <div>
                      <div className="text-gray-500 text-sm">Sıcaklık İhtiyacı</div>
                      <div className="font-medium">{ilan.yukBilgisi.sicaklikIhtiyaci}</div>
                    </div>
                  )}
                </div>

                {ilan.yukBilgisi.gereklilikler.length > 0 && (
                  <div className="mt-6">
                    <div className="text-gray-500 text-sm mb-2">Gereklilikler</div>
                    <div className="flex flex-wrap gap-2">
                      {ilan.yukBilgisi.gereklilikler.map((gereklilik, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          {gereklilik}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {ilan.yukBilgisi.ozelTasimaGereklilikleri.length > 0 && (
                  <div className="mt-4">
                    <div className="text-gray-500 text-sm mb-2">Özel Taşıma Gereklilikleri</div>
                    <div className="flex flex-wrap gap-2">
                      {ilan.yukBilgisi.ozelTasimaGereklilikleri.map((gereklilik, index) => (
                        <span key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                          {gereklilik}
                        </span>
                      ))}
                  </div>
                </div>
                )}
              </div>
            )}

            {/* İlan Durumu ve Aksiyonlar */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">İlan Durumu</h2>
              
              {/* Debug Bilgileri */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="font-medium mb-2">Durum Bilgileri:</h3>
                <ul className="space-y-2">
                  <li><strong>Oturum durumu:</strong> {session ? 'Açık ✅' : 'Kapalı ❌'}</li>
                  <li><strong>Kullanıcı ID:</strong> {session?.user?.id || 'Oturum açılmamış'}</li>
                  <li><strong>İlan sahibi ID:</strong> {ilan.userId._id}</li>
                  <li><strong>İlan durumu:</strong> {ilan.durum}</li>
                  <li><strong>Başvuranlar:</strong> {ilan.basvuranlar?.length || 0} kişi</li>
                  <li><strong>İlanı eşleştirebilir misiniz?</strong> {
                    session?.user?.id === ilan.userId._id && ilan.durum === 'aktif' 
                    ? 'Evet ✅' 
                    : 'Hayır ❌'
                  }</li>
                </ul>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    ilan.durum === 'aktif' ? 'bg-green-100 text-green-800' :
                    ilan.durum === 'eşleşti' ? 'bg-blue-100 text-blue-800' :
                    ilan.durum === 'tamamlandı' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {ilan.durum.charAt(0).toUpperCase() + ilan.durum.slice(1)}
                  </span>
                </div>
                <div className="space-x-4">
                  {/* İlan sahibiyse ve ilan aktifse eşleştirme butonu göster */}
                  {session?.user?.id === ilan.userId._id && ilan.durum === 'aktif' && (
                    <button
                      onClick={() => setShowMatchModal(true)}
                      className="w-full bg-blue-600 text-white rounded-xl py-4 font-semibold hover:bg-blue-700 transition"
                    >
                      İlanı Eşleştir
                    </button>
                  )}
                  
                  {/* İlan sahibiyse ve ilan eşleşmişse tamamlama butonu göster */}
                  {session?.user?.id === ilan.userId._id && ilan.durum === 'eşleşti' && (
                    <button
                      onClick={handleComplete}
                      className="w-full bg-green-600 text-white rounded-xl py-4 font-semibold hover:bg-green-700 transition"
                    >
                      İşi Tamamla
                    </button>
                  )}
            </div>
          </div>

              {/* Eşleşmiş kullanıcı bilgisi */}
              {ilan.eslesmisKullanici && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                  <div className="text-sm text-blue-600 font-medium mb-1">
                    Eşleşilen Kullanıcı
                  </div>
                  <div className="font-medium">
                    {typeof ilan.eslesmisKullanici === 'string' ? ilan.eslesmisKullanici : ilan.eslesmisKullanici.name}
                    {typeof ilan.eslesmisKullanici === 'object' && ilan.eslesmisKullanici.companyName && (
                      <span className="text-gray-500 ml-2">
                        ({ilan.eslesmisKullanici.companyName})
                      </span>
                    )}
                  </div>
                </div>
              )}
                </div>
              </div>

          {/* Sağ Kolon - Tarih ve İletişim */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Tarih Bilgileri</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-gray-500 text-sm">Yükleme Tarihi</div>
                  <div className="font-medium">{new Date(ilan.yuklemeTarihi).toLocaleDateString('tr-TR')}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Teslimat Tarihi</div>
                  <div className="font-medium">{new Date(ilan.teslimatTarihi).toLocaleDateString('tr-TR')}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">İletişim</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-gray-500 text-sm">Telefon</div>
                  <div className="font-medium">{ilan.iletisim}</div>
                </div>
                <button 
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition transform hover:scale-105 shadow-sm hover:shadow-md"
                  onClick={() => window.location.href = `tel:${ilan.iletisim}`}
                >
                  Hemen Ara
                </button>
              </div>
            </div>

            {/* Değerlendirme Bölümü */}
            {session?.user && session.user.id !== ilan.userId._id && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Değerlendirme Yap</h2>
                </div>

                <RatingForm
                  ilanId={ilan._id}
                  toUserId={ilan.userId._id}
                />
              </div>
            )}

            {/* Değerlendirmeler Listesi */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Değerlendirmeler</h2>
              {ilan.userId?._id ? (
                <RatingList userId={ilan.userId._id} />
              ) : (
                <div className="text-gray-500 text-center py-4">
                  İlan sahibi bilgisi yüklenemedi
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Eşleştirme Modal */}
      <Modal isOpen={showMatchModal} onClose={() => setShowMatchModal(false)}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">İlanı Eşleştir</h2>
          <div className="space-y-4">
            {Array.isArray(basvuranlar) && basvuranlar.length > 0 ? (
              basvuranlar.map(user => (
                <label
                  key={user._id}
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${
                    selectedUser === user._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="selectedUser"
                    value={user._id}
                    checked={selectedUser === user._id}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">{user.name}</div>
                    {user.companyName && (
                      <div className="text-sm text-gray-500">{user.companyName}</div>
                    )}
                  </div>
                </label>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                Henüz başvuru yapılmamış
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowMatchModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              onClick={handleMatch}
              disabled={!selectedUser}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Eşleştir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 