'use client';

import { useAuthStore } from '@/store/authStore';
import { LogOut, Bell, User as UserIcon, Search, Sun, Moon, ChevronDown, Settings, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/axios';
import { useState, useEffect, useRef } from 'react';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':              'Dashboard',
  '/dashboard/assets':       'Assets',
  '/dashboard/allocations':  'Allocations',
  '/dashboard/bookings':     'Bookings',
  '/dashboard/maintenance':  'Maintenance',
  '/dashboard/audits':       'Audits',
  '/dashboard/reports':      'Reports',
  '/dashboard/organization': 'Organization',
  '/dashboard/settings':     'Settings',
};

function getPageTitle(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const key of Object.keys(PAGE_TITLES)) {
    if (pathname.startsWith(key + '/')) return PAGE_TITLES[key];
  }
  return 'AssetFlow';
}

function getBreadcrumb(pathname: string) {
  const title = getPageTitle(pathname);
  if (pathname === '/dashboard') return [];
  return ['Dashboard', title];
}

export default function Header() {
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const router = useRouter();
  const pathname = usePathname();

  const [dark, setDark] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const title = getPageTitle(pathname);
  const crumbs = getBreadcrumb(pathname);
  const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

  /* dark mode */
  useEffect(() => {
    const saved = localStorage.getItem('af-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved ? saved === 'dark' : prefersDark;
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('af-theme', next ? 'dark' : 'light');
  };

  /* Ctrl+K */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(s => !s);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') { setSearchOpen(false); setProfileOpen(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* scroll shadow */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 2);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* close profile on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    router.push('/login');
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'hsl(var(--surface))',
      borderBottom: '1px solid hsl(var(--border))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 90,
      transition: 'box-shadow var(--t-normal)',
      boxShadow: scrolled ? '0 1px 12px rgb(0 0 0 / .06)' : 'none',
    }}>

      {/* ── Left: Page title + breadcrumb ── */}
      <div>
        {crumbs.length > 0 && (
          <div className="breadcrumb" style={{ marginBottom: 2 }}>
            {crumbs.map((c, i) => (
              <span key={c} style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                {i > 0 && <span className="breadcrumb-sep">/</span>}
                <span className={i === crumbs.length - 1 ? 'breadcrumb-current' : ''}>{c}</span>
              </span>
            ))}
          </div>
        )}
        <h1 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'hsl(var(--text))',
          letterSpacing: '-.015em',
          lineHeight: 1,
        }}>
          {title}
        </h1>
      </div>

      {/* ── Right: Search + actions ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>

        {/* Search bar */}
        <div style={{ position: 'relative' }}>
          {searchOpen ? (
            <div style={{
              display: 'flex', alignItems: 'center',
              background: 'hsl(var(--surface-raised))',
              border: '1px solid hsl(var(--primary))',
              borderRadius: 8,
              padding: '0 .625rem',
              gap: '.5rem',
              width: 260,
              boxShadow: '0 0 0 3px rgb(var(--primary-rgb)/.1)',
            }}>
              <Search size={14} color="hsl(var(--text-muted))" />
              <input
                ref={searchRef}
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search anything..."
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  fontSize: '.8125rem', color: 'hsl(var(--text))',
                  padding: '.4rem 0',
                  fontFamily: 'var(--font-sans)',
                }}
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchVal(''); }}
                style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', display: 'flex', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '.5rem',
                background: 'hsl(var(--surface-raised))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 8,
                padding: '.38rem .75rem',
                color: 'hsl(var(--text-muted))',
                fontSize: '.8rem',
                cursor: 'pointer',
                transition: 'all var(--t-fast)',
                fontFamily: 'var(--font-sans)',
              }}
              title="Search (Ctrl+K)"
            >
              <Search size={14} />
              <span style={{ display: 'none' }} className="md:inline">Search...</span>
              <kbd style={{
                padding: '.1rem .35rem',
                background: 'hsl(var(--surface))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 4,
                fontSize: '.65rem',
                fontFamily: 'var(--font-sans)',
                color: 'hsl(var(--text-muted))',
              }}>⌘K</kbd>
            </button>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleDark}
          className="btn-icon btn-ghost"
          title={dark ? 'Switch to Light' : 'Switch to Dark'}
          style={{ color: 'hsl(var(--text-muted))' }}
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Notifications bell */}
        <button
          className="btn-icon btn-ghost"
          style={{ position: 'relative', color: 'hsl(var(--text-muted))' }}
          title="Notifications"
        >
          <Bell size={17} />
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 7, height: 7,
            background: 'hsl(var(--error))',
            borderRadius: '50%',
            border: '1.5px solid hsl(var(--surface))',
            animation: 'pulse-dot 2s infinite',
          }} />
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: 'hsl(var(--border))', margin: '0 .25rem' }} />

        {/* Profile dropdown */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: '.5rem',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '.25rem .375rem',
              borderRadius: 8,
              transition: 'background var(--t-fast)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'hsl(var(--surface-raised))')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <div style={{
              width: 30, height: 30,
              borderRadius: '50%',
              background: 'rgb(var(--primary-rgb)/.12)',
              border: '2px solid rgb(var(--primary-rgb)/.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '.7rem', fontWeight: 700,
              color: 'hsl(var(--primary))',
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
              <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'hsl(var(--text))' }}>
                {user?.name?.split(' ')[0] || 'User'}
              </span>
            </div>
            <ChevronDown size={13} color="hsl(var(--text-muted))" style={{ transition: 'transform var(--t-fast)', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: 220,
              background: 'hsl(var(--surface))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 12,
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              animation: 'slideUpModal .18s ease',
              zIndex: 200,
            }}>
              {/* User info */}
              <div style={{ padding: '1rem 1rem .75rem', borderBottom: '1px solid hsl(var(--border))' }}>
                <p style={{ fontSize: '.875rem', fontWeight: 600, color: 'hsl(var(--text))' }}>{user?.name}</p>
                <p style={{ fontSize: '.75rem', color: 'hsl(var(--text-muted))', marginTop: 2 }}>{user?.email}</p>
                <span style={{
                  display: 'inline-block', marginTop: 6,
                  padding: '.15rem .55rem', borderRadius: 999,
                  fontSize: '.68rem', fontWeight: 600,
                  background: 'rgb(var(--primary-rgb)/.1)',
                  color: 'hsl(var(--primary))',
                }}>
                  {user?.role?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              </div>
              {/* Menu items */}
              <div style={{ padding: '.375rem' }}>
                <button
                  onClick={() => { setProfileOpen(false); router.push('/dashboard/settings'); }}
                  style={{
                    width: '100%', background: 'none', border: 'none',
                    display: 'flex', alignItems: 'center', gap: '.625rem',
                    padding: '.55rem .75rem', borderRadius: 8,
                    fontSize: '.8375rem', color: 'hsl(var(--text-secondary))',
                    cursor: 'pointer', transition: 'background var(--t-fast)',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'hsl(var(--surface-raised))')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <Settings size={15} color="hsl(var(--text-muted))" />
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%', background: 'none', border: 'none',
                    display: 'flex', alignItems: 'center', gap: '.625rem',
                    padding: '.55rem .75rem', borderRadius: 8,
                    fontSize: '.8375rem', color: 'hsl(var(--error))',
                    cursor: 'pointer', transition: 'background var(--t-fast)',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgb(var(--error-rgb)/.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <LogOut size={15} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
