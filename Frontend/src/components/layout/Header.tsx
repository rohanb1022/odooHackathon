'use client';

import { useAuthStore } from '@/store/authStore';
import { LogOut, Bell, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      logout();
      router.push('/login');
    }
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      backgroundColor: 'hsl(var(--surface))',
      borderBottom: '1px solid hsl(var(--border))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Overview</h2>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', position: 'relative' }}>
          <Bell size={20} />
          <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', backgroundColor: 'hsl(var(--error))', borderRadius: '50%' }}></span>
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1.5rem', borderLeft: '1px solid hsl(var(--border))' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'hsla(var(--primary), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary))' }}>
            <UserIcon size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, lineHeight: 1 }}>{user?.name || 'User'}</span>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '4px' }}>{user?.role || 'Role'}</span>
          </div>
        </div>

        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '0.5rem' }} title="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
