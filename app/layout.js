import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";
import "../app/globals.css";
import StarsCanvas from "@/components/canvas/RandomStars";

export const metadata = {
  title: "PlanetQRadio",
  description: "Your best music radio buddy online.",
  icons: {
    title: "PlanetQRadio",
    description: "Your best music radio buddy online.",
    icon: "/small.webp",
  },
};

// Use a dynamic domain based on environment
const Domain =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000/"
    : "https://www.planetqradio.com/";

export default async function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn("antialiased min-h-screen bg-[#050816]")}
        suppressHydrationWarning
      >
        <div className="fixed inset-0 -z-10">
          <StarsCanvas />
          <div className="absolute inset-0 bg-gray-900/70" />
        </div>
        <div className="relative z-10">
          <link rel="canonical" href={Domain} />

          {children}

          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#1f2937",
                color: "#fff",
                border: "1px solid #374151",
                padding: "12px 16px",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              },
              duration: 10000,
              success: {
                duration: 5000,
              },
            }}
          />
        </div>
      </body>
    </html>
  );
}
