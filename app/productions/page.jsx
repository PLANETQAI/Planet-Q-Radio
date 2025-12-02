"use client";

import StarsWrapper from "@/components/canvas/StarsWrapper";
import { useRouter } from "next/navigation";
import AzurePlayerBot from './_components/AzureCastPlayer';

const RadioContent = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden font-sans">
        <StarsWrapper />
      {/* Glow effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-cyan-500/5 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500/5 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-lg">
          PlanetQ Radio
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Click Play and Vibe Out
        </p>
        <div className="w-full flex justify-center">
          {/* <PlayerBot /> */}
          <AzurePlayerBot />
        </div>
      </div>
    </div>
  );
};

const RadioPage = () => {
  return (

      <RadioContent />

  );
};

export default RadioPage;
