'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface RatingFormProps {
  ilanId: string;
  toUserId: string;
  onSuccess?: () => void;
}

export default function RatingForm({ ilanId, toUserId, onSuccess }: RatingFormProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      toast.error('Değerlendirme yapmak için giriş yapmalısınız');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ilanId,
          toUserId,
          rating,
          comment
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      toast.success('Değerlendirmeniz başarıyla kaydedildi');
      setComment('');
      setRating(5);
      onSuccess?.();
      
      // Ana sayfaya yönlendir
      router.push('/ilanlar');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Puanınız
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`p-2 rounded-full transition ${
                rating >= value
                  ? 'text-yellow-400 hover:text-yellow-500'
                  : 'text-gray-300 hover:text-gray-400'
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Yorumunuz
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          placeholder="Deneyiminizi paylaşın..."
        />
      </div>

      <button
        type="submit"
        disabled={loading || !session?.user}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Gönderiliyor...' : 'Değerlendir'}
      </button>

      {!session?.user && (
        <p className="text-sm text-gray-500 text-center">
          Değerlendirme yapmak için giriş yapmalısınız
        </p>
      )}
    </form>
  );
} 