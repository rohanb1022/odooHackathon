'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings, 
  Calendar, 
  Wrench,
  FileCheck,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Assets', href: '/dashboard/assets', icon: Package, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Bookings', href: '/dashboard/bookings', icon: Calendar, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
    { name: 'Audits', href: '/dashboard/audits', icon: FileCheck, roles: ['Admin', 'Asset Manager', 'Department Head'] },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, roles: ['Admin', 'Asset Manager', 'Department Head'] },
    { name: 'Organization', href: '/dashboard/organization', icon: Users, roles: ['Admin'] },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['Admin', 'Asset Manager', 'Department Head', 'Employee'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    !user || item.roles.includes(user.role)
  );

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      backgroundColor: 'hsl(var(--surface))',
      borderRight: '1px solid hsl(var(--border))',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100
    }}>
      <div style={{ height: 'var(--header-height)', display: 'flex', alignItems: 'center', padding: '0 1.5rem', borderBottom: '1px solid hsl(var(--border))' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>AssetFlow</h1>
      </div>
      
      <nav style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link href={item.href} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: isActive ? 'hsla(var(--primary), 0.1)' : 'transparent',
                  color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))',
                  fontWeight: isActive ? 500 : 400,
                  transition: 'all var(--transition-fast)'
                }}>
                  <Icon size={20} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
