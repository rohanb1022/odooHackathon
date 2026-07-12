'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import { Plus, FileCheck, ExternalLink, ChevronRight } from 'lucide-react';

function getBadgeClass(status: string) {
  if (status === 'Closed' || status === 'Completed') return 'badge badge-completed';
  if (status === 'Open' || status === 'Active')      return 'badge badge-ongoing';
  return 'badge badge-pending';
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i} style={{ padding: '.875rem 1rem' }}>
          <div className="skeleton" style={{ height: 14, width: i === 0 ? '70%' : '55%', borderRadius: 4 }} />
        </td>
      ))}
    </tr>
  );
}

export default function AuditsPage() {
  const user = useAuthStore(s => s.user);
  const router = useRouter();
  const [audits, setAudits]       = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchAudits(); }, []);

  const fetchAudits = async () => {
    try {
      const { data } = await api.get('/audit-cycles');
      setAudits(data.data.auditCycles || []);
    } catch {}
    finally { setIsLoading(false); }
  };

  const handleCreateAudit = async () => {
    const title = prompt('Enter Audit Cycle Name:');
    if (!title) return;
    try {
      await api.post('/audit-cycles', {
        title,
        dateRangeStart: new Date().toISOString(),
        dateRangeEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        scopeType: 'all',
      });
      fetchAudits();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to create audit'); }
  };

  const canManage = user?.role === 'admin' || user?.role === 'asset_manager';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <div className="page-header">
        <div>
          <h1 className="page-title">Asset Audits</h1>
          <p className="page-subtitle">Run structured verification cycles to ensure asset accuracy.</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={handleCreateAudit}>
            <Plus size={15} /> New Audit Cycle
          </button>
        )}
      </div>

      {/* Summary cards */}
      {!isLoading && audits.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: '1rem' }}>
          {[
            { label: 'Total Cycles',    value: audits.length,                                        color: '#4F46E5', bg: 'rgb(79,70,229/.08)' },
            { label: 'Active',          value: audits.filter(a => a.status !== 'Closed').length,     color: '#0EA5E9', bg: 'rgb(14,165,233/.08)' },
            { label: 'Closed',          value: audits.filter(a => a.status === 'Closed').length,     color: '#10B981', bg: 'rgb(16,185,129/.08)' },
          ].map(card => (
            <div key={card.label} style={{ background: card.bg, border: `1px solid ${card.color}22`, borderRadius: 12, padding: '1rem 1.25rem' }}>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: card.color, letterSpacing: '-.03em' }}>{card.value}</p>
              <p style={{ fontSize: '.78rem', color: 'hsl(var(--text-muted))', marginTop: 2, fontWeight: 500 }}>{card.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Audit Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Scope</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
                : audits.length === 0
                ? (
                  <tr><td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><FileCheck size={22} /></div>
                      <p className="empty-state-title">No audit cycles</p>
                      <p className="empty-state-desc">Create a new audit cycle to begin verifying assets.</p>
                    </div>
                  </td></tr>
                )
                : audits.map(audit => (
                  <tr key={audit._id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/dashboard/audits/${audit._id}`)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                        <div style={{ width: 30, height: 30, borderRadius: 7, background: 'rgb(79,70,229/.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileCheck size={14} color="#4F46E5" />
                        </div>
                        <span style={{ fontWeight: 600 }}>{audit.title}</span>
                      </div>
                    </td>
                    <td style={{ color: 'hsl(var(--text-secondary))', fontSize: '.8125rem' }}>
                      {new Date(audit.dateRangeStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ color: 'hsl(var(--text-secondary))', fontSize: '.8125rem' }}>
                      {new Date(audit.dateRangeEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <span style={{ fontSize: '.8rem', color: 'hsl(var(--text-secondary))', background: 'hsl(var(--surface-raised))', padding: '.15rem .5rem', borderRadius: 5, border: '1px solid hsl(var(--border))', textTransform: 'capitalize' }}>
                        {audit.scopeType}
                      </span>
                    </td>
                    <td><span className={getBadgeClass(audit.status)}>{audit.status}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => router.push(`/dashboard/audits/${audit._id}`)}
                      >
                        View Details <ChevronRight size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
