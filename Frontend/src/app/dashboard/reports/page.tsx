'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Activity, Download } from 'lucide-react';
import api from '@/lib/axios';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'activity'>('analytics');
  const [reports, setReports] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === 'analytics') {
          const { data } = await api.get('/reports/assets');
          setReports(data.data);
        } else {
          const { data } = await api.get('/activity-logs');
          setLogs(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Reports & Logs</h1>
          <p style={{ color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>View operational insights and system activity.</p>
        </div>
        
        {activeTab === 'analytics' && (
          <button className="btn btn-outline" style={{ gap: '0.5rem' }}>
            <Download size={16} /> Export PDF
          </button>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid hsl(var(--border))', backgroundColor: 'hsla(var(--surface), 0.5)' }}>
          <button 
            onClick={() => setActiveTab('analytics')}
            style={{ 
              flex: 1, padding: '1rem', border: 'none', background: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              borderBottom: activeTab === 'analytics' ? '2px solid hsl(var(--primary))' : '2px solid transparent',
              color: activeTab === 'analytics' ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))'
            }}>
            <BarChart3 size={18} /> Analytics Summary
          </button>
          <button 
            onClick={() => setActiveTab('activity')}
            style={{ 
              flex: 1, padding: '1rem', border: 'none', background: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              borderBottom: activeTab === 'activity' ? '2px solid hsl(var(--primary))' : '2px solid transparent',
              color: activeTab === 'activity' ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))'
            }}>
            <Activity size={18} /> Activity Logs
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--text-muted))' }}>Loading...</div>
          ) : activeTab === 'analytics' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {/* Financial Summary */}
                <div style={{ border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '1.5rem', backgroundColor: 'hsla(var(--primary), 0.05)', gridColumn: '1 / -1' }}>
                  <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Financial Overview</h3>
                  {reports?.summary ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>Total Purchase Cost</p>
                        <h4 style={{ fontSize: '1.5rem', fontWeight: 600 }}>${reports.summary.totalPurchaseCost?.toLocaleString()}</h4>
                      </div>
                      <div>
                        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>Est. Depreciation</p>
                        <h4 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'hsl(var(--warning))' }}>${reports.summary.totalEstimatedDepreciation?.toLocaleString()}</h4>
                      </div>
                      <div>
                        <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>Current Valuation</p>
                        <h4 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'hsl(var(--success))' }}>${reports.summary.totalCurrentValuation?.toLocaleString()}</h4>
                      </div>
                    </div>
                  ) : <p>No data available</p>}
                </div>

                <div style={{ border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '1.5rem' }}>
                  <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Asset Status Distribution</h3>
                  {reports?.statusDistribution ? (
                  <ul style={{ listStyle: 'none' }}>
                    {reports.statusDistribution.map((stat: any) => (
                      <li key={stat._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'hsl(var(--text-muted))' }}>{stat._id}</span>
                        <span style={{ fontWeight: 600 }}>{stat.count}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p>No data available</p>}
              </div>
              <div style={{ border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Category Distribution</h3>
                {reports?.categoryDistribution ? (
                  <ul style={{ listStyle: 'none' }}>
                    {reports.categoryDistribution.map((stat: any) => (
                      <li key={stat.categoryName} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'hsl(var(--text-muted))' }}>{stat.categoryName}</span>
                        <span style={{ fontWeight: 600 }}>{stat.count}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p>No data available</p>}
              </div>
              <div style={{ border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '1.5rem', gridColumn: '1 / -1' }}>
                 <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Attention Needed</h3>
                 {reports?.nearingRetirementAssets?.length > 0 || reports?.dueForMaintenanceAssets?.length > 0 ? (
                   <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                     {reports.nearingRetirementAssets?.map((a: any) => <li key={a._id} style={{ color: 'hsl(var(--warning))' }}>⚠️ {a.name} is nearing retirement.</li>)}
                     {reports.dueForMaintenanceAssets?.map((a: any) => <li key={a._id} style={{ color: 'hsl(var(--error))' }}>🔧 {a.name} is due for maintenance.</li>)}
                   </ul>
                 ) : <p style={{ color: 'hsl(var(--text-muted))' }}>No assets require immediate attention.</p>}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid hsl(var(--border))', color: 'hsl(var(--text-muted))' }}>
                    <th style={{ padding: '1rem', fontWeight: 500 }}>Action</th>
                    <th style={{ padding: '1rem', fontWeight: 500 }}>User</th>
                    <th style={{ padding: '1rem', fontWeight: 500 }}>Entity</th>
                    <th style={{ padding: '1rem', fontWeight: 500 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>No activity logs found.</td></tr>
                  ) : (
                    logs.map(log => (
                      <tr key={log._id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                        <td style={{ padding: '1rem', fontWeight: 500, color: 'hsl(var(--primary))' }}>{log.action}</td>
                        <td style={{ padding: '1rem' }}>{log.actorId?.name || log.actorId?.firstName || 'System'}</td>
                        <td style={{ padding: '1rem' }}>{log.targetModel} {log.meta?.name || log.meta?.title ? `(${log.meta.name || log.meta.title})` : ''}</td>
                        <td style={{ padding: '1rem' }}>{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
