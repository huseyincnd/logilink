'use client';

import { useEffect, useState, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { StarIcon } from '@heroicons/react/24/solid';
import RatingForm from '@/components/RatingForm';

interface Ilan {
  _id: string;
  userId: string | {
    _id: string;
    name: string;
    companyName?: string;
  };
  eslesmisKullanici: string | {
    _id: string;
    name: string;
    companyName?: string;
  };
  tip: 'taşıyıcı' | 'mal_sahibi';
  nereden: string;
  nereye: string;
  durum: string;
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function DegerlendirmePage({ params }: PageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [ilan, setIlan] = useState<Ilan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Properly unwrap params using React.use()
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      
      try {
        const res = await fetch(`/api/listings/${id}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'İlan yüklenirken bir hata oluştu');
        
        console.log('Gelen ilan verisi:', data); // Debug için

        // Veriyi kontrol et
        if (!data._id || !data.userId || !data.eslesmisKullanici) {
          throw new Error('İlan bilgileri eksik veya hatalı');
        }

        // userId ve eslesmisKullanici string veya obje olabilir
        const userId = typeof data.userId === 'string' ? data.userId : data.userId._id;
        const eslesmisKullaniciId = typeof data.eslesmisKullanici === 'string' ? data.eslesmisKullanici : data.eslesmisKullanici._id;

        if (!userId || !eslesmisKullaniciId) {
          throw new Error('Kullanıcı bilgileri eksik');
        }
        
        setIlan(data);
      } catch (err) {
        console.error('Hata detayı:', err); // Debug için
        setError(err instanceof Error ? err.message : 'İlan yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !ilan || !rating) {
      setError('Lütfen bir puan seçin');
      return;
    }

    setSubmitting(true);
    try {
      const fromUserId = session.user.id;
      const toUserId = typeof ilan.userId === 'string' 
        ? ilan.userId 
        : (fromUserId === ilan.userId._id 
          ? (typeof ilan.eslesmisKullanici === 'string' ? ilan.eslesmisKullanici : ilan.eslesmisKullanici._id)
          : ilan.userId._id);

      console.log('Gönderilen değerlendirme:', { // Debug için
        ilanId: ilan._id,
        toUserId,
        rating,
        comment: comment.trim()
      });

      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ilanId: ilan._id,
          toUserId,
          rating,
          comment: comment.trim()
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Değerlendirme gönderilemedi');

      router.push('/ilanlarim');
    } catch (err) {
      console.error('Değerlendirme hatası:', err); // Debug için
      setError(err instanceof Error ? err.message : 'Değerlendirme gönderilirken bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/giris');
    }
  }, [status, router]);

  if (status === 'loading' || loading) return <div>Yükleniyor...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!ilan) return <div>İlan bulunamadı</div>;

  const ownerName = typeof ilan.userId === 'string' ? '' : (ilan.userId.companyName || ilan.userId.name);
  const carrierName = typeof ilan.eslesmisKullanici === 'string' ? '' : (ilan.eslesmisKullanici.companyName || ilan.eslesmisKullanici.name);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">İlan Değerlendirmesi</h1>
      <RatingForm ilanId={id} toUserId={id} />
    </div>
  );
}