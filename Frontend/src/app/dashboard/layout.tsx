'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, login, setLoading, isLoading } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const { data } = await api.get('/auth/me');
        login(data.data);
      } catch (error) {
        router.push('/login');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    if (!isAuthenticated) {
      verifyAuth();
    } else {
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated, login, router]);

  if (isCheckingAuth) {
    return (
      <div style={{
        display: 'flex', height: '100vh',
        alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '1rem',
        background: 'hsl(var(--background))',
      }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid hsl(var(--border))',
          borderTopColor: 'hsl(var(--primary))',
          borderRadius: '50%',
          animation: 'spin .75s linear infinite',
        }} />
        <p style={{ fontSize: '.875rem', color: 'hsl(var(--text-muted))', fontFamily: 'var(--font-sans)' }}>
          Loading AssetFlow…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(var(--background))' }}>
      <Sidebar />
      <div style={{
        flex: 1,
        marginLeft: 'var(--sidebar-width)',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        transition: 'margin-left .22s cubic-bezier(.4,0,.2,1)',
      }}>
        <Header />
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', minWidth: 0 }}>
          <div className="animate-fade-in" style={{ maxWidth: 1400 }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
