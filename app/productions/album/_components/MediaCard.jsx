"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";


const MediaCard = ({ media, isPurchased, purchasingId, onPurchase, purchaseError }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);
  const router = useRouter();

  return (
    <div className="bg-gray-900/80 rounded-2xl shadow-lg p-6 flex flex-col items-center">
      <div className="relative w-full aspect-square mb-4 group overflow-hidden">
        {media.mediaType === 'video' ? (
          <video 
            className="w-full h-full object-cover rounded-xl"
            poster={media.thumbnailUrl}
            controls
          >
            <source src={media.fileUrl} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={imgError ? "/images/small.webp" : media.fileUrl || "/images/small.webp"}
            alt={media.title || 'Media'}
            fill
            className="rounded-xl shadow-md object-cover"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      {/* <h2 className="text-2xl font-bold mb-2 text-cyan-300 text-center">
        {media.title || 'Untitled Media'}
      </h2> */}
      <div className="flex flex-col w-full space-y-2">
        <div>
          <span className="text-xl font-semibold text-purple-300 text-center">
            {media.credits} <span className="text-sm font-light text-cyan-300">PlanetQ Credits Coins</span>
          </span>
          {media.salePrice && (
            <span className="text-sm font-light ml-2">
              ${media.salePrice.toFixed(2)}
            </span>
          )}
        </div>
        <button
          onClick={() => onPurchase(media.id)}
          disabled={isPurchased || purchasingId === media.id}
          className={`w-full py-2 ${
            isPurchased 
              ? 'bg-gray-600' 
              : 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90'
          } text-white font-bold rounded-full`}
        >
          {isPurchased ? "Purchased" : purchasingId === media.id ? "Processing..." : "Buy Now"}
        </button>
      </div>
    </div>
  );
};

export default MediaCard;