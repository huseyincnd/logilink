'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/giris') {
      const redirectPath = encodeURIComponent(pathname);
      router.replace(`/giris?redirect=${redirectPath}`);
    }
  }, [status, pathname, router]);

  // Yükleme durumunda loading göster
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa ve giriş sayfasında değilse null döndür
  if (status === 'unauthenticated' && pathname !== '/giris') {
    return null;
  }

  // Kullanıcı giriş yapmışsa içeriği göster
  return <>{children}</>;
} 