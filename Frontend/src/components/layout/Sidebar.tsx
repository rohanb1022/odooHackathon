'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Package, Users, Settings, Calendar,
  Wrench, FileCheck, BarChart3, ChevronLeft, ChevronRight,
  Repeat, Hexagon, Sparkles, Bell, MessageSquare, CheckSquare,
  User, ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const MENU_ITEMS = [
  { name: 'Home',           href: '/dashboard',              icon: LayoutDashboard, roles: ['admin','asset_manager','department_head','employee'] },
  { name: 'Asset Management',href: '/dashboard/assets',       icon: Package,         roles: ['admin','asset_manager','department_head','employee'] },
  { name: 'Maintenance',    href: '/dashboard/maintenance',  icon: Wrench,          roles: ['admin','asset_manager','department_head','employee'] },
  { name: 'Allocations',    href: '/dashboard/allocations',  icon: Repeat,          roles: ['admin','asset_manager','department_head','employee'] },
  { name: 'Financial & Reports', href: '/dashboard/reports', icon: BarChart3,       roles: ['admin','asset_manager','department_head'] },
  { name: 'User Management',href: '/dashboard/organization', icon: Users,           roles: ['admin'] },
  { name: 'Audits',         href: '/dashboard/audits',       icon: FileCheck,       roles: ['admin','asset_manager','department_head'] },
  { name: 'Schedule',       href: '/dashboard/bookings',     icon: Calendar,        roles: ['admin','asset_manager','department_head','employee'] },
];

const INBOX_ITEMS = [
  { name: 'AI Assistant',   href: '/dashboard/ai-assistant', icon: Sparkles,        badge: 'AI' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore(s => s.user);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const menuItems = MENU_ITEMS.filter(i => !user || i.roles.includes(user.role as string));

  return (
    <aside
      style={{
        width: collapsed ? '84px' : '260px',
        minWidth: collapsed ? '84px' : '260px',
        height: 'calc(100vh - 28px)',
        position: 'fixed',
        left: '14px',
        top: '14px',
        backgroundColor: '#ffffff',
        borderRadius: '26px',
        boxShadow: '0 8px 30px rgba(15, 23, 42, 0.06)',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
        padding: collapsed ? '18px 10px' : '22px 18px',
      }}
    >
      {/* ── Logo & Brand ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              color: '#ffffff',
              flexShrink: 0,
            }}
          >
            <Hexagon size={20} strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <span
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.5px',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              AssetFlow
            </span>
          )}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748b',
          }}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* ── Navigation Sections ── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Section 1: Menu */}
        <div>
          {!collapsed && (
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '8px' }}>
              Menu
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: collapsed ? '12px' : '11px 14px',
                    borderRadius: '14px',
                    backgroundColor: isActive ? '#2563eb' : 'transparent',
                    color: isActive ? '#ffffff' : '#475569',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '14px',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? '0 4px 14px rgba(37, 99, 235, 0.3)' : 'none',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                  }}
                >
                  <Icon size={19} color={isActive ? '#ffffff' : '#64748b'} strokeWidth={isActive ? 2.3 : 1.8} />
                  {!collapsed && <span style={{ flex: 1 }}>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Section 2: Inbox */}
        <div>
          {!collapsed && (
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', paddingLeft: '8px' }}>
              Inbox
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {INBOX_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: collapsed ? '12px' : '11px 14px',
                    borderRadius: '14px',
                    backgroundColor: isActive ? '#2563eb' : 'transparent',
                    color: isActive ? '#ffffff' : '#475569',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '14px',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                  }}
                >
                  <Icon size={19} color={isActive ? '#ffffff' : '#64748b'} strokeWidth={1.8} />
                  {!collapsed && (
                    <>
                      <span style={{ flex: 1 }}>{item.name}</span>
                      {item.badge && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '9999px',
                            backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                            color: isActive ? '#ffffff' : '#2563eb',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom Mascot Promo Banner (Exact to WealthPro Reference) ── */}
      {!collapsed && (
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            borderRadius: '20px',
            background: 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1px solid #bfdbfe',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',
              boxShadow: '0 4px 10px rgba(37, 99, 235, 0.25)',
            }}
          >
            <Sparkles size={22} />
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a8a' }}>AI Asset Advisor</div>
          <div style={{ fontSize: '11px', color: '#3b82f6', margin: '4px 0 10px 0', fontWeight: 500 }}>
            Automated maintenance & valuation diagnostics active.
          </div>
          <Link
            href="/dashboard/ai-assistant"
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: '10px',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.2)',
            }}
          >
            Explore AI →
          </Link>
        </div>
      )}
    </aside>
  );
}
