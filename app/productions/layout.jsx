"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "./_components/Header";

// Dynamically import components with SSR disabled
const StarsWrapper = dynamic(() => import("@/components/canvas/StarsWrapper"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black z-0" />,
});

const RadioLayout = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (path) => pathname === path;

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Albums", path: "/productions/album" },
    { name: "FAQs", path: "/productions/faqs" },
    { name: "About", path: "/productions/about" },
    { name: "Contact", path: "/productions/contact" },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <StarsWrapper />
      {/* Navigation */}
      <Header />

      <main className="relative z-10">{children}</main>

      {/* Footer */}
      <footer className="relative z-10 pt-2 mb-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Planet Q Radio. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            The Sci-Fi Channel of Hip Hop and R&B
          </p>
        </div>
      </footer>
    </div>
  );
};

const NavLink = ({ link, isActive, mobile = false }) => (
  <Link
    href={link.path}
    className={`relative py-2 text-sm font-medium transition-colors ${isActive
        ? "text-cyan-400"
        : "text-gray-300 hover:text-cyan-400"
      } ${mobile ? 'text-lg py-3' : ''}`}
  >
    {link.name}
    {isActive && (
      <motion.span
        layoutId={mobile ? 'activeMobileNavLink' : 'activeNavLink'}
        className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500"
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 24,
        }}
      />
    )}
  </Link>
);

export default RadioLayout;
