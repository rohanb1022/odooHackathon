'use client';

import { useState, useEffect } from 'react';
import { Plus, Wrench, CheckCircle, XCircle, Clock, AlertTriangle, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';

function getBadgeClass(status: string) {
  const m: Record<string, string> = {
    Pending: 'badge-pending', Approved: 'badge-approved',
    'In Progress': 'badge-in-progress', Resolved: 'badge-resolved', Rejected: 'badge-rejected',
  };
  return `badge ${m[status] || 'badge-standard'}`;
}

function getPriorityClass(p: string) {
  const m: Record<string, string> = {
    Critical: 'badge-critical', High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low',
  };
  return `badge ${m[p] || 'badge-standard'}`;
}

function getPriorityDot(p: string) {
  if (p === 'Critical') return '#EF4444';
  if (p === 'High')     return '#F59E0B';
  if (p === 'Medium')   return '#0EA5E9';
  return '#94A3B8';
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i} style={{ padding: '.875rem 1rem' }}>
          <div className="skeleton" style={{ height: 14, width: i === 1 ? '85%' : '65%', borderRadius: 4 }} />
        </td>
      ))}
    </tr>
  );
}

export default function MaintenancePage() {
  const user = useAuthStore(s => s.user);
  const [requests, setRequests]   = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [assets, setAssets]       = useState<any[]>([]);
  const [form, setForm]           = useState({ assetId: '', issueDescription: '', priority: 'Medium' });

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const url = (user?.role === 'admin' || user?.role === 'asset_manager')
        ? '/maintenance' : `/maintenance?reportedBy=${user?._id}`;
      const { data } = await api.get(url);
      setRequests(data.data);
    } catch {}
    finally { setIsLoading(false); }
  };

  const loadAssets = async () => {
    try {
      const { data } = await api.get('/assets');
      setAssets(data.data);
      setShowModal(true);
    } catch { alert('Failed to load assets'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', { assetId: form.assetId, description: form.issueDescription, priority: form.priority });
      alert('Maintenance request submitted successfully!');
      setShowModal(false);
      setForm({ assetId: '', issueDescription: '', priority: 'Medium' });
      fetchRequests();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to submit request'); }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      if (newStatus === 'Approved') {
        await api.patch(`/maintenance/${id}/approve`, {});
      } else if (newStatus === 'Rejected') {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        await api.patch(`/maintenance/${id}/reject`, { rejectionReason: reason });
      } else if (newStatus === 'Resolved') {
        await api.patch(`/maintenance/${id}/resolve`, {});
      }
      fetchRequests();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to update status'); }
  };

  const canManage = user?.role === 'admin' || user?.role === 'asset_manager';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance</h1>
          <p className="page-subtitle">Track repairs, approvals, and maintenance requests across all assets.</p>
        </div>
        <button className="btn btn-primary" onClick={loadAssets}>
          <Plus size={15} /> Raise Request
        </button>
      </div>

      {/* Summary chips */}
      {!isLoading && requests.length > 0 && (
        <div style={{ display: 'flex', gap: '.625rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Pending',     count: requests.filter(r => r.status === 'Pending').length,     color: '#F59E0B', bg: 'rgb(245,158,11/.1)', icon: Clock },
            { label: 'In Progress', count: requests.filter(r => r.status === 'In Progress').length, color: '#4F46E5', bg: 'rgb(79,70,229/.1)',  icon: Wrench },
            { label: 'Resolved',    count: requests.filter(r => r.status === 'Resolved').length,    color: '#10B981', bg: 'rgb(16,185,129/.1)', icon: CheckCircle },
            { label: 'Rejected',    count: requests.filter(r => r.status === 'Rejected').length,    color: '#EF4444', bg: 'rgb(239,68,68/.1)',  icon: XCircle },
          ].map(chip => {
            const Icon = chip.icon;
            return (
              <div key={chip.label} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.3rem .8rem', borderRadius: 999, background: chip.bg, border: `1px solid ${chip.color}25` }}>
                <Icon size={13} color={chip.color} />
                <span style={{ fontSize: '.78rem', fontWeight: 600, color: chip.color }}>{chip.count} {chip.label}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Issue Description</th>
                <th>Reported By</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                : requests.length === 0
                ? (
                  <tr><td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><Wrench size={22} /></div>
                      <p className="empty-state-title">No maintenance requests</p>
                      <p className="empty-state-desc">Raise a request when an asset needs attention.</p>
                    </div>
                  </td></tr>
                )
                : requests.map(req => (
                  <tr key={req._id}>
                    <td>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '.875rem' }}>{req.assetId?.name}</p>
                        <p style={{ fontSize: '.73rem', color: 'hsl(var(--text-muted))', fontFamily: 'monospace', marginTop: 1 }}>{req.assetId?.assetTag}</p>
                      </div>
                    </td>
                    <td style={{ maxWidth: 260 }}>
                      <p style={{ fontSize: '.8125rem', color: 'hsl(var(--text-secondary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
                        {req.description}
                      </p>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgb(79,70,229/.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 700, color: 'hsl(var(--primary))', flexShrink: 0 }}>
                          {req.raisedBy?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span style={{ fontSize: '.8125rem' }}>{req.raisedBy?.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={getPriorityClass(req.priority)} style={{ gap: '.35rem' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: getPriorityDot(req.priority), display: 'inline-block', flexShrink: 0 }} />
                        {req.priority}
                      </span>
                    </td>
                    <td><span className={getBadgeClass(req.status)}>{req.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                        {canManage && req.status === 'Pending' && (
                          <>
                            <button onClick={() => updateStatus(req._id, 'Approved')} className="btn btn-primary btn-sm">
                              <CheckCircle size={12} /> Approve
                            </button>
                            <button onClick={() => updateStatus(req._id, 'Rejected')} className="btn btn-outline btn-sm" style={{ color: 'hsl(var(--error))', borderColor: 'rgb(239,68,68/.3)' }}>
                              <XCircle size={12} /> Reject
                            </button>
                          </>
                        )}
                        {canManage && req.status === 'In Progress' && (
                          <button onClick={() => updateStatus(req._id, 'Resolved')} className="btn btn-success btn-sm">
                            <CheckCircle size={12} /> Mark Resolved
                          </button>
                        )}
                        {!canManage && req.status !== 'Pending' && (
                          <span style={{ fontSize: '.75rem', color: 'hsl(var(--text-muted))' }}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-panel">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgb(245,158,11/.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wrench size={17} color="#F59E0B" />
                </div>
                <h2 className="modal-title">Raise Maintenance Request</h2>
              </div>
              <button className="btn-icon btn-ghost" onClick={() => setShowModal(false)} style={{ color: 'hsl(var(--text-muted))' }}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <form id="maint-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Asset <span style={{ color: 'hsl(var(--error))' }}>*</span></label>
                  <select className="input-field" required value={form.assetId} onChange={e => setForm({ ...form, assetId: e.target.value })}>
                    <option value="">Select an asset…</option>
                    {assets.map(a => <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Priority <span style={{ color: 'hsl(var(--error))' }}>*</span></label>
                  <select className="input-field" required value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Issue Description <span style={{ color: 'hsl(var(--error))' }}>*</span></label>
                  <textarea className="input-field" required rows={4} placeholder="Describe the problem in detail…" value={form.issueDescription} onChange={e => setForm({ ...form, issueDescription: e.target.value })} style={{ resize: 'vertical' }} />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" form="maint-form" className="btn btn-primary">Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
