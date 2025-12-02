"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";

function PlayerBot() {
  const preventPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <div className="w-full sm:w-[80%]" onClick={preventPropagation}>
      <div
        className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-2 w-full rounded-t-lg"
        style={{
          backgroundColor: "rgb(31 41 55 / 0.9)",
        }}
      >
        {/* Left Radio Circle */}
        <div className="relative w-16 sm:w-20 md:w-24 aspect-square overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
            <video
              autoPlay
              loop
              muted
              className="w-[150%] h-auto object-cover rounded-full"
            >
              <source src="/images/anicircle.mp4" type="video/mp4" />
            </video>
            <Image
              src="/images/radio1.jpeg"
              alt="Radio Left"
              width={100}
              height={100}
              className="absolute p-1 sm:p-2 rounded-full"
            />
          </div>
        </div>

        {/* Center Chat Link */}
        <div className="flex justify-center items-center flex-col gap-4">
          <Link
            href={"/chat"}
            className="rounded-full overflow-hidden aspect-square flex justify-center items-center w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 hover:shadow-[0_0_15px_rgba(0,300,300,0.8)] hover:cursor-pointer mx-2"
          >
            <video
              loop
              autoPlay
              muted
              preload="true"
              className="rounded-full w-full h-full object-cover"
            >
              <source src="/videos/generator.mp4" type="video/mp4" />
            </video>
          </Link>
          <p 
          className="text-blue-500 text-lg font-bold animate-pulse"
          style={{
            fontFamily: 'cursive',
            color: '#00d4ff',
            textShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
            letterSpacing: '1px',
            lineHeight: '1.2'
          }}
          >
            Quayla
          </p>
        </div>

        {/* Right Radio Circle */}
        <div className="relative w-16 sm:w-20 md:w-24 aspect-square overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
            <video
              autoPlay
              loop
              muted
              className="w-[150%] h-auto object-cover rounded-full"
            >
              <source src="/images/anicircle.mp4" type="video/mp4" />
            </video>
            <Image
              src="/images/radio1.jpeg"
              alt="Radio Right"
              width={100}
              height={100}
              className="absolute p-1 sm:p-2 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Background Video */}
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <video
          src="/images/bg-video-compressed.mp4"
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
        ></video>
      </div>

      {/* Radio Player */}
      <div className="bg-gray-800 w-full rounded-b-lg p-2! sm:p-3">
        <iframe
          src="https://radio.planetqproductions.com/public/planetq/embed?theme=dark&autoplay=true"
          frameBorder="0"
          allowtransparency="true"
          style={{
            width: "100%",
            height: "130px",
            border: "0",
          }}
          title="Radio Planet Q"
          allow="autoplay; encrypted-media"
        ></iframe>
      </div>
    </div>
  );
}

export default PlayerBot;