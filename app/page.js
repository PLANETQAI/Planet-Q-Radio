'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '../context/UserContext'; // Adjust path as needed

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, loading } = useUser();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push('/productions');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, loading, router]);

  // Optionally, render a loading state or nothing while checking auth status
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

}
