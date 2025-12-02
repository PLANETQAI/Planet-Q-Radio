"use client";

import { useParams, useRouter } from 'next/navigation';
import { useUser } from '../../../../context/UserContext'; // Adjusted path
import api from '../../../../lib/api'; // Adjusted path
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function PurchasePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: userLoading } = useUser();
  const [beat, setBeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      router.push(`/login?redirectTo=/purchase/${id}`);
      return;
    }

    const fetchBeat = async () => {
      try {
        const res = await api.get("/api/songs/public");
        const data = res.data;
        
        // Find the specific beat by ID
        const foundBeat = data.songs?.find(b => b.id === id);
        if (!foundBeat) throw new Error('Beat not found');
        
        setBeat(foundBeat);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchBeat();
    }
  }, [id, isAuthenticated, userLoading, router]);

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirectTo=/purchase/${id}`);
      return;
    }

    setIsPurchasing(true);
    try {
      const res = await api.post('/api/song-purchase', {
        songId: id,
        price: beat.price,
        creditsUsed: beat.creditsUsed,
        userId: user.id // Get user ID from context
      });

      const data = res.data;
      console.log(data);

      alert('Purchase successful! The beat has been added to your library.');
      router.push('/productions/album');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Purchase failed';
      setError(errorMessage);
    } finally {
      setIsPurchasing(false);
    }
  };

  if (userLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!beat) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="mb-8 text-cyan-400 hover:text-cyan-300 flex items-center"
        >
          ← Back to Beats
        </button>
        
        <div className="bg-gray-800 rounded-xl p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative aspect-square">
              <Image
                src={beat.thumbnailUrl || "/images/small.webp"}
                alt={beat.title}
                fill
                className="rounded-xl object-cover"
                onError={(e) => e.target.src = "/images/small.webp"}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-4">{beat.title}</h1>
              {/* <p className="text-gray-300 mb-6">{beat.prompt || "No description available."}</p> */}
              
              <div className="space-y-4">
                <div className="text-2xl font-bold text-purple-400">
                  ${beat.salePrice?.toFixed(2) || "2.00"}
                </div>
                
                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {isPurchasing ? 'Processing...' : 'Complete Purchase'}
                </button>

                {error && (
                  <div className="text-red-400 text-sm mt-2">{error}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}