"use client";
import dynamic from "next/dynamic";

const StarsCanvas = dynamic(() => import("./RandomStars"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-auto bg-[#050816] absolute inset-0 z-[-1]" />
  ),
});

export default StarsCanvas;
