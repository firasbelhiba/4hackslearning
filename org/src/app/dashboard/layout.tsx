'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Sidebar } from '@/components/dashboard/sidebar';
import { PageLoader } from '@/components/ui/loader';

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
    return <PageLoader text="Loading dashboard..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FCFAF7]">
      <Sidebar />
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
