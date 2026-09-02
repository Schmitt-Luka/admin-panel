'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    router.replace(token ? '/categories' : '/login');
  }, [router]);

  return null;
}
