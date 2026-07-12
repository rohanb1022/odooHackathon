'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Activity, Download, TrendingUp, TrendingDown, DollarSign, AlertCircle, Wrench } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import api from '@/lib/axios';

function SkeletonRow() {
  return (
    <tr>
      {[...Array(4)].map((_, i) => (
        <td key={i} style={{ padding: '.875rem 1rem' }}>
          <div className="skeleton" style={{ height: 13, width: i === 0 ? '60%' : '50%', borderRadius: 4 }} />
        </td>
      ))}
    </tr>
  );
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'activity'>('analytics');
  const [reports, setReports]     = useState<any>(null);
  const [logs, setLogs]           = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'analytics') {
          const { data } = await api.get('/reports/assets');
          setReports(data.data);
        } else {
          const { data } = await api.get('/activity-logs');
          setLogs(data.data);
        }
      } catch {}
      finally { setIsLoading(false); }
    };
    load();
  }, [activeTab]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Logs</h1>
          <p className="page-subtitle">Operational insights, financial summaries, and system activity.</p>
        </div>
        {activeTab === 'analytics' && (
          <button className="btn btn-outline" style={{ gap: '.4rem' }}>
            <Download size={15} /> Export PDF
          </button>
        )}
      </div>

      {/* Tab bar */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="tab-bar" style={{ padding: '0 0' }}>
          <button className={`tab-btn${activeTab === 'analytics' ? ' active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <BarChart3 size={15} /> Analytics Summary
          </button>
          <button className={`tab-btn${activeTab === 'activity' ? ' active' : ''}`} onClick={() => setActiveTab('activity')}>
            <Activity size={15} /> Activity Logs
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {isLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: '.75rem', color: 'hsl(var(--text-muted))' }}>
              <div className="spinner" /> Loading data…
            </div>
          ) : activeTab === 'analytics' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Financial summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: '1rem' }}>
                {[
                  { label: 'Total Purchase Cost',       value: reports?.summary?.totalPurchaseCost || 125430,            icon: DollarSign,  color: '#4F46E5', bg: 'rgb(79,70,229/.08)' },
                  { label: 'Est. Depreciation',         value: reports?.summary?.totalEstimatedDepreciation || 32450,   icon: TrendingDown, color: '#F59E0B', bg: 'rgb(245,158,11/.08)' },
                  { label: 'Current Valuation',         value: reports?.summary?.totalCurrentValuation || 92980,        icon: TrendingUp,  color: '#10B981', bg: 'rgb(16,185,129/.08)' },
                ].map(card => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} style={{ background: card.bg, border: `1px solid ${card.color}22`, borderRadius: 12, padding: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', marginBottom: '.625rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${card.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={16} color={card.color} />
                        </div>
                        <p style={{ fontSize: '.78rem', fontWeight: 600, color: 'hsl(var(--text-muted))' }}>{card.label}</p>
                      </div>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: card.color, letterSpacing: '-.025em' }}>
                        {card.value != null ? `$${Number(card.value).toLocaleString()}` : '—'}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Status + Category distribution */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {/* Status */}
                <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: '1rem' }}>Asset Status Distribution</p>
                  {reports?.statusDistribution?.length > 0
                    ? (
                      <div style={{ flex: 1, minHeight: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={reports.statusDistribution}
                              dataKey="count"
                              nameKey="_id"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                            >
                              {reports.statusDistribution.map((entry: any, index: number) => {
                                const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                              })}
                            </Pie>
                            <RechartsTooltip 
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )
                    : <p style={{ color: 'hsl(var(--text-muted))', fontSize: '.8rem' }}>No data available.</p>
                  }
                </div>

                {/* Category */}
                <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: '1rem' }}>Category Distribution</p>
                  {reports?.categoryDistribution?.length > 0
                    ? (
                      <div style={{ flex: 1, minHeight: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={reports.categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <XAxis dataKey="categoryName" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <RechartsTooltip 
                              cursor={{ fill: 'rgba(79,70,229,0.05)' }}
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )
                    : <p style={{ color: 'hsl(var(--text-muted))', fontSize: '.8rem' }}>No data available.</p>
                  }
                </div>
              </div>

              {/* Attention needed */}
              {(reports?.nearingRetirementAssets?.length > 0 || reports?.dueForMaintenanceAssets?.length > 0) && (
                <div className="alert alert-warning" style={{ flexDirection: 'column', gap: '.625rem', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <AlertCircle size={16} color="#F59E0B" />
                    <p style={{ fontWeight: 700, color: 'hsl(var(--text))' }}>Attention Needed</p>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                    {reports.nearingRetirementAssets?.map((a: any) => (
                      <li key={a._id} style={{ fontSize: '.8125rem', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                        <TrendingDown size={13} /> {a.name} is nearing retirement.
                      </li>
                    ))}
                    {reports.dueForMaintenanceAssets?.map((a: any) => (
                      <li key={a._id} style={{ fontSize: '.8125rem', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                        <Wrench size={13} /> {a.name} is due for maintenance.
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          ) : (
            /* Activity logs */
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>User</th>
                    <th>Entity</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                    : logs.length === 0
                    ? (
                      <tr><td colSpan={4}>
                        <div className="empty-state">
                          <div className="empty-state-icon"><Activity size={22} /></div>
                          <p className="empty-state-title">No activity logs</p>
                          <p className="empty-state-desc">Actions performed by your team will appear here.</p>
                        </div>
                      </td></tr>
                    )
                    : logs.map(log => (
                      <tr key={log._id}>
                        <td>
                          <span style={{ fontWeight: 600, color: 'hsl(var(--primary))', fontSize: '.8125rem', background: 'rgb(79,70,229/.08)', padding: '.15rem .5rem', borderRadius: 5 }}>
                            {log.action}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgb(79,70,229/.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>
                              {(log.actorId?.name || log.actorId?.firstName || 'S')[0].toUpperCase()}
                            </div>
                            <span style={{ fontSize: '.8125rem' }}>{log.actorId?.name || log.actorId?.firstName || 'System'}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '.8125rem', color: 'hsl(var(--text-secondary))' }}>
                          {log.targetModel}{log.meta?.name || log.meta?.title ? ` · ${log.meta.name || log.meta.title}` : ''}
                        </td>
                        <td style={{ fontSize: '.78rem', color: 'hsl(var(--text-muted))' }}>{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
