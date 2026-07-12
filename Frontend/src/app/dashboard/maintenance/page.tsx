'use client';

import { useState, useEffect } from 'react';
import { Plus, Wrench } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';

export default function MaintenancePage() {
  const user = useAuthStore(state => state.user);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [requestForm, setRequestForm] = useState({ assetId: '', issueDescription: '', priority: 'Medium' });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // If user is Admin/Asset Manager, fetch all. Otherwise fetch user's requests.
      const url = (user?.role === 'admin' || user?.role === 'asset_manager') 
        ? '/maintenance' 
        : `/maintenance?reportedBy=${user?._id}`;
      const { data } = await api.get(url);
      setRequests(data.data);
    } catch (error) {
      console.error('Failed to fetch maintenance', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAssets = async () => {
    try {
      const { data } = await api.get('/assets');
      setAssets(data.data);
      setShowModal(true);
    } catch (error) {
      alert('Failed to load assets');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', {
        asset: requestForm.assetId,
        issueDescription: requestForm.issueDescription,
        priority: requestForm.priority
      });
      alert('Maintenance request submitted successfully!');
      setShowModal(false);
      fetchRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit request');
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/maintenance/${id}/status`, { status: newStatus });
      fetchRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'var(--warning)';
      case 'Approved': return 'var(--info)';
      case 'In Progress': return 'var(--primary)';
      case 'Resolved': return 'var(--success)';
      case 'Rejected': return 'var(--error)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Maintenance Management</h1>
          <p style={{ color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>Track repairs and maintenance approvals.</p>
        </div>
        
        <button className="btn btn-primary" onClick={loadAssets} style={{ gap: '0.5rem' }}>
          <Plus size={16} /> Raise Request
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--text-muted))' }}>Loading maintenance requests...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(var(--border))', color: 'hsl(var(--text-muted))', backgroundColor: 'hsla(var(--surface), 0.5)' }}>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Asset</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Issue</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Reported By</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Priority</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                      No maintenance requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map(req => (
                    <tr key={req._id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{req.asset?.name} ({req.asset?.assetTag})</td>
                      <td style={{ padding: '1rem', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.issueDescription}</td>
                      <td style={{ padding: '1rem' }}>{req.reportedBy?.name}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem', 
                          fontWeight: 500,
                          backgroundColor: req.priority === 'High' || req.priority === 'Critical' ? 'hsla(var(--error), 0.1)' : 'hsla(var(--text-muted), 0.1)',
                          color: req.priority === 'High' || req.priority === 'Critical' ? 'hsl(var(--error))' : 'hsl(var(--text-muted))'
                        }}>
                          {req.priority}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.6rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.75rem', 
                          fontWeight: 500,
                          backgroundColor: `hsla(${getStatusColor(req.status)}, 0.1)`,
                          color: `hsl(${getStatusColor(req.status)})`
                        }}>
                          {req.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {(user?.role === 'admin' || user?.role === 'asset_manager') && req.status === 'Pending' && (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => updateStatus(req._id, 'Approved')} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Approve</button>
                            <button onClick={() => updateStatus(req._id, 'Rejected')} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Reject</button>
                          </div>
                        )}
                        {(user?.role === 'admin' || user?.role === 'asset_manager') && req.status === 'In Progress' && (
                          <button onClick={() => updateStatus(req._id, 'Resolved')} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'hsl(var(--success))' }}>Mark Resolved</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Raise Maintenance Request</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Asset *</label>
                <select className="input-field" required value={requestForm.assetId} onChange={e => setRequestForm({...requestForm, assetId: e.target.value})}>
                  <option value="">Select Asset</option>
                  {assets.map(a => <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Priority *</label>
                <select className="input-field" required value={requestForm.priority} onChange={e => setRequestForm({...requestForm, priority: e.target.value})}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Issue Description *</label>
                <textarea className="input-field" required rows={4} placeholder="Describe the problem..." value={requestForm.issueDescription} onChange={e => setRequestForm({...requestForm, issueDescription: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
