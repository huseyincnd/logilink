export default function IstatistiklerPage() {
  // Örnek istatistik verileri (backend entegrasyonunda API'dan gelecek)
  const istatistikler = {
    genelIstatistikler: {
      aktifIlanSayisi: 1250,
      tamamlananTasima: 8500,
      aktifKullaniciSayisi: 3200,
      toplamUlkeSayisi: 15
    },
    populerRotalar: [
      { nereden: "İstanbul", nereye: "Berlin", tasimaSayisi: 450, ortalamaFiyat: "€2,300" },
      { nereden: "Ankara", nereye: "Paris", tasimaSayisi: 380, ortalamaFiyat: "€2,500" },
      { nereden: "İzmir", nereye: "Amsterdam", tasimaSayisi: 320, ortalamaFiyat: "€2,400" },
      { nereden: "Bursa", nereye: "Milano", tasimaSayisi: 290, ortalamaFiyat: "€2,100" },
      { nereden: "Mersin", nereye: "Hamburg", tasimaSayisi: 270, ortalamaFiyat: "€2,600" }
    ],
    aylikTrendler: [
      { ay: "Ocak", tasimaSayisi: 720 },
      { ay: "Şubat", tasimaSayisi: 680 },
      { ay: "Mart", tasimaSayisi: 820 },
      { ay: "Nisan", tasimaSayisi: 750 },
      { ay: "Mayıs", tasimaSayisi: 890 },
      { ay: "Haziran", tasimaSayisi: 920 }
    ],
    aracTipleriDagilimi: [
      { tip: "Tır", yuzde: 45 },
      { tip: "Kamyon", yuzde: 35 },
      { tip: "Kamyonet", yuzde: 20 }
    ]
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Platform İstatistikleri
        </h1>

        {/* Genel İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {istatistikler.genelIstatistikler.aktifIlanSayisi.toLocaleString()}
            </div>
            <div className="text-gray-600">Aktif İlan</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {istatistikler.genelIstatistikler.tamamlananTasima.toLocaleString()}
            </div>
            <div className="text-gray-600">Tamamlanan Taşıma</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {istatistikler.genelIstatistikler.aktifKullaniciSayisi.toLocaleString()}
            </div>
            <div className="text-gray-600">Aktif Kullanıcı</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {istatistikler.genelIstatistikler.toplamUlkeSayisi}+
            </div>
            <div className="text-gray-600">Ülke</div>
          </div>
        </div>

        {/* Popüler Rotalar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12 animate-fade-in">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">En Popüler Rotalar</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-4 text-gray-600 font-medium">Rota</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-medium">Taşıma Sayısı</th>
                  <th className="text-left py-4 px-4 text-gray-600 font-medium">Ortalama Fiyat</th>
                </tr>
              </thead>
              <tbody>
                {istatistikler.populerRotalar.map((rota, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span>{rota.nereden}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        <span>{rota.nereye}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">{rota.tasimaSayisi.toLocaleString()}</td>
                    <td className="py-4 px-4">{rota.ortalamaFiyat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Aylık Trendler */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fade-in">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Aylık Taşıma Trendi</h2>
            <div className="h-64 flex items-end gap-4">
              {istatistikler.aylikTrendler.map((ay, index) => {
                const yuzde = (ay.tasimaSayisi / 1000) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-blue-100 rounded-t-lg transition-all duration-500 hover:bg-blue-200"
                      style={{ height: `${yuzde}%` }}
                    ></div>
                    <div className="text-sm text-gray-600">{ay.ay}</div>
                    <div className="text-sm font-medium">{ay.tasimaSayisi}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Araç Tipleri Dağılımı */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-fade-in">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Araç Tipleri Dağılımı</h2>
            <div className="space-y-4">
              {istatistikler.aracTipleriDagilimi.map((arac, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{arac.tip}</span>
                    <span className="font-medium">{arac.yuzde}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${arac.yuzde}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 