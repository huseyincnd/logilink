'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Arac {
  tip: string;
  kapasite: string;
  ozellikler: string[];
}

interface YukBilgisi {
  tip: string;
  miktar: string;
  gereklilikler: string[];
}

interface Ilan {
  _id: string;
  userId: {
    name: string;
    companyName: string;
  };
  tip: "taşıyıcı" | "mal_sahibi";
  nereden: string;
  nereye: string;
  detay: string;
  arac?: Arac;
  yukBilgisi?: YukBilgisi;
  iletisim: string;
  fiyat: {
    miktar: number;
    birim: string;
  };
  yuklemeTarihi: string;
  teslimatTarihi: string;
  durum: string;
  createdAt: string;
}

export default function IlanlarPage() {
  // Filtreleme state'leri
  const [tip, setTip] = useState<"hepsi" | "taşıyıcı" | "mal_sahibi">("hepsi");
  const [nereden, setNereden] = useState("");
  const [nereye, setNereye] = useState("");
  const [minFiyat, setMinFiyat] = useState("");
  const [maxFiyat, setMaxFiyat] = useState("");
  const [baslangicTarihi, setBaslangicTarihi] = useState("");
  const [bitisTarihi, setBitisTarihi] = useState("");
  const [aracTuru, setAracTuru] = useState("");
  const [yukTuru, setYukTuru] = useState("");
  const [siralama, setSiralama] = useState("tarih_yeni");
  const [gelismisArama, setGelismisArama] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const itemsPerPage = 10;

  const router = useRouter();

  // İlanları API'den çek
  useEffect(() => {
    const fetchIlanlar = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/listings');
        if (!response.ok) {
          throw new Error('İlanlar yüklenirken bir hata oluştu');
        }
        const data = await response.json();
        setIlanlar(data);
      } catch (error) {
        console.error('İlanları getirme hatası:', error);
        setError('İlanlar yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchIlanlar();
  }, []);

  // Filtreleme fonksiyonu
  const filtreliIlanlar = ilanlar.filter(ilan => {
    if (tip !== "hepsi" && ilan.tip !== tip) return false;
    if (nereden && !ilan.nereden.toLowerCase().includes(nereden.toLowerCase())) return false;
    if (nereye && !ilan.nereye.toLowerCase().includes(nereye.toLowerCase())) return false;
    if (minFiyat && ilan.fiyat && ilan.fiyat.miktar < Number(minFiyat)) return false;
    if (maxFiyat && ilan.fiyat && ilan.fiyat.miktar > Number(maxFiyat)) return false;
    if (baslangicTarihi && ilan.yuklemeTarihi < baslangicTarihi) return false;
    if (bitisTarihi && ilan.teslimatTarihi > bitisTarihi) return false;
    if (aracTuru && ilan.arac && !ilan.arac.tip.toLowerCase().includes(aracTuru.toLowerCase())) return false;
    if (yukTuru && ilan.yukBilgisi && !ilan.yukBilgisi.tip.toLowerCase().includes(yukTuru.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    switch (siralama) {
      case "fiyat_artan":
        return (a.fiyat?.miktar || 0) - (b.fiyat?.miktar || 0);
      case "fiyat_azalan":
        return (b.fiyat?.miktar || 0) - (a.fiyat?.miktar || 0);
      case "tarih_eski":
        return new Date(a.yuklemeTarihi).getTime() - new Date(b.yuklemeTarihi).getTime();
      default: // tarih_yeni
        return new Date(b.yuklemeTarihi).getTime() - new Date(a.yuklemeTarihi).getTime();
    }
  });

  const totalPages = Math.ceil(filtreliIlanlar.length / itemsPerPage);
  const currentItems = filtreliIlanlar.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Gelişmiş Filtreleme Sidebar */}
          <div className="w-full md:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-4 animate-fade-in">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">Filtrele</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İlan Tipi
                  </label>
                  <select 
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-gray-600 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                    value={tip}
                    onChange={(e) => setTip(e.target.value as "hepsi" | "taşıyıcı" | "mal_sahibi")}
                  >
                    <option value="hepsi">Tümü</option>
                    <option value="taşıyıcı">Taşıyıcı İlanları</option>
                    <option value="mal_sahibi">Mal Sahibi İlanları</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nereden
                  </label>
                  <input
                    type="text"
                    placeholder="Şehir ara"
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-gray-600 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                    value={nereden}
                    onChange={(e) => setNereden(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nereye
                  </label>
                  <input
                    type="text"
                    placeholder="Şehir ara"
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-gray-600 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                    value={nereye}
                    onChange={(e) => setNereye(e.target.value)}
                  />
                </div>

                {gelismisArama && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fiyat Aralığı (TL)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          className="w-1/2 border border-gray-200 rounded-xl p-2.5 text-gray-600 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                          value={minFiyat}
                          onChange={(e) => setMinFiyat(e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          className="w-1/2 border border-gray-200 rounded-xl p-2.5 text-gray-600 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                          value={maxFiyat}
                          onChange={(e) => setMaxFiyat(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tarih Aralığı
                      </label>
                      <div className="space-y-2">
                        <input
                          type="date"
                          className="w-full border border-gray-200 rounded-xl p-2.5 text-gray-600 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                          value={baslangicTarihi}
                          onChange={(e) => setBaslangicTarihi(e.target.value)}
                        />
                        <input
                          type="date"
                          className="w-full border border-gray-200 rounded-xl p-2.5 text-gray-600 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                          value={bitisTarihi}
                          onChange={(e) => setBitisTarihi(e.target.value)}
                        />
                      </div>
                    </div>

                    {tip === "taşıyıcı" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Araç Türü
                        </label>
                        <input
                          type="text"
                          placeholder="Araç türü ara"
                          className="w-full border border-gray-200 rounded-xl p-2.5 text-gray-600 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                          value={aracTuru}
                          onChange={(e) => setAracTuru(e.target.value)}
                        />
                      </div>
                    )}

                    {tip === "mal_sahibi" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Yük Türü
                        </label>
                        <input
                          type="text"
                          placeholder="Yük türü ara"
                          className="w-full border border-gray-200 rounded-xl p-2.5 text-gray-600 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                          value={yukTuru}
                          onChange={(e) => setYukTuru(e.target.value)}
                        />
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={() => setGelismisArama(!gelismisArama)}
                  className="w-full text-sm text-blue-600 hover:text-blue-700 focus:outline-none"
                >
                  {gelismisArama ? 'Daha Az Filtre' : 'Gelişmiş Filtrele'}
                </button>
              </div>
            </div>
          </div>

          {/* İlan Listesi */}
          <div className="flex-1">
            {/* Sıralama ve Sonuç Sayısı */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-gray-600">
                {filtreliIlanlar.length} ilan bulundu
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sırala:</label>
                <select
                  className="border border-gray-200 rounded-xl p-2 text-gray-600 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                  value={siralama}
                  onChange={(e) => setSiralama(e.target.value)}
                >
                  <option value="tarih_yeni">Tarihe Göre (Yeni)</option>
                  <option value="tarih_eski">Tarihe Göre (Eski)</option>
                  <option value="fiyat_artan">Fiyata Göre (Artan)</option>
                  <option value="fiyat_azalan">Fiyata Göre (Azalan)</option>
                </select>
              </div>
            </div>

            {/* İlanlar */}
            <div className="space-y-4">
              {currentItems.map((ilan) => (
                <div
                  key={ilan._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition cursor-pointer"
                  onClick={() => router.push(`/ilanlar/${ilan._id}`)}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          ilan.tip === 'taşıyıcı' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {ilan.tip === 'taşıyıcı' ? 'Taşıyıcı İlanı' : 'Mal Sahibi İlanı'}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {new Date(ilan.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {ilan.nereden} → {ilan.nereye}
                      </h3>

                      <p className="text-gray-600 mb-4">{ilan.detay}</p>

                      {ilan.arac && (
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-700">Araç Bilgileri:</div>
                          <div className="text-gray-600">
                            {ilan.arac.tip} - {ilan.arac.kapasite}
                            {ilan.arac.ozellikler.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {ilan.arac.ozellikler.map((ozellik, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 rounded-lg text-sm text-gray-600"
                                  >
                                    {ozellik}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {ilan.yukBilgisi && (
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-700">Yük Bilgileri:</div>
                          <div className="text-gray-600">
                            {ilan.yukBilgisi.tip} - {ilan.yukBilgisi.miktar}
                            {ilan.yukBilgisi.gereklilikler.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {ilan.yukBilgisi.gereklilikler.map((gereklilik, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 rounded-lg text-sm text-gray-600"
                                  >
                                    {gereklilik}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Yükleme:</span>{' '}
                          {new Date(ilan.yuklemeTarihi).toLocaleDateString('tr-TR')}
                        </div>
                        <div>
                          <span className="font-medium">Teslimat:</span>{' '}
                          {new Date(ilan.teslimatTarihi).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </div>

                    <div className="md:w-64 flex flex-col justify-between">
                      <div>
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          {ilan.fiyat.miktar.toLocaleString('tr-TR')} {ilan.fiyat.birim}
                        </div>
                        <div className="text-gray-600">
                          {ilan.userId?.companyName || 'İsimsiz Kullanıcı'}
                        </div>
                      </div>

                      <div className="mt-4 md:mt-0">
                        <a
                          href={`tel:${ilan.iletisim}`}
                          className="w-full bg-blue-600 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-medium hover:bg-blue-700 transition transform hover:scale-105"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                          </svg>
                          İletişime Geç
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sayfalama */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-xl ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 