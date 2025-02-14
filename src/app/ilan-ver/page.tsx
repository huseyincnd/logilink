'use client';

import { useRouter } from 'next/navigation';
import AuthCheck from '@/components/AuthCheck';
import { useState } from 'react';
import CityInput from '@/components/CityInput';
import { useSession } from 'next-auth/react';

export default function IlanVerPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [ilanTipi, setIlanTipi] = useState<'taşıyıcı' | 'mal_sahibi'>('taşıyıcı');
  const [formData, setFormData] = useState({
    nereden: '',
    nereye: '',
    detay: '',
    arac: {
      tip: '',
      kapasite: '',
      ozellikler: [] as string[],
      kasaTipi: '',
      frigoSicaklik: '',
      tasmaOlcusu: '',
      lashingKapasitesi: '',
      rampaYuksekligi: '',
      ekOzellikler: [] as string[]
    },
    yukBilgisi: {
      tip: '',
      miktar: '',
      gereklilikler: [] as string[],
      uzunluk: '',
      genislik: '',
      yukseklik: '',
      agirlik: '',
      paketlemeTipi: '',
      tehlikeliMadde: false,
      unKodu: '',
      sicaklikIhtiyaci: '',
      ozelTasimaGereklilikleri: [] as string[]
    },
    iletisim: '',
    fiyat: '',
    yuklemeTarihi: '',
    teslimatTarihi: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (status !== 'authenticated' || !session) {
      alert('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      router.push('/giris');
      return;
    }
    
    // Form validasyonu
    if (!formData.nereden || !formData.nereye || !formData.detay || !formData.iletisim) {
      alert('Lütfen zorunlu alanları doldurun');
      return;
    }

    try {
      // İlan verilerini hazırla
      const ilanData = {
        tip: ilanTipi,
        nereden: formData.nereden,
        nereye: formData.nereye,
        detay: formData.detay,
        ...(ilanTipi === 'taşıyıcı' ? { arac: formData.arac } : { yukBilgisi: formData.yukBilgisi }),
        iletisim: formData.iletisim,
        fiyat: {
          miktar: parseFloat(formData.fiyat),
          birim: 'TL'
        },
        yuklemeTarihi: formData.yuklemeTarihi,
        teslimatTarihi: formData.teslimatTarihi,
        durum: 'aktif'
      };

      // İlanı API'ye gönder
      const createResponse = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ilanData),
      });

      if (!createResponse.ok) {
        const data = await createResponse.json();
        throw new Error(data.error || data.details || 'İlan oluşturulurken bir hata oluştu');
      }

      // Başarılı
      alert('İlanınız başarıyla yayınlandı!');
      router.push('/ilanlarim'); // İlanlarım sayfasına yönlendir
    } catch (error: any) {
      console.error('İlan verme hatası:', error);
      alert(`İlan verilirken bir hata oluştu: ${error.message}`);
    }
  };

  const aracTipleri = [
    { value: 'tenteli', label: 'Tenteli' },
    { value: 'frigorifik', label: 'Frigorifik' },
    { value: 'flatRack', label: 'Flat Rack' },
    { value: 'openTop', label: 'Open Top' },
    { value: 'lowbed', label: 'Lowbed' },
    { value: 'mega', label: 'Mega' },
    { value: 'kapali', label: 'Kapalı Kasa' },
    { value: 'platform', label: 'Platform' },
    { value: 'tanker', label: 'Tanker' },
    { value: 'silo', label: 'Silo' }
  ];

  const kasaTipleri = [
    { value: 'standart', label: 'Standart' },
    { value: 'jumbo', label: 'Jumbo' },
    { value: 'mega', label: 'Mega' },
    { value: 'tasmasiz', label: 'Taşmasız' },
    { value: 'tasmali', label: 'Taşmalı' }
  ];

  const aracOzellikleri = [
    'Frigorifik',
    'GPS Takip',
    'CMR Belgeli',
    'ADR Belgeli',
    'Lashing Noktaları',
    'Hidrolik Rampa',
    'Forklift Taşıyabilir',
    'Çift Katlı Yükleme',
    'Zincir Bağlama',
    'RFID Takip'
  ];

  const ozelTasimaGereklilikleri = [
    'Kapalı Kasa',
    'Nem Kontrolü',
    'Soğuk Zincir',
    'Özel Sabitleme',
    'Darbe Sensörü',
    'Yük Güvenliği',
    'Sıcaklık Kaydı',
    'Özel Sigorta',
    'Eskort Hizmet',
    'Gümrük Geçişi'
  ];

  return (
    <AuthCheck>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">İlan Ver</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-scale-in">
          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-2">
              İlan Tipi
            </label>
            <div className="flex gap-4">
              <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer transition hover:border-blue-400 hover:bg-blue-50">
                <input
                  type="radio"
                  name="ilanTipi"
                  value="taşıyıcı"
                  checked={ilanTipi === 'taşıyıcı'}
                  onChange={(e) => setIlanTipi(e.target.value as 'taşıyıcı' | 'mal_sahibi')}
                  className="mr-2"
                />
                <div>
                  <div className="font-medium">Taşıyıcı İlanı</div>
                  <div className="text-sm text-gray-500">Taşıma hizmeti vermek istiyorum</div>
                </div>
              </label>
              <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer transition hover:border-blue-400 hover:bg-blue-50">
                <input
                  type="radio"
                  name="ilanTipi"
                  value="mal_sahibi"
                  checked={ilanTipi === 'mal_sahibi'}
                  onChange={(e) => setIlanTipi(e.target.value as 'taşıyıcı' | 'mal_sahibi')}
                  className="mr-2"
                />
                <div>
                  <div className="font-medium">Mal Sahibi İlanı</div>
                  <div className="text-sm text-gray-500">Yük taşıtmak istiyorum</div>
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Nereden <span className="text-red-500">*</span>
              </label>
              <CityInput
                value={formData.nereden}
                onChange={(value) => setFormData({...formData, nereden: value})}
                placeholder="Yükleme Noktası"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Nereye <span className="text-red-500">*</span>
              </label>
              <CityInput
                value={formData.nereye}
                onChange={(value) => setFormData({...formData, nereye: value})}
                placeholder="Teslimat Noktası"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-2">
              Detay <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={formData.detay}
              onChange={(e) => setFormData({...formData, detay: e.target.value})}
              className="w-full border border-gray-200 rounded-xl p-3 h-32 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
              placeholder="İlan detaylarını yazın..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Yükleme Tarihi
              </label>
              <input
                type="date"
                value={formData.yuklemeTarihi}
                onChange={(e) => setFormData({...formData, yuklemeTarihi: e.target.value})}
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Teslimat Tarihi
              </label>
              <input
                type="date"
                value={formData.teslimatTarihi}
                onChange={(e) => setFormData({...formData, teslimatTarihi: e.target.value})}
                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-2">
              Fiyat (TL)
            </label>
            <input
              type="number"
              value={formData.fiyat}
              onChange={(e) => setFormData({...formData, fiyat: e.target.value})}
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
              placeholder="0"
            />
          </div>

          {ilanTipi === 'taşıyıcı' ? (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-semibold text-lg text-gray-800">Araç Bilgileri</h3>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Araç Tipi
                </label>
                <select 
                  value={formData.arac.tip}
                  onChange={(e) => setFormData({
                    ...formData,
                    arac: { ...formData.arac, tip: e.target.value }
                  })}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                >
                  <option value="">Seçiniz</option>
                  {aracTipleri.map(tip => (
                    <option key={tip.value} value={tip.value}>{tip.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Kasa Tipi
                </label>
                <select 
                  value={formData.arac.kasaTipi}
                  onChange={(e) => setFormData({
                    ...formData,
                    arac: { ...formData.arac, kasaTipi: e.target.value }
                  })}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                >
                  <option value="">Seçiniz</option>
                  {kasaTipleri.map(tip => (
                    <option key={tip.value} value={tip.value}>{tip.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Kapasite
                </label>
                <input
                  type="text"
                  value={formData.arac.kapasite}
                  onChange={(e) => setFormData({
                    ...formData,
                    arac: { ...formData.arac, kapasite: e.target.value }
                  })}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                  placeholder="Örn: 40 ton"
                />
              </div>

              {formData.arac.tip === 'frigorifik' && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Frigorifik Sıcaklık Aralığı
                  </label>
                  <input
                    type="text"
                    value={formData.arac.frigoSicaklik}
                    onChange={(e) => setFormData({
                      ...formData,
                      arac: { ...formData.arac, frigoSicaklik: e.target.value }
                    })}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                    placeholder="Örn: -20°C / +4°C"
                  />
                </div>
              )}

              {formData.arac.kasaTipi === 'tasmali' && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Taşma Ölçüsü
                  </label>
                  <input
                    type="text"
                    value={formData.arac.tasmaOlcusu}
                    onChange={(e) => setFormData({
                      ...formData,
                      arac: { ...formData.arac, tasmaOlcusu: e.target.value }
                    })}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                    placeholder="Örn: 1.5 metre"
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Lashing Kapasitesi
                </label>
                <input
                  type="text"
                  value={formData.arac.lashingKapasitesi}
                  onChange={(e) => setFormData({
                    ...formData,
                    arac: { ...formData.arac, lashingKapasitesi: e.target.value }
                  })}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                  placeholder="Örn: 2000 kg/nokta"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Rampa Yüksekliği
                </label>
                <input
                  type="text"
                  value={formData.arac.rampaYuksekligi}
                  onChange={(e) => setFormData({
                    ...formData,
                    arac: { ...formData.arac, rampaYuksekligi: e.target.value }
                  })}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                  placeholder="Örn: 1.2 metre"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Araç Özellikleri
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {aracOzellikleri.map((ozellik) => (
                    <label 
                      key={ozellik} 
                      className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer transition hover:border-blue-400 hover:bg-blue-50"
                    >
                      <input
                        type="checkbox"
                        checked={formData.arac.ozellikler.includes(ozellik)}
                        onChange={(e) => {
                          const yeniOzellikler = e.target.checked
                            ? [...formData.arac.ozellikler, ozellik]
                            : formData.arac.ozellikler.filter(o => o !== ozellik);
                          setFormData({
                            ...formData,
                            arac: { ...formData.arac, ozellikler: yeniOzellikler }
                          });
                        }}
                        className="mr-2"
                      />
                      <span>{ozellik}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Ek Özellikler
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {ozelTasimaGereklilikleri.map((ozellik) => (
                    <label 
                      key={ozellik} 
                      className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer transition hover:border-blue-400 hover:bg-blue-50"
                    >
                      <input
                        type="checkbox"
                        checked={formData.arac.ekOzellikler.includes(ozellik)}
                        onChange={(e) => {
                          const yeniOzellikler = e.target.checked
                            ? [...formData.arac.ekOzellikler, ozellik]
                            : formData.arac.ekOzellikler.filter(o => o !== ozellik);
                          setFormData({
                            ...formData,
                            arac: { ...formData.arac, ekOzellikler: yeniOzellikler }
                          });
                        }}
                        className="mr-2"
                      />
                      <span>{ozellik}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <h3 className="font-semibold text-lg text-gray-800">Yük Bilgileri</h3>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Yük Tipi
                </label>
                <input
                  type="text"
                  value={formData.yukBilgisi.tip}
                  onChange={(e) => setFormData({
                    ...formData,
                    yukBilgisi: { ...formData.yukBilgisi, tip: e.target.value }
                  })}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                  placeholder="Örn: Tekstil, Gıda, vb."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Uzunluk (metre)
                  </label>
                  <input
                    type="text"
                    value={formData.yukBilgisi.uzunluk}
                    onChange={(e) => setFormData({
                      ...formData,
                      yukBilgisi: { ...formData.yukBilgisi, uzunluk: e.target.value }
                    })}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                    placeholder="Örn: 13.6"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Genişlik (metre)
                  </label>
                  <input
                    type="text"
                    value={formData.yukBilgisi.genislik}
                    onChange={(e) => setFormData({
                      ...formData,
                      yukBilgisi: { ...formData.yukBilgisi, genislik: e.target.value }
                    })}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                    placeholder="Örn: 2.4"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Yükseklik (metre)
                  </label>
                  <input
                    type="text"
                    value={formData.yukBilgisi.yukseklik}
                    onChange={(e) => setFormData({
                      ...formData,
                      yukBilgisi: { ...formData.yukBilgisi, yukseklik: e.target.value }
                    })}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                    placeholder="Örn: 2.7"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Ağırlık (ton)
                  </label>
                  <input
                    type="text"
                    value={formData.yukBilgisi.agirlik}
                    onChange={(e) => setFormData({
                      ...formData,
                      yukBilgisi: { ...formData.yukBilgisi, agirlik: e.target.value }
                    })}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                    placeholder="Örn: 24"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Paketleme Tipi
                </label>
                <input
                  type="text"
                  value={formData.yukBilgisi.paketlemeTipi}
                  onChange={(e) => setFormData({
                    ...formData,
                    yukBilgisi: { ...formData.yukBilgisi, paketlemeTipi: e.target.value }
                  })}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                  placeholder="Örn: Palet, Koli, vb."
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.yukBilgisi.tehlikeliMadde}
                    onChange={(e) => setFormData({
                      ...formData,
                      yukBilgisi: { ...formData.yukBilgisi, tehlikeliMadde: e.target.checked }
                    })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-semibold">Tehlikeli Madde</span>
                </label>
              </div>

              {formData.yukBilgisi.tehlikeliMadde && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    UN Kodu
                  </label>
                  <input
                    type="text"
                    value={formData.yukBilgisi.unKodu}
                    onChange={(e) => setFormData({
                      ...formData,
                      yukBilgisi: { ...formData.yukBilgisi, unKodu: e.target.value }
                    })}
                    className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                    placeholder="Örn: UN1203"
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Sıcaklık İhtiyacı
                </label>
                <input
                  type="text"
                  value={formData.yukBilgisi.sicaklikIhtiyaci}
                  onChange={(e) => setFormData({
                    ...formData,
                    yukBilgisi: { ...formData.yukBilgisi, sicaklikIhtiyaci: e.target.value }
                  })}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                  placeholder="Örn: -18°C / +4°C"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Özel Taşıma Gereklilikleri
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {ozelTasimaGereklilikleri.map((gereklilik) => (
                    <label 
                      key={gereklilik}
                      className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer transition hover:border-blue-400 hover:bg-blue-50"
                    >
                      <input
                        type="checkbox"
                        checked={formData.yukBilgisi.ozelTasimaGereklilikleri.includes(gereklilik)}
                        onChange={(e) => {
                          const yeniGereklilikler = e.target.checked
                            ? [...formData.yukBilgisi.ozelTasimaGereklilikleri, gereklilik]
                            : formData.yukBilgisi.ozelTasimaGereklilikleri.filter(g => g !== gereklilik);
                          setFormData({
                            ...formData,
                            yukBilgisi: { ...formData.yukBilgisi, ozelTasimaGereklilikleri: yeniGereklilikler }
                          });
                        }}
                        className="mr-2"
                      />
                      <span>{gereklilik}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <label className="block text-gray-700 font-semibold mb-2">
              İletişim Bilgileri <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.iletisim}
              onChange={(e) => setFormData({...formData, iletisim: e.target.value})}
              className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
              placeholder="Telefon Numarası"
            />
          </div>

          <div className="mt-8">
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white rounded-xl py-4 font-semibold hover:bg-blue-700 transition transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              İlanı Yayınla
            </button>
          </div>
        </form>
      </div>
    </AuthCheck>
  );
} 