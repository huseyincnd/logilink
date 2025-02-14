import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50 opacity-70"></div>
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-blue-50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Lojistik Dünyasının Buluşma Noktası
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-3xl mx-auto">
              Taşıyıcılar ve mal sahipleri için güvenilir, hızlı ve modern platform
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/ilanlar"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                İlanları Görüntüle
              </a>
              <a
                href="/ilan-ver"
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition transform hover:scale-105 shadow-lg hover:shadow-xl border-2 border-blue-600"
              >
                İlan Ver
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            Neden <span className="text-blue-600">LogiLink</span>?
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl transform transition hover:scale-105">
              <div className="text-4xl mb-6 bg-white w-16 h-16 rounded-xl flex items-center justify-center shadow-md">🚛</div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Güvenilir Taşıyıcılar</h3>
              <p className="text-gray-600 leading-relaxed">
                Onaylanmış ve güvenilir taşıyıcılarla çalışın. Her taşıyıcı detaylı bir doğrulama sürecinden geçer.
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl transform transition hover:scale-105">
              <div className="text-4xl mb-6 bg-white w-16 h-16 rounded-xl flex items-center justify-center shadow-md">💼</div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Kolay İlan Verme</h3>
              <p className="text-gray-600 leading-relaxed">
                Dakikalar içinde ilanınızı oluşturun. Modern ve kullanıcı dostu arayüz ile hızlı işlem yapın.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-2xl transform transition hover:scale-105">
              <div className="text-4xl mb-6 bg-white w-16 h-16 rounded-xl flex items-center justify-center shadow-md">🌍</div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Geniş Ağ</h3>
              <p className="text-gray-600 leading-relaxed">
                Türkiye ve Avrupa genelinde geniş taşımacılık ağı. Binlerce aktif kullanıcı ile hızlı çözümler.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-blue-100">Aktif Taşıyıcı</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">8000+</div>
              <div className="text-blue-100">Tamamlanan Taşıma</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">3000+</div>
              <div className="text-blue-100">Mal Sahibi</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-blue-100">Ülke</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6 text-gray-800">
                Hemen İlanınızı Oluşturun
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Binlerce taşıyıcı ve mal sahibi ile buluşun. Güvenli ve hızlı lojistik çözümleri için LogiLink yanınızda.
              </p>
              <a
                href="/ilan-ver"
                className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Ücretsiz İlan Ver
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
