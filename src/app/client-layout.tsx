'use client';

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (error) {
      console.error('Çıkış hatası:', error);
      alert('Çıkış yapılırken bir hata oluştu');
    }
  };

  const isActivePath = (path: string) => pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                LogiLink
              </Link>
              <div className="ml-10 flex items-center space-x-6">
                <Link 
                  href="/ilanlar" 
                  className={`text-gray-600 hover:text-blue-600 font-medium transition ${isActivePath('/ilanlar') ? 'text-blue-600' : ''}`}
                >
                  İlanlar
                </Link>
                {status === 'authenticated' && (
                  <>
                    <Link 
                      href="/ilan-ver" 
                      className={`text-gray-600 hover:text-blue-600 font-medium transition ${isActivePath('/ilan-ver') ? 'text-blue-600' : ''}`}
                    >
                      İlan Ver
                    </Link>
                    <Link 
                      href="/ilanlarim" 
                      className={`text-gray-600 hover:text-blue-600 font-medium transition ${isActivePath('/ilanlarim') ? 'text-blue-600' : ''}`}
                    >
                      İlanlarım
                    </Link>
                    <Link 
                      href="/degerlendirmelerim" 
                      className={`text-gray-600 hover:text-blue-600 font-medium transition ${isActivePath('/degerlendirmeler') ? 'text-blue-600' : ''}`}
                    >
                      Değerlendirmelerim
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center">
              {status === 'authenticated' ? (
                <div ref={menuRef} className="relative">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="text-gray-600 hover:text-blue-600 font-medium transition"
                  >
                    {session.user?.name || 'Hesabım'}
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <Link 
                        href="/profil" 
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profil Bilgilerim
                      </Link>
                      <Link 
                        href="/hesap-ayarlari" 
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Hesap Ayarları
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/giris" className="text-gray-600 hover:text-blue-600 font-medium transition">
                    Giriş Yap
                  </Link>
                  <Link href="/kayit" className="text-gray-600 hover:text-blue-600 font-medium transition">
                    Kaydol
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">LogiLink</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-600 hover:text-blue-600">Ana Sayfa</Link></li>
                <li><Link href="/ilanlar" className="text-gray-600 hover:text-blue-600">İlanlar</Link></li>
                {status === 'authenticated' && (
                  <>
                    <li><Link href="/ilan-ver" className="text-gray-600 hover:text-blue-600">İlan Ver</Link></li>
                    <li><Link href="/ilanlarim" className="text-gray-600 hover:text-blue-600">İlanlarım</Link></li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Hızlı Erişim</h3>
              <ul className="space-y-2">
                {status === 'authenticated' ? (
                  <>
                    <li><Link href="/profil" className="text-gray-600 hover:text-blue-600">Profil Bilgilerim</Link></li>
                    <li><Link href="/hesap-ayarlari" className="text-gray-600 hover:text-blue-600">Hesap Ayarları</Link></li>
                    <li><Link href="/degerlendirmelerim" className="text-gray-600 hover:text-blue-600">Değerlendirmelerim</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link href="/giris" className="text-gray-600 hover:text-blue-600">Giriş Yap</Link></li>
                    <li><Link href="/kayit" className="text-gray-600 hover:text-blue-600">Kaydol</Link></li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Destek</h3>
              <ul className="space-y-2">
                <li><Link href="/yardim" className="text-gray-600 hover:text-blue-600">Yardım Merkezi</Link></li>
                <li><Link href="/iletisim" className="text-gray-600 hover:text-blue-600">İletişim</Link></li>
                <li><Link href="/hakkimizda" className="text-gray-600 hover:text-blue-600">Hakkımızda</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">İletişim</h3>
              <ul className="space-y-2">
                <li className="text-gray-600">Email: info@logilink.com</li>
                <li className="text-gray-600">Tel: +90 (212) 123 45 67</li>
                <li className="text-gray-600">Adres: İstanbul, Türkiye</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100">
            <p className="text-center text-gray-600">
              © 2024 LogiLink. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 