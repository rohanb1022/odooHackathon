import React, { useState, useEffect } from 'react';
import { Plus, Wrench, ChevronDown, ChevronUp, Sparkles, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';

export default function MaintenancePage() {
  const user = useAuthStore(state => state.user);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Row Expansion State
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [requestForm, setRequestForm] = useState({ assetId: '', issueDescription: '', priority: 'Medium' });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
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
        assetId: requestForm.assetId,
        description: requestForm.issueDescription,
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
      if (newStatus === 'Approved') {
        await api.patch(`/maintenance/${id}/approve`, {});
      } else if (newStatus === 'Rejected') {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;
        await api.patch(`/maintenance/${id}/reject`, { rejectionReason: reason });
      } else if (newStatus === 'Resolved') {
        await api.patch(`/maintenance/${id}/resolve`, {});
      }
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

  const toggleRow = (reqId: string) => {
    setExpandedId(expandedId === reqId ? null : reqId);
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
                  <th style={{ padding: '1rem', width: '48px' }}></th>
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
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                      No maintenance requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map(req => {
                    const isExpanded = expandedId === req._id;
                    const diagnostic = req.aiDiagnostic;
                    
                    return (
                      <React.Fragment key={req._id}>
                        <tr 
                          onClick={() => toggleRow(req._id)}
                          style={{ 
                            borderBottom: '1px solid hsl(var(--border))',
                            cursor: 'pointer',
                            backgroundColor: isExpanded ? 'hsla(var(--primary), 0.02)' : 'transparent',
                            transition: 'background-color var(--transition-fast)'
                          }}
                          className="hover:bg-hsla-surface"
                        >
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 500 }}>{req.assetId?.name} ({req.assetId?.assetTag})</td>
                          <td style={{ padding: '1rem', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.description}</td>
                          <td style={{ padding: '1rem' }}>{req.raisedBy?.name}</td>
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
                          <td style={{ padding: '1rem' }} onClick={(e) => e.stopPropagation()}>
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

                        {isExpanded && (
                          <tr style={{ backgroundColor: 'hsla(var(--secondary), 0.3)' }}>
                            <td colSpan={7} style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))' }}>
                              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--text))', marginBottom: '0.5rem' }}>Full Description of Issue</h4>
                                  <p style={{ fontSize: '0.875rem', lineHeight: '1.5', color: 'hsl(var(--text))', backgroundColor: 'hsl(var(--surface))', padding: '0.75rem', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}>
                                    {req.description}
                                  </p>
                                </div>

                                {diagnostic ? (
                                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', borderTop: '1px solid hsl(var(--border))', paddingTop: '1rem', marginTop: '1rem' }}>
                                    
                                    {/* Left: Suggested Actions */}
                                    <div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'purple', marginBottom: '0.75rem' }}>
                                        <Sparkles size={16} />
                                        <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>AI Recommended Fix Checklist</span>
                                      </div>
                                      
                                      <div 
                                        style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'hsl(var(--text))', backgroundColor: 'hsl(var(--surface))', padding: '1rem', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                        dangerouslySetInnerHTML={{ __html: diagnostic.suggestedActions.replace(/\n/g, '<br/>') }}
                                      />
                                    </div>

                                    {/* Right: Technical Insights */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                      <div>
                                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>AI Suggested Priority:</span>
                                        <span style={{ 
                                          padding: '0.25rem 0.6rem', 
                                          borderRadius: '9999px', 
                                          fontSize: '0.75rem', 
                                          fontWeight: 700,
                                          backgroundColor: diagnostic.recommendedPriority === 'High' || diagnostic.recommendedPriority === 'Critical' ? 'hsla(var(--error), 0.1)' : 'hsla(var(--info), 0.1)',
                                          color: diagnostic.recommendedPriority === 'High' || diagnostic.recommendedPriority === 'Critical' ? 'hsl(var(--error))' : 'hsl(var(--info))'
                                        }}>
                                          {diagnostic.recommendedPriority}
                                        </span>
                                      </div>

                                      <div>
                                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 500, display: 'block', marginBottom: '0.25rem' }}>Probable Failure Root Causes:</span>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                                          {diagnostic.probableCauses?.map((cause: string, cidx: number) => (
                                            <div key={cidx} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'hsl(var(--text))' }}>
                                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'purple' }}></span>
                                              {cause}
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {diagnostic.suggestedSpareParts?.length > 0 && (
                                        <div>
                                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>Suggested Spare Parts / Tools:</span>
                                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {diagnostic.suggestedSpareParts.map((part: string, pidx: number) => (
                                              <span key={pidx} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: 'hsla(270, 50%, 40%, 0.1)', color: 'purple', fontWeight: 600 }}>
                                                🔧 {part}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      
                                      <div style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', marginTop: '0.5rem' }}>
                                        AI analysis performed on {new Date(diagnostic.analyzedAt || req.createdAt).toLocaleString()}
                                      </div>
                                    </div>

                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderTop: '1px solid hsl(var(--border))', paddingTop: '1rem', marginTop: '1rem', color: 'hsl(var(--text-muted))' }}>
                                    <AlertTriangle size={16} />
                                    <span style={{ fontSize: '0.85rem' }}>No automated AI diagnostics generated for this legacy request. Newly created requests will process automatically.</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
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
