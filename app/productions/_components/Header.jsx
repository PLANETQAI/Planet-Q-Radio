'use client';

import CreditPurchaseModal from '@/components/credits/CreditPurchaseModal';
import { useUser } from '@/context/UserContext';
import { AnimatePresence, motion } from 'framer-motion';
import { CreditCard, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

const NavLink = ({ link, isActive, mobile = false }) => (
  <Link
    href={link.path}
    className={`${isActive
      ? 'text-cyan-400 font-medium'
      : 'text-gray-300 hover:text-cyan-400 transition-colors'
      } ${mobile ? 'py-2 text-lg' : ''}`}
  >
    {link.name}
  </Link>
);

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreditPurchaseModal, setShowCreditPurchaseModal] = useState(false);
  const pathname = usePathname();
  const router = useRouter(); // Import useRouter
  const { user, isAuthenticated, loading: userLoading, credits: userCredits, fetchUserCredits, logout } = useUser(); // Get logout from useUser



  useEffect(() => {
    if (isAuthenticated) {
      fetchUserCredits();
    }
  }, [isAuthenticated, fetchUserCredits]);

  const navLinks = [
    { name: 'Home', path: '/productions' },
    { name: 'Albums', path: '/productions/album' },
    { name: 'FAQs', path: '/productions/faqs' },
    { name: 'About', path: '/productions/about' },
    { name: 'Contact', path: '/productions/contact' },
  ];

  const isActive = (path) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <header className="relative z-50 w-full">
      <nav className="container mx-auto px-4 py-6">
        <div className="flex flex-row items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/small.webp"
              alt="PlanetQAi Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="font-bold text-lg hidden sm:inline bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              PlanetQRadio
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* <div className="flex gap-6">
              {navLinks.map((link) => (
                <NavLink key={link.path} link={link} isActive={isActive(link.path)} />
              ))}
            </div> */}

            {/* Credits Section - Only show when logged in */}
            {isAuthenticated && ( // Use isAuthenticated
              <div className="flex items-center gap-2">
                <div className="bg-slate-800 rounded-lg px-3 py-2 flex flex-col gap-1">
                  {/* Normal Credits */}
                  <div className="flex items-center gap-2">
                    <CreditCard className="text-blue-400 w-4 h-4" />
                    <span className="text-white font-medium text-xs sm:text-sm">
                      {userCredits?.credits?.normal !== undefined ? userCredits.credits.normal.toLocaleString() : '...'}
                    </span>
                  </div>
                  {/* Radio Credits */}
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                       <span className="text-white font-medium text-xs sm:text-sm">
                      {userCredits?.credits?.radio !== undefined ? userCredits.credits.radio.toLocaleString() : '...'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreditPurchaseModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2 flex items-center transition-colors duration-200"
                  title="Buy Credits"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-2 transition-colors duration-200"
                  title="Logout"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-300 hover:text-cyan-400 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="md:hidden absolute top-20 left-0 right-0 bg-gray-900/95 backdrop-blur-sm py-4 px-6 z-50"
              >
                <div className="flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <NavLink key={link.path} link={link} isActive={isActive(link.path)} mobile />
                  ))}
                  {isAuthenticated && ( // Use isAuthenticated
                    <div className="flex items-center gap-2 pt-4">
                      <div className="bg-slate-800 rounded-lg px-3 py-2 flex items-center gap-2">
                        <CreditCard className="text-blue-400 w-4 h-4" />
                        <span className="text-white font-medium text-sm">
                          {userCredits?.normal?.toLocaleString() || '0'} Credits {/* Access normal credits */}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setShowCreditPurchaseModal(true);
                          setIsOpen(false);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2 flex items-center transition-colors duration-200"
                        title="Buy Credits"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setIsOpen(false); // Close mobile menu on logout
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-3 py-2 transition-colors duration-200"
                        title="Logout"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
             <CreditPurchaseModal
          isOpen={showCreditPurchaseModal}
          onClose={() => setShowCreditPurchaseModal(false)}
          creditsNeeded="0"
          creditType="radio"
          onSuccess={async () => {
            await fetchUserCredits();
            // Optionally refresh the playlist or other data
          }}
        />
        </div>
      </nav>
    </header>
  );
}
