'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Sidebar } from '@/components/dashboard/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, fetchProfile, fetchOrganizations } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await fetchProfile();
        await fetchOrganizations();
        setInitialized(true);
      } catch {
        router.replace('/login');
      }
    };

    init();
  }, [fetchProfile, fetchOrganizations, router]);

  if (!initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-pulse">
          <h1 className="text-2xl font-bold text-white">
            <span className="text-[#D6FF25]">4</span>HACKS
          </h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
