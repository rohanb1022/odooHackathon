'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import { Plus } from 'lucide-react';

export default function AuditsPage() {
  const user = useAuthStore(state => state.user);
  const [audits, setAudits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      const { data } = await api.get('/audit-cycles');
      setAudits(data.data);
    } catch (error) {
      console.error('Failed to fetch audits', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAudit = async () => {
    const name = prompt('Enter Audit Cycle Name:');
    if (!name) return;
    try {
      await api.post('/audit-cycles', {
        name,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
        scope: { all: true }
      });
      alert('Audit cycle created');
      fetchAudits();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create audit');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Asset Audits</h1>
          <p style={{ color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>Run structured verification cycles.</p>
        </div>
        
        {(user?.role === 'admin' || user?.role === 'asset_manager') && (
          <button className="btn btn-primary" onClick={handleCreateAudit} style={{ gap: '0.5rem' }}>
            <Plus size={16} /> New Audit Cycle
          </button>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--text-muted))' }}>Loading audits...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(var(--border))', color: 'hsl(var(--text-muted))', backgroundColor: 'hsla(var(--surface), 0.5)' }}>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Audit Name</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Start Date</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>End Date</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Auditors</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {audits.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                      No audit cycles found.
                    </td>
                  </tr>
                ) : (
                  audits.map(audit => (
                    <tr key={audit._id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{audit.name}</td>
                      <td style={{ padding: '1rem' }}>{new Date(audit.startDate).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem' }}>{new Date(audit.endDate).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.6rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.75rem', 
                          fontWeight: 500,
                          backgroundColor: audit.status === 'Completed' ? 'hsla(var(--success), 0.1)' : 'hsla(var(--info), 0.1)',
                          color: audit.status === 'Completed' ? 'hsl(var(--success))' : 'hsl(var(--info))'
                        }}>
                          {audit.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>{audit.assignedAuditors?.length || 0}</td>
                      <td style={{ padding: '1rem' }}>
                        <button className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>View Details</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
