'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/productions');
  }, [router]);

  return <div className="min-h-screen flex items-center justify-center">Redirecting to productions...</div>;
}
