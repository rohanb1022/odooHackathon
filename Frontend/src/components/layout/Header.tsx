'use client';

import { useAuthStore } from '@/store/authStore';
import { LogOut, Bell, Search, Sun, Moon, ChevronDown, Settings, User as UserIcon, Hexagon, Sparkles } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function Header() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const router = useRouter();
  const pathname = usePathname();

  const [dark, setDark] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U';

  useEffect(() => {
    const saved = localStorage.getItem('af-theme');
    const isDark = saved === 'dark';
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('af-theme', next ? 'dark' : 'light');
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '12px',
        padding: '12px 8px',
        backgroundColor: 'transparent',
      }}
    >
      {/* ── Search Pill Button ── */}
      <div
        onClick={() => {}}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        }}
        title="Search (Ctrl + K)"
      >
        <Search size={18} />
      </div>

      {/* ── Theme Switcher Pill (Light / Dark) ── */}
      <div
        onClick={toggleDark}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '9999px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          fontSize: '13px',
          fontWeight: 700,
          color: '#334155',
        }}
      >
        <span>{dark ? 'Dark' : 'Light'}</span>
        <span style={{ color: '#cbd5e1' }}>•</span>
        {dark ? <Moon size={15} color="#3b82f6" /> : <Sun size={15} color="#f59e0b" />}
      </div>

      {/* ── Notification Bell ── */}
      <Link
        href="/dashboard/reports?tab=alerts"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          position: 'relative',
          textDecoration: 'none',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Bell size={18} />
        <span
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#ef4444',
            border: '2px solid #ffffff',
          }}
        />
      </Link>

      {/* ── User Profile Dropdown Pill ── */}
      <div ref={profileRef} style={{ position: 'relative' }}>
        <div
          onClick={() => setProfileOpen(!profileOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 12px 6px 6px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '9999px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '13px',
            }}
          >
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              {user?.name || 'Administrator'}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'capitalize' }}>
              {(user?.role || 'Admin').replace(/_/g, ' ')}
            </span>
          </div>
          <ChevronDown size={14} color="#94a3b8" />
        </div>

        {profileOpen && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '220px',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)',
              padding: '8px',
              zIndex: 200,
            }}
          >
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', marginBottom: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{user?.name}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{user?.email}</div>
            </div>
            <Link
              href="/dashboard/settings"
              onClick={() => setProfileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155',
                textDecoration: 'none',
              }}
            >
              <UserIcon size={16} /> Profile & Settings
            </Link>
            <button
              onClick={() => {
                setProfileOpen(false);
                logout();
                router.push('/login');
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#ef4444',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
