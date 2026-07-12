'use client';

import { useEffect, useState } from 'react';
import { Package, Wrench, Calendar, Repeat, TrendingUp, TrendingDown, AlertCircle, Activity, MapPin, ArrowUpRight, Clock } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import dynamic from 'next/dynamic';

const AssetMap = dynamic(() => import('@/components/AssetMap'), { ssr: false });

const ICON_COLORS = [
  { bg: 'rgb(79,70,229/.12)', color: '#4F46E5' },
  { bg: 'rgb(14,165,233/.12)', color: '#0EA5E9' },
  { bg: 'rgb(245,158,11/.12)', color: '#F59E0B' },
  { bg: 'rgb(16,185,129/.12)', color: '#10B981' },
  { bg: 'rgb(239,68,68/.12)',  color: '#EF4444' },
];

function SkeletonBlock({ w = '100%', h = 20 }: { w?: string | number; h?: number }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: 6 }} />;
}

function StatCard({ title, value, icon: Icon, colorIdx, delta, isLoading }: {
  title: string; value: number; icon: any; colorIdx: number; delta?: number; isLoading: boolean;
}) {
  const c = ICON_COLORS[colorIdx % ICON_COLORS.length];
  return (
    <div className="stat-card" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
      <div className="stat-icon" style={{ background: c.bg, flexShrink: 0 }}>
        <Icon size={20} color={c.color} strokeWidth={2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="stat-label">{title}</p>
        {isLoading
          ? <SkeletonBlock w={60} h={28} />
          : <p className="stat-value">{value.toLocaleString()}</p>
        }
        {delta !== undefined && !isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            {delta >= 0
              ? <TrendingUp size={12} color="#10B981" />
              : <TrendingDown size={12} color="#EF4444" />}
            <span style={{ fontSize: '.72rem', color: delta >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>
              {delta >= 0 ? '+' : ''}{delta}% vs last week
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const [stats, setStats] = useState({
    assetsAvailable: 0, assetsAllocated: 0, assetsMaintenance: 0,
    activeBookings: 0, pendingTransfers: 0, overdueAllocations: 0,
    totalAssets: 0, upcomingBookings: 0, pendingMaintenance: 0, unreadNotifications: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [assets, setAssets]         = useState<any[]>([]);
  const [isLoading, setIsLoading]   = useState(true);

  useEffect(() => {
    Promise.all([fetchDashboardStats(), fetchAssets()]).finally(() => setIsLoading(false));
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const { data } = await api.get('/dashboard');
      if (data.success) {
        if (data.data.kpiCards)        setStats(data.data.kpiCards);
        if (data.data.recentActivities) setActivities(data.data.recentActivities);
      }
    } catch {}
  };

  const fetchAssets = async () => {
    try {
      const { data } = await api.get('/assets');
      if (data.success) setAssets(data.data);
    } catch {}
  };

  const statCards = [
    { title: 'Available Assets',   value: stats.assetsAvailable,  icon: Package,  delta: 4  },
    { title: 'Allocated',          value: stats.assetsAllocated,  icon: ArrowUpRight, delta: 2 },
    { title: 'Under Maintenance',  value: stats.assetsMaintenance,icon: Wrench,   delta: -1 },
    { title: 'Active Bookings',    value: stats.activeBookings,   icon: Calendar, delta: 8  },
    { title: 'Pending Transfers',  value: stats.pendingTransfers, icon: Repeat,   delta: 0  },
  ];

  const quickActions = [
    { label: 'Register Asset',   href: '/dashboard/assets/register', color: '#4F46E5', bg: 'rgb(79,70,229/.1)' },
    { label: 'Book Resource',    href: '/dashboard/bookings',        color: '#0EA5E9', bg: 'rgb(14,165,233/.1)' },
    { label: 'Raise Maintenance',href: '/dashboard/maintenance',     color: '#F59E0B', bg: 'rgb(245,158,11/.1)' },
    { label: 'New Audit',        href: '/dashboard/audits',         color: '#10B981', bg: 'rgb(16,185,129/.1)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontSize: '.8rem', color: 'hsl(var(--text-muted))', fontWeight: 500, marginBottom: '.25rem' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-.03em', color: 'hsl(var(--text))' }}>
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{ color: 'hsl(var(--text-muted))', marginTop: '.3rem', fontSize: '.875rem' }}>
            Here's your asset management overview for today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
          <Link href="/dashboard/assets/register" className="btn btn-primary">
            + Register Asset
          </Link>
          <Link href="/dashboard/bookings" className="btn btn-outline">
            Book Resource
          </Link>
        </div>
      </div>

      {/* ── Overdue alert ── */}
      {stats.overdueAllocations > 0 && (
        <div className="alert alert-error">
          <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontWeight: 600, color: 'hsl(var(--error))', marginBottom: '.15rem' }}>
              {stats.overdueAllocations} Overdue Return{stats.overdueAllocations !== 1 ? 's' : ''}
            </p>
            <p style={{ fontSize: '.8125rem', color: 'hsl(var(--text-muted))' }}>
              Some assets are past their expected return date. Review allocations for details.
            </p>
          </div>
        </div>
      )}

      {/* ── KPI cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px,1fr))', gap: '1rem' }}>
        {statCards.map((s, i) => (
          <StatCard key={s.title} {...s} colorIdx={i} isLoading={isLoading} />
        ))}
      </div>

      {/* ── Middle row: activity + allocations ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem' }}>

        {/* Recent Activity */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <Activity size={16} color="hsl(var(--primary))" />
              <h3 style={{ fontWeight: 700, fontSize: '.9375rem', color: 'hsl(var(--text))' }}>Recent Activity</h3>
            </div>
            <Link href="/dashboard/reports" style={{ fontSize: '.75rem', color: 'hsl(var(--primary))', fontWeight: 500 }}>
              View all →
            </Link>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: '.875rem', alignItems: 'flex-start' }}>
                  <SkeletonBlock w={8} h={8} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <SkeletonBlock w="80%" h={13} />
                    <SkeletonBlock w="45%" h={11} />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><Activity size={22} /></div>
              <p className="empty-state-title">No recent activity</p>
              <p className="empty-state-desc">Actions will appear here as your team uses AssetFlow.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {activities.map((act, idx) => (
                <div key={act._id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '1rem',
                  padding: '.875rem 0',
                  borderBottom: idx < activities.length - 1 ? '1px solid hsl(var(--border))' : 'none',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: 'rgb(79,70,229/.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'hsl(var(--primary))' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '.8375rem', color: 'hsl(var(--text))', lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 600 }}>{act.actorId?.name || 'System'}</span>
                      {' '}{act.action.replace(/_/g, ' ').toLowerCase()}
                      {(act.meta?.name || act.meta?.title) && (
                        <span style={{ fontWeight: 600 }}> {act.meta?.name || act.meta?.title}</span>
                      )}
                    </p>
                    <p style={{ fontSize: '.73rem', color: 'hsl(var(--text-muted))', marginTop: '.2rem', display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                      <Clock size={10} />
                      {new Date(act.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Quick Actions + My Allocations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Quick actions */}
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '.9rem', color: 'hsl(var(--text))', marginBottom: '1rem' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {quickActions.map(qa => (
                <Link key={qa.label} href={qa.href} style={{
                  display: 'flex', alignItems: 'center', gap: '.75rem',
                  padding: '.7rem .875rem',
                  borderRadius: 8,
                  background: qa.bg,
                  border: `1px solid ${qa.color}22`,
                  color: qa.color,
                  fontWeight: 600,
                  fontSize: '.8rem',
                  transition: 'all var(--t-fast)',
                  textDecoration: 'none',
                }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                >
                  <ArrowUpRight size={14} />
                  {qa.label}
                </Link>
              ))}
            </div>
          </div>

          {/* My Allocations stub */}
          <div className="glass-panel" style={{ padding: '1.25rem', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.875rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '.9rem', color: 'hsl(var(--text))' }}>My Allocations</h3>
              <Link href="/dashboard/allocations" style={{ fontSize: '.73rem', color: 'hsl(var(--primary))', fontWeight: 500 }}>
                View all →
              </Link>
            </div>
            <div className="empty-state" style={{ padding: '1.5rem 1rem' }}>
              <div className="empty-state-icon"><Package size={18} /></div>
              <p className="empty-state-title" style={{ fontSize: '.8rem' }}>No active allocations</p>
              <p className="empty-state-desc" style={{ fontSize: '.75rem' }}>Assets assigned to you will appear here.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Asset Map ── */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgb(79,70,229/.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={15} color="hsl(var(--primary))" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '.9375rem', color: 'hsl(var(--text))' }}>Asset Geographic Distribution</h3>
            <p style={{ fontSize: '.75rem', color: 'hsl(var(--text-muted))', marginTop: 1 }}>
              {isLoading ? 'Loading assets…' : `${assets.length} assets mapped across locations`}
            </p>
          </div>
        </div>
        <AssetMap assets={assets} />
      </div>
    </div>
  );
}
