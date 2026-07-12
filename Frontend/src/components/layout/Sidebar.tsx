'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Package, Users, Settings, Calendar,
  Wrench, FileCheck, BarChart3, ChevronLeft, ChevronRight,
  Repeat, Hexagon, Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const NAV = [
  { name: 'Dashboard',    href: '/dashboard',              icon: LayoutDashboard, roles: ['admin','asset_manager','department_head','employee'] },
  { name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: Sparkles,        roles: ['admin','asset_manager','department_head','employee'] },
  { name: 'Assets',       href: '/dashboard/assets',       icon: Package,         roles: ['admin','asset_manager','department_head','employee'] },
  { name: 'Allocations',  href: '/dashboard/allocations',  icon: Repeat,          roles: ['admin','asset_manager','department_head','employee'] },
  { name: 'Bookings',     href: '/dashboard/bookings',     icon: Calendar,        roles: ['admin','asset_manager','department_head','employee'] },
  { name: 'Maintenance',  href: '/dashboard/maintenance',  icon: Wrench,          roles: ['admin','asset_manager','department_head','employee'] },
  { name: 'Audits',       href: '/dashboard/audits',       icon: FileCheck,       roles: ['admin','asset_manager','department_head'] },
  { name: 'Reports',      href: '/dashboard/reports',      icon: BarChart3,       roles: ['admin','asset_manager','department_head'] },
  { name: 'Organization', href: '/dashboard/organization', icon: Users,           roles: ['admin'] },
  { name: 'Settings',     href: '/dashboard/settings',     icon: Settings,        roles: ['admin','asset_manager','department_head','employee'] },
];

function getRoleColor(role: string) {
  switch (role) {
    case 'admin': return '#EF4444';
    case 'asset_manager': return '#4F46E5';
    case 'department_head': return '#F59E0B';
    default: return '#10B981';
  }
}

function formatRole(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore(s => s.user);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const items = NAV.filter(i => !user || i.roles.includes(user.role));
  const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  const roleColor = getRoleColor(user?.role || '');

  const W = collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)';

  return (
    <aside
      style={{
        width: W,
        minWidth: W,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background: 'hsl(var(--surface))',
        borderRight: '1px solid hsl(var(--border))',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        transition: 'width 0.22s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
      }}
    >
      {/* ── Logo ── */}
      <div style={{
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: collapsed ? '0' : '0 1rem 0 1.25rem',
        borderBottom: '1px solid hsl(var(--border))',
        flexShrink: 0,
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <div style={{
              width: 30, height: 30,
              background: 'hsl(var(--primary))',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Hexagon size={17} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'hsl(var(--text))', letterSpacing: '-.02em' }}>
              AssetFlow
            </span>
          </div>
        )}
        {collapsed && (
          <div style={{
            width: 30, height: 30,
            background: 'hsl(var(--primary))',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Hexagon size={17} color="#fff" strokeWidth={2.5} />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="btn-icon btn-ghost"
            style={{ flexShrink: 0, color: 'hsl(var(--text-muted))' }}
            title="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '.75rem .625rem' }}>
        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="btn-ghost"
            style={{
              width: '100%', height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, marginBottom: '.75rem',
              color: 'hsl(var(--text-muted))',
            }}
            title="Expand sidebar"
          >
            <ChevronRight size={16} />
          </button>
        )}

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`nav-link${active ? ' active' : ''}`}
                  title={collapsed ? item.name : undefined}
                  style={{
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '.6rem' : '.55rem .875rem',
                    position: 'relative',
                  }}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <span style={{
                      position: 'absolute',
                      left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: 3, height: '60%',
                      background: 'hsl(var(--primary))',
                      borderRadius: '0 3px 3px 0',
                    }} />
                  )}
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.2 : 1.8}
                    style={{ flexShrink: 0 }}
                  />
                  {!collapsed && (
                    <span style={{
                      fontSize: '.875rem',
                      opacity: mounted ? 1 : 0,
                      transition: 'opacity .15s',
                    }}>
                      {item.name}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── User profile ── */}
      <div style={{
        padding: '.75rem .625rem',
        borderTop: '1px solid hsl(var(--border))',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '.75rem',
          padding: '.55rem .625rem',
          borderRadius: 8,
          overflow: 'hidden',
          cursor: 'default',
        }}>
          {/* Avatar */}
          <div style={{
            width: 32, height: 32,
            borderRadius: '50%',
            background: `${roleColor}18`,
            border: `2px solid ${roleColor}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            fontSize: '.7rem',
            fontWeight: 700,
            color: roleColor,
          }}>
            {initials}
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{
                fontSize: '.8125rem', fontWeight: 600,
                color: 'hsl(var(--text))',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user?.name || 'User'}
              </p>
              <p style={{
                fontSize: '.7rem',
                color: roleColor,
                fontWeight: 500,
                marginTop: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {formatRole(user?.role || '')}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
