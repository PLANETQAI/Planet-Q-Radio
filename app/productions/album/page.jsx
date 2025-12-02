"use client";

import { useUser } from "../../../context/UserContext"; // Adjusted path
import api from "../../../lib/api"; // Adjusted path
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import AudioPlayer from "../_components/AudioPlayer";
import MediaCard from "./_components/MediaCard";


const BeatCard = ({ beat, isPurchased, purchasingId, onPurchase, purchaseError }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const [imgError, setImgError] = useState(false);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-gray-900/80 rounded-2xl shadow-lg p-6 flex flex-col items-center">
      <div className="relative w-full aspect-square mb-4 group">
        <Image
          src={imgError ? "/images/small.webp" : beat.thumbnailUrl || "/images/small.webp"}
          alt={beat.title}
          fill
          className="rounded-xl shadow-md object-cover"
          onError={() => setImgError(true)}
        />

        <AudioPlayer audioUrl={beat.audioUrl} />

      </div>
      <h2 className="text-2xl font-bold mb-2 text-cyan-300 text-center">
        {beat.title}
      </h2>
      {/* <p className="text-gray-400 text-center mb-4">
        {beat.prompt || "No description."}
      </p> */}
      <div className="flex flex-col w-full space-y-2">
        <div>   <span className="text-xl font-semibold text-purple-300 text-center">
           {beat.credits} <span className="text-sm font-light text-cyan-300">PlanetQ Credits Coins</span>
        </span>
          <span className="text-sm font-light">
          ${beat.salePrice?.toFixed(2) || "2.00"}
          </span>
          </div>

        <button
          onClick={() => router.push(`/productions/purchase/${beat.id}`)}
          className="w-full py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-full hover:opacity-90"
        >
          {isPurchased ? "Purchased" : "Buy Now"}
        </button>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-6 py-2 rounded-full font-medium transition-colors ${
      active 
        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' 
        : 'text-gray-400 hover:text-white'
    }`}
  >
    {children}
  </button>
);

const FuturisticHipHopBeats = () => {
  const [beats, setBeats] = useState([]);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState({ beats: true, media: true });
  const [activeTab, setActiveTab] = useState('beats');
  const [error, setError] = useState(null);
  const [purchasingId, setPurchasingId] = useState(null);
  const [purchaseError, setPurchaseError] = useState(null);
 const [purchasedItems, setPurchasedItems] = useState({ beats: [], media: [] });
  const { user, isAuthenticated, loading: userLoading } = useUser();
  const router = useRouter();


  // const handlePurchase = useCallback(async (id) => {
  //   // Check authentication status
  //   // Check if we have a valid session
  //   if (!session) {
  //     // Redirect to sign in with a callback URL to return here after login
  //     signIn(undefined, { callbackUrl: '/productions/album' });
  //     return;
  //   }

  //   // If we're still loading the session, show a message
  //   if (status === 'loading') {
  //     setPurchaseError("Please wait, we're checking your session...");
  //     return;
  //   }

  //   setPurchaseError(null);
  //   setPurchasingId(id);

  //   try {
  //     // Get the selected beat
  //     const beatToPurchase = beats.find(beat => beat.id === id);
  //     if (!beatToPurchase) {
  //       throw new Error('Selected beat not found');
  //     }

  //     // Make the purchase request
  //     const res = await fetch("/api/song-purchase", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         // Include the session token if needed
  //         'Authorization': `Bearer ${session.accessToken}`
  //       },
  //       body: JSON.stringify({
  //         songId: id,
  //         price: beatToPurchase.creditsUsed || 1, // Default to 1 credit if not specified
  //         userId: session.user.id
  //       }),
  //     });

  //     const data = await res.json();

  //     if (!res.ok) {
  //       throw new Error(data.error || "Purchase failed. Please try again.");
  //     }

  //     // Update the UI to show the purchase was successful
  //     setPurchasedSongs(prev => [...prev, id]);

  //     // Show success message (you might want to use a toast notification here)
  //     alert('Purchase successful! The song has been added to your library.');

  //   } catch (err) {
  //     console.error('Purchase error:', err);
  //     setPurchaseError(err.message || "An error occurred during purchase. Please try again.");
  //   } finally {
  //     setPurchasingId(null);
  //   }
  // }, [status, session, signIn, beats]);



    const handlePurchase = useCallback(async (id, type = 'beats') => {
    if (!isAuthenticated) {
      router.push('/login?redirectTo=/productions/album');
      return;
    }

    if (userLoading) {
      setPurchaseError("Please wait, we're checking your session...");
      return;
    }

    setPurchaseError(null);
    setPurchasingId(id);

    try {
      const itemToPurchase = type === 'beats' 
        ? beats.find(item => item.id === id)
        : media.find(item => item.id === id);

      if (!itemToPurchase) {
        throw new Error('Selected item not found');
      }

      const endpoint = type === 'beats' ? '/api/song-purchase' : '/api/media/purchase';
      
      const res = await api.post(endpoint, {
        [type === 'beats' ? 'songId' : 'mediaId']: id,
        price: itemToPurchase.creditsUsed || 1,
        creditsUsed: itemToPurchase.creditsUsed || 1,
        userId: user.id
      });

      const data = res.data;

      setPurchasedItems(prev => ({
        ...prev,
        [type]: [...prev[type], id]
      }));

      alert('Purchase successful! The item has been added to your library.');

    } catch (err) {
      console.error('Purchase error:', err);
      const errorMessage = err.response?.data?.error || err.message || "An error occurred during purchase. Please try again.";
      setPurchaseError(errorMessage);
    } finally {
      setPurchasingId(null);
    }
  }, [isAuthenticated, userLoading, user, beats, media, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch beats
        const beatsRes = await api.get("/api/songs/public");
        setBeats(beatsRes.data.songs || []);
        setLoading(prev => ({ ...prev, beats: false }));

        // Fetch media
        const mediaRes = await api.get("/api/media/public");
        setMedia(mediaRes.data.media || []);
        setLoading(prev => ({ ...prev, media: false }));

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load content. Please try again later.");
        setLoading({ beats: false, media: false });
      }
    }
    fetchData();
  }, []);

  console.log("Beats:", beats);

  // if (loading) {
  //   return (
  //     <div className="w-full flex h-screen justify-center items-center">
	// 		<Image
	// 			src={'/images/loader.webp'}
	// 			width={100}
	// 			height={100}
	// 			alt="loader"
	// 			unoptimized
	// 			className="w-full h-full max-h-svh object-cover"
	// 		/>
	// 	</div>
  //   );
  // }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white font-sans">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-lg">
              Futuristic Hip Hop Beats
            </h1>
            <p className="text-lg text-gray-300 mb-2">
              The Sci Fi Channel Of Hip Hop and R&B
            </p>
          </div>
          {/* Beats Grid */}
          <div className="text-center text-red-400 py-16 text-xl">
            {error}
          </div>
        </div>
      </div>
    );
  }

const renderContent = () => {
    if (loading.beats && loading.media) {
      return (
        <div className="w-full flex h-screen justify-center items-center">
          <Image
            src={'/images/loader.webp'}
            width={100}
            height={100}
            alt="loader"
            unoptimized
            className="w-full h-full max-h-svh object-cover"
          />
        </div>
      );
    }

    const items = activeTab === 'beats' ? beats : media;
    const CardComponent = activeTab === 'beats' ? BeatCard : MediaCard;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-16">
        {items.map((item) => (
          <CardComponent
            key={item.id}
            beat={activeTab === 'beats' ? item : undefined}
                        media={activeTab === 'media' ? item : undefined}
            isPurchased={purchasedItems[activeTab].includes(item.id)}
            purchasingId={purchasingId}
            purchaseError={purchaseError}
            onPurchase={(id) => handlePurchase(id, activeTab)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white font-sans">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-lg">
            {activeTab === 'beats' ? 'Futuristic Hip Hop Beats' : 'Media Gallery'}
          </h1>
          <p className="text-lg text-gray-300 mb-2">
            {activeTab === 'beats' 
              ? 'The Sci Fi Channel Of Hip Hop and R&B' 
              : 'Explore and purchase amazing media content'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <TabButton 
            active={activeTab === 'beats'} 
            onClick={() => setActiveTab('beats')}
          >
            Beats
          </TabButton>
          <TabButton 
            active={activeTab === 'media'} 
            onClick={() => setActiveTab('media')}
          >
            Media
          </TabButton>
        </div>

        {purchaseError && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
            {purchaseError}
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
};

export default FuturisticHipHopBeats;
