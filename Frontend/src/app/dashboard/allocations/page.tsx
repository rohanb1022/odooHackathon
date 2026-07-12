'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import { Repeat, ArrowLeftRight, Package, Plus, CheckCircle, X, RotateCcw } from 'lucide-react';

function getBadgeClass(status: string) {
  const m: Record<string, string> = {
    Active: 'badge-active', Returned: 'badge-completed',
    Pending: 'badge-pending', Approved: 'badge-approved',
    Rejected: 'badge-rejected', Cancelled: 'badge-cancelled',
  };
  return `badge ${m[status] || 'badge-standard'}`;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {[...Array(cols)].map((_, i) => (
        <td key={i} style={{ padding: '.875rem 1rem' }}>
          <div className="skeleton" style={{ height: 13, width: i === 0 ? '70%' : '55%', borderRadius: 4 }} />
        </td>
      ))}
    </tr>
  );
}

export default function AllocationsPage() {
  const user = useAuthStore(s => s.user);
  const [activeTab, setActiveTab] = useState<'my-allocations' | 'all-allocations' | 'transfers'>('my-allocations');
  const [allocations, setAllocations] = useState<any[]>([]);
  const [transfers, setTransfers]     = useState<any[]>([]);
  const [isLoading, setIsLoading]     = useState(true);

  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [assets, setAssets]       = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [allocateForm, setAllocateForm] = useState({ assetId: '', allocatedToUser: '', expectedReturnDate: '', notes: '' });

  const canManage = user?.role === 'admin' || user?.role === 'asset_manager';

  useEffect(() => { fetchData(); }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'transfers') {
        const { data } = await api.get('/transfer-requests');
        setTransfers(data.data);
      } else {
        const url = activeTab === 'all-allocations' && canManage
          ? '/allocations'
          : `/allocations?user=${user?._id}`;
        const { data } = await api.get(url);
        setAllocations(data.data);
      }
    } catch {}
    finally { setIsLoading(false); }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/allocations', allocateForm);
      alert('Asset allocated successfully!');
      setShowAllocateModal(false);
      setAllocateForm({ assetId: '', allocatedToUser: '', expectedReturnDate: '', notes: '' });
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to allocate';
      if (err.response?.status === 400 && msg.includes('already allocated')) {
        if (confirm(`${msg}. Do you want to request a transfer instead?`)) {
          handleTransferRequest(allocateForm.assetId);
        }
      } else { alert(msg); }
    }
  };

  const handleTransferRequest = async (assetId: string) => {
    const reason = prompt('Enter reason for transfer request:');
    if (!reason) return;
    try {
      await api.post('/transfer-requests', { asset: assetId, reason });
      alert('Transfer requested successfully!');
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to request transfer'); }
  };

  const handleReturn = async (allocationId: string) => {
    const condition = prompt('Enter return condition (New, Good, Fair, Poor, Damaged):', 'Good');
    if (!condition) return;
    try {
      await api.post(`/allocations/${allocationId}/return`, { returnCondition: condition });
      alert('Asset returned successfully!');
      fetchData();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to return asset'); }
  };

  const loadAllocateData = async () => {
    try {
      const [assetRes, empRes] = await Promise.all([api.get('/assets?status=Available'), api.get('/users')]);
      setAssets(assetRes.data.data);
      setEmployees(empRes.data.data);
      setShowAllocateModal(true);
    } catch { alert('Failed to load assets/employees'); }
  };

  const tabs = [
    { id: 'my-allocations',  label: 'My Allocations',  icon: Package,       show: true },
    { id: 'all-allocations', label: 'All Allocations',  icon: Repeat,        show: canManage },
    { id: 'transfers',       label: 'Transfer Requests',icon: ArrowLeftRight, show: true },
  ] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <div className="page-header">
        <div>
          <h1 className="page-title">Allocations & Transfers</h1>
          <p className="page-subtitle">Manage asset assignments and transfer requests across the organization.</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={loadAllocateData}>
            <Plus size={15} /> Allocate Asset
          </button>
        )}
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid hsl(var(--border))' }}>
          {tabs.filter(t => t.show).map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`tab-btn${active ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '0', overflowX: 'auto' }}>
          <table className="data-table">
            {activeTab !== 'transfers' ? (
              <>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Allocated To</th>
                    <th>Date Allocated</th>
                    <th>Expected Return</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? [...Array(5)].map((_, i) => <SkeletonRow key={i} cols={6} />)
                    : allocations.length === 0
                    ? (
                      <tr><td colSpan={6}>
                        <div className="empty-state">
                          <div className="empty-state-icon"><Package size={22} /></div>
                          <p className="empty-state-title">No allocations found</p>
                          <p className="empty-state-desc">Allocations will appear here once assets are assigned.</p>
                        </div>
                      </td></tr>
                    )
                    : allocations.map(alloc => (
                      <tr key={alloc._id}>
                        <td>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '.875rem' }}>{alloc.asset?.name}</p>
                            <p style={{ fontSize: '.73rem', color: 'hsl(var(--text-muted))', fontFamily: 'monospace', marginTop: 1 }}>{alloc.asset?.assetTag}</p>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgb(79,70,229/.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.68rem', fontWeight: 700, color: 'hsl(var(--primary))', flexShrink: 0 }}>
                              {alloc.allocatedToUser?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <span style={{ fontSize: '.8125rem' }}>{alloc.allocatedToUser?.name}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '.8125rem', color: 'hsl(var(--text-secondary))' }}>
                          {new Date(alloc.allocatedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td style={{ fontSize: '.8125rem', color: 'hsl(var(--text-secondary))' }}>
                          {alloc.expectedReturnDate ? new Date(alloc.expectedReturnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td><span className={getBadgeClass(alloc.status)}>{alloc.status}</span></td>
                        <td>
                          {alloc.status === 'Active' && alloc.allocatedToUser?._id === user?._id && (
                            <button onClick={() => handleReturn(alloc._id)} className="btn btn-outline btn-sm">
                              <RotateCcw size={12} /> Return Asset
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </>
            ) : (
              <>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Requested By</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? [...Array(4)].map((_, i) => <SkeletonRow key={i} cols={5} />)
                    : transfers.length === 0
                    ? (
                      <tr><td colSpan={5}>
                        <div className="empty-state">
                          <div className="empty-state-icon"><ArrowLeftRight size={22} /></div>
                          <p className="empty-state-title">No transfer requests</p>
                          <p className="empty-state-desc">Transfer requests will appear here once submitted.</p>
                        </div>
                      </td></tr>
                    )
                    : transfers.map(tr => (
                      <tr key={tr._id}>
                        <td>
                          <div>
                            <p style={{ fontWeight: 600, fontSize: '.875rem' }}>{tr.asset?.name}</p>
                            <p style={{ fontSize: '.73rem', color: 'hsl(var(--text-muted))', fontFamily: 'monospace', marginTop: 1 }}>{tr.asset?.assetTag}</p>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgb(79,70,229/.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.68rem', fontWeight: 700, color: 'hsl(var(--primary))', flexShrink: 0 }}>
                              {tr.requestedBy?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <span style={{ fontSize: '.8125rem' }}>{tr.requestedBy?.name}</span>
                          </div>
                        </td>
                        <td style={{ maxWidth: 220 }}>
                          <p style={{ fontSize: '.8125rem', color: 'hsl(var(--text-secondary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{tr.reason}</p>
                        </td>
                        <td><span className={getBadgeClass(tr.status)}>{tr.status}</span></td>
                        <td>
                          {tr.status === 'Pending' && canManage && (
                            <div style={{ display: 'flex', gap: '.4rem' }}>
                              <button className="btn btn-primary btn-sm">
                                <CheckCircle size={12} /> Approve
                              </button>
                              <button className="btn btn-outline btn-sm" style={{ color: 'hsl(var(--error))', borderColor: 'rgb(239,68,68/.3)' }}>
                                <X size={12} /> Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>

      {/* Allocate modal */}
      {showAllocateModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAllocateModal(false)}>
          <div className="modal-panel">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgb(79,70,229/.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={17} color="#4F46E5" />
                </div>
                <h2 className="modal-title">Allocate Asset</h2>
              </div>
              <button className="btn-icon btn-ghost" onClick={() => setShowAllocateModal(false)} style={{ color: 'hsl(var(--text-muted))' }}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <form id="alloc-form" onSubmit={handleAllocate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Asset <span style={{ color: 'hsl(var(--error))' }}>*</span></label>
                  <select className="input-field" required value={allocateForm.assetId} onChange={e => setAllocateForm({ ...allocateForm, assetId: e.target.value })}>
                    <option value="">Select available asset…</option>
                    {assets.map(a => <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Employee <span style={{ color: 'hsl(var(--error))' }}>*</span></label>
                  <select className="input-field" required value={allocateForm.allocatedToUser} onChange={e => setAllocateForm({ ...allocateForm, allocatedToUser: e.target.value })}>
                    <option value="">Select employee…</option>
                    {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Expected Return Date</label>
                  <input type="date" className="input-field" value={allocateForm.expectedReturnDate} onChange={e => setAllocateForm({ ...allocateForm, expectedReturnDate: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">Notes</label>
                  <input type="text" className="input-field" placeholder="Optional allocation notes…" value={allocateForm.notes} onChange={e => setAllocateForm({ ...allocateForm, notes: e.target.value })} />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowAllocateModal(false)}>Cancel</button>
              <button type="submit" form="alloc-form" className="btn btn-primary">Allocate Asset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
