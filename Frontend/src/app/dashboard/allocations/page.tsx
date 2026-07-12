'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';

export default function AllocationsPage() {
  const user = useAuthStore(state => state.user);
  const [activeTab, setActiveTab] = useState<'my-allocations' | 'all-allocations' | 'transfers'>('my-allocations');
  const [allocations, setAllocations] = useState<any[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // For Allocation Modal
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [allocateForm, setAllocateForm] = useState({ assetId: '', allocatedToUser: '', expectedReturnDate: '', notes: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'transfers') {
        const { data } = await api.get('/transfer-requests');
        setTransfers(data.data);
      } else {
        const url = activeTab === 'all-allocations' && (user?.role === 'admin' || user?.role === 'asset_manager') 
          ? '/allocations' 
          : `/allocations?user=${user?._id}`;
        const { data } = await api.get(url);
        setAllocations(data.data);
      }
    } catch (error) {
      console.error('Fetch failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/allocations', allocateForm);
      alert('Asset allocated successfully!');
      setShowAllocateModal(false);
      fetchData();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to allocate';
      // Conflict rule: If already taken, backend returns a specific error
      if (error.response?.status === 400 && msg.includes('already allocated')) {
        if (confirm(`${msg}. Do you want to request a transfer instead?`)) {
          handleTransferRequest(allocateForm.assetId);
        }
      } else {
        alert(msg);
      }
    }
  };

  const handleTransferRequest = async (assetId: string) => {
    const reason = prompt('Enter reason for transfer request:');
    if (!reason) return;
    try {
      await api.post('/transfer-requests', { asset: assetId, reason });
      alert('Transfer requested successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to request transfer');
    }
  };

  const handleReturn = async (allocationId: string) => {
    const condition = prompt('Enter return condition (New, Good, Fair, Poor, Damaged):', 'Good');
    if (!condition) return;
    try {
      await api.post(`/allocations/${allocationId}/return`, { returnCondition: condition });
      alert('Asset returned successfully!');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to return asset');
    }
  };

  const loadAllocateData = async () => {
    try {
      const [assetRes, empRes] = await Promise.all([
        api.get('/assets?status=Available'),
        api.get('/users')
      ]);
      setAssets(assetRes.data.data);
      setEmployees(empRes.data.data);
      setShowAllocateModal(true);
    } catch (error) {
      alert('Failed to load assets/employees');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Allocations & Transfers</h1>
          <p style={{ color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>Manage asset assignments and transfer requests.</p>
        </div>
        
        {(user?.role === 'admin' || user?.role === 'asset_manager') && (
          <button className="btn btn-primary" onClick={loadAllocateData}>Allocate Asset</button>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Tabs Header */}
        <div style={{ display: 'flex', borderBottom: '1px solid hsl(var(--border))', backgroundColor: 'hsla(var(--surface), 0.5)' }}>
          <button 
            onClick={() => setActiveTab('my-allocations')}
            style={{ 
              flex: 1, padding: '1rem', border: 'none', background: 'none', fontWeight: 500,
              borderBottom: activeTab === 'my-allocations' ? '2px solid hsl(var(--primary))' : '2px solid transparent',
              color: activeTab === 'my-allocations' ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))'
            }}>
            My Allocations
          </button>
          {(user?.role === 'admin' || user?.role === 'asset_manager') && (
            <button 
              onClick={() => setActiveTab('all-allocations')}
              style={{ 
                flex: 1, padding: '1rem', border: 'none', background: 'none', fontWeight: 500,
                borderBottom: activeTab === 'all-allocations' ? '2px solid hsl(var(--primary))' : '2px solid transparent',
                color: activeTab === 'all-allocations' ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))'
              }}>
              All Allocations
            </button>
          )}
          <button 
            onClick={() => setActiveTab('transfers')}
            style={{ 
              flex: 1, padding: '1rem', border: 'none', background: 'none', fontWeight: 500,
              borderBottom: activeTab === 'transfers' ? '2px solid hsl(var(--primary))' : '2px solid transparent',
              color: activeTab === 'transfers' ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))'
            }}>
            Transfer Requests
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {isLoading ? (
             <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--text-muted))' }}>Loading data...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid hsl(var(--border))', color: 'hsl(var(--text-muted))' }}>
                    {activeTab !== 'transfers' ? (
                      <>
                        <th style={{ padding: '1rem', fontWeight: 500 }}>Asset</th>
                        <th style={{ padding: '1rem', fontWeight: 500 }}>Allocated To</th>
                        <th style={{ padding: '1rem', fontWeight: 500 }}>Date Allocated</th>
                        <th style={{ padding: '1rem', fontWeight: 500 }}>Status</th>
                        <th style={{ padding: '1rem', fontWeight: 500 }}>Actions</th>
                      </>
                    ) : (
                      <>
                        <th style={{ padding: '1rem', fontWeight: 500 }}>Asset</th>
                        <th style={{ padding: '1rem', fontWeight: 500 }}>Requested By</th>
                        <th style={{ padding: '1rem', fontWeight: 500 }}>Reason</th>
                        <th style={{ padding: '1rem', fontWeight: 500 }}>Status</th>
                        <th style={{ padding: '1rem', fontWeight: 500 }}>Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {activeTab !== 'transfers' ? (
                    allocations.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>No allocations found.</td></tr>
                    ) : (
                      allocations.map(alloc => (
                        <tr key={alloc._id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                          <td style={{ padding: '1rem', fontWeight: 500 }}>{alloc.asset?.name} ({alloc.asset?.assetTag})</td>
                          <td style={{ padding: '1rem' }}>{alloc.allocatedToUser?.name}</td>
                          <td style={{ padding: '1rem' }}>{new Date(alloc.allocatedDate).toLocaleDateString()}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ 
                                padding: '0.25rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500,
                                backgroundColor: alloc.status === 'Active' ? 'hsla(var(--success), 0.1)' : 'hsla(var(--text-muted), 0.1)',
                                color: alloc.status === 'Active' ? 'hsl(var(--success))' : 'hsl(var(--text-muted))'
                              }}>
                              {alloc.status}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {alloc.status === 'Active' && alloc.allocatedToUser?._id === user?._id && (
                              <button onClick={() => handleReturn(alloc._id)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Return Asset</button>
                            )}
                          </td>
                        </tr>
                      ))
                    )
                  ) : (
                    transfers.length === 0 ? (
                      <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>No transfer requests found.</td></tr>
                    ) : (
                      transfers.map(tr => (
                        <tr key={tr._id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                          <td style={{ padding: '1rem', fontWeight: 500 }}>{tr.asset?.name} ({tr.asset?.assetTag})</td>
                          <td style={{ padding: '1rem' }}>{tr.requestedBy?.name}</td>
                          <td style={{ padding: '1rem' }}>{tr.reason}</td>
                          <td style={{ padding: '1rem' }}>{tr.status}</td>
                          <td style={{ padding: '1rem' }}>
                            {tr.status === 'Pending' && (user?.role === 'asset_manager' || user?.role === 'admin') && (
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Approve</button>
                                <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Reject</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Allocation Modal Placeholder */}
      {showAllocateModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Allocate Asset</h2>
            <form onSubmit={handleAllocate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Asset</label>
                <select className="input-field" required value={allocateForm.assetId} onChange={e => setAllocateForm({...allocateForm, assetId: e.target.value})}>
                  <option value="">Select Asset</option>
                  {assets.map(a => <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Employee</label>
                <select className="input-field" required value={allocateForm.allocatedToUser} onChange={e => setAllocateForm({...allocateForm, allocatedToUser: e.target.value})}>
                  <option value="">Select Employee</option>
                  {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Expected Return Date</label>
                <input type="date" className="input-field" value={allocateForm.expectedReturnDate} onChange={e => setAllocateForm({...allocateForm, expectedReturnDate: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAllocateModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Allocate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
