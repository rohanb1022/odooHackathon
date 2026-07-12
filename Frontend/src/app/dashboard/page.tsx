'use client';

import { useEffect, useState } from 'react';
import { Package, Wrench, Calendar, Repeat } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const user = useAuthStore(state => state.user);
  const [stats, setStats] = useState({
    assetsAvailable: 0,
    assetsAllocated: 0,
    maintenanceToday: 0,
    activeBookings: 0,
    pendingTransfers: 0,
    overdueReturns: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const { data } = await api.get('/dashboard');
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const statCards = [
    { title: 'Assets Available', value: stats.assetsAvailable, icon: Package, color: 'var(--primary)' },
    { title: 'Assets Allocated', value: stats.assetsAllocated, icon: Package, color: 'var(--info)' },
    { title: 'Maintenance Today', value: stats.maintenanceToday, icon: Wrench, color: 'var(--warning)' },
    { title: 'Active Bookings', value: stats.activeBookings, icon: Calendar, color: 'var(--success)' },
    { title: 'Pending Transfers', value: stats.pendingTransfers, icon: Repeat, color: 'var(--info)' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Welcome back, {user?.name?.split(' ')[0] || ''}!</h1>
          <p style={{ color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>Here's what's happening today.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary">Register Asset</button>
          <button className="btn btn-outline">Book Resource</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `hsla(${stat.color}, 0.1)`, color: `hsl(${stat.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))', fontWeight: 500 }}>{stat.title}</p>
                {isLoading ? (
                  <div style={{ width: '40px', height: '24px', backgroundColor: 'hsl(var(--border))', borderRadius: '4px', marginTop: '0.5rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
                ) : (
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem' }}>{stat.value}</h3>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overdue Returns Alert */}
      {stats.overdueReturns > 0 && (
        <div style={{ backgroundColor: 'hsla(var(--error), 0.1)', border: '1px solid hsla(var(--error), 0.3)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ color: 'hsl(var(--error))', marginTop: '2px' }}>
            <Calendar size={24} />
          </div>
          <div>
            <h3 style={{ color: 'hsl(var(--error))', fontWeight: 600, fontSize: '1.125rem' }}>Attention: Overdue Returns</h3>
            <p style={{ color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>There are {stats.overdueReturns} assets that are past their expected return date. Please check the notifications for details.</p>
          </div>
        </div>
      )}

      {/* Bottom Section - placeholders for charts or lists */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '300px' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Recent Activity</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'hsl(var(--text-muted))' }}>
            Activity list will be populated here
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '300px' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>My Allocations</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'hsl(var(--text-muted))' }}>
            Allocations list will be populated here
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}} />
    </div>
  );
}
