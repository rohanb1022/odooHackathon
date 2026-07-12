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
  const { isAuthenticated, user, login } = useAuthStore();
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
        backgroundColor: '#f8fafc',
      }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid #cbd5e1',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin .75s linear infinite',
        }} />
        <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
          Loading AssetFlow…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '14px 14px 14px 0' }}>
      <Sidebar />
      <div style={{
        flex: 1,
        marginLeft: '290px',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        backgroundColor: '#f8fafc',
      }}>
        <Header />
        <main style={{ flex: 1, padding: '24px 8px 32px 8px', overflowY: 'auto', minWidth: 0 }}>
          <div className="animate-fade-in" style={{ maxWidth: 1440, margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
