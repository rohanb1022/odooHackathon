'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, CheckCircle, AlertTriangle, ShieldCheck, UserPlus, XCircle } from 'lucide-react';

export default function AuditDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  
  const [audit, setAudit] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // For Assigning Auditors
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedAuditor, setSelectedAuditor] = useState('');
  
  // For Verifying Assets
  const [assets, setAssets] = useState<any[]>([]);
  const [verifyForm, setVerifyForm] = useState({ assetId: '', result: 'Verified', notes: '' });

  useEffect(() => {
    fetchAuditDetails();
    if (user?.role === 'admin' || user?.role === 'asset_manager') {
      fetchEmployees();
    }
    fetchAssets();
  }, [id, user]);

  const fetchAuditDetails = async () => {
    try {
      const { data } = await api.get(`/audit-cycles/${id}`);
      setAudit(data.data.auditCycle);
      setRecords(data.data.records || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load audit details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/users');
      // If the backend wraps it in data.data or returns directly due to the interceptor
      const usersList = Array.isArray(data.data) ? data.data : (data.data?.users || []);
      setEmployees(usersList);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssets = async () => {
    try {
      const { data } = await api.get('/assets');
      setAssets(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignAuditor = async () => {
    if (!selectedAuditor) return;
    try {
      const currentIds = audit.auditorIds.map((a: any) => a._id);
      if (currentIds.includes(selectedAuditor)) {
        return alert('User is already assigned as an auditor.');
      }
      const newIds = [...currentIds, selectedAuditor];
      await api.post(`/audit-cycles/${id}/assign`, { auditorIds: newIds });
      alert('Auditor assigned successfully');
      setSelectedAuditor('');
      fetchAuditDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign auditor');
    }
  };

  const handleVerifyAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/audit-cycles/${id}/verify`, verifyForm);
      alert('Asset verified successfully');
      setVerifyForm({ assetId: '', result: 'Verified', notes: '' });
      fetchAuditDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to verify asset');
    }
  };

  const handleCloseAudit = async () => {
    if (!confirm('Are you sure you want to close this audit cycle? This action cannot be undone and will update asset statuses.')) return;
    try {
      await api.post(`/audit-cycles/${id}/close`);
      alert('Audit cycle closed successfully');
      fetchAuditDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to close audit cycle');
    }
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (!audit) return <div style={{ padding: '2rem', textAlign: 'center' }}>Audit not found</div>;

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'asset_manager';
  const isAssignedAuditor = audit.auditorIds.some((a: any) => a._id === user?._id);
  const canVerify = (isAdminOrManager || isAssignedAuditor) && audit.status !== 'Closed';

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <button 
        onClick={() => router.push('/dashboard/audits')}
        style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} /> Back to Audits
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {audit.title}
            <span style={{ 
              padding: '0.25rem 0.75rem', 
              borderRadius: '9999px', 
              fontSize: '0.875rem', 
              backgroundColor: audit.status === 'Closed' ? 'hsla(var(--success), 0.1)' : 'hsla(var(--primary), 0.1)',
              color: audit.status === 'Closed' ? 'hsl(var(--success))' : 'hsl(var(--primary))'
            }}>
              {audit.status}
            </span>
          </h1>
          <p style={{ color: 'hsl(var(--text-muted))', marginTop: '0.5rem' }}>
            Scope: {audit.scopeType.toUpperCase()} | Dates: {new Date(audit.dateRangeStart).toLocaleDateString()} - {new Date(audit.dateRangeEnd).toLocaleDateString()}
          </p>
        </div>
        {isAdminOrManager && audit.status !== 'Closed' && (
          <button className="btn btn-primary" onClick={handleCloseAudit} style={{ backgroundColor: 'hsl(var(--error))', color: 'white' }}>
            Close Audit Cycle
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Column: Verification Form & Records */}
        <div>
          {canVerify && (
            <div className="glass-panel" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} className="text-primary" /> Verify Asset
              </h3>
              <form onSubmit={handleVerifyAsset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="label">Select Asset</label>
                  <select 
                    className="input" 
                    required
                    value={verifyForm.assetId}
                    onChange={e => setVerifyForm({...verifyForm, assetId: e.target.value})}
                  >
                    <option value="">-- Choose Asset --</option>
                    {assets.map(a => (
                      <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Condition/Status</label>
                  <select 
                    className="input" 
                    value={verifyForm.result}
                    onChange={e => setVerifyForm({...verifyForm, result: e.target.value})}
                  >
                    <option value="Verified">Verified (Present & Good)</option>
                    <option value="Damaged">Damaged (Needs repair)</option>
                    <option value="Missing">Missing (Not found)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Notes (Optional)</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Any discrepancies or condition notes..." 
                    value={verifyForm.notes}
                    onChange={e => setVerifyForm({...verifyForm, notes: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn btn-primary">Record Verification</button>
              </form>
            </div>
          )}

          <div className="glass-panel">
            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Verification Records ({records.length})</h3>
            {records.length === 0 ? (
              <p style={{ color: 'hsl(var(--text-muted))', padding: '2rem', textAlign: 'center' }}>No assets have been verified yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {records.map(record => (
                  <div key={record._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid hsl(var(--border))' }}>
                    <div>
                      <p style={{ fontWeight: 500 }}>{record.assetId?.name} ({record.assetId?.assetTag})</p>
                      <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>
                        Verified by {record.auditorId?.firstName} at {new Date(record.verifiedAt).toLocaleString()}
                      </p>
                      {record.notes && <p style={{ fontSize: '0.875rem', fontStyle: 'italic', marginTop: '0.25rem' }}>Note: {record.notes}</p>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {record.result === 'Verified' && <CheckCircle size={20} style={{ color: 'hsl(var(--success))' }} />}
                      {record.result === 'Damaged' && <AlertTriangle size={20} style={{ color: 'hsl(var(--warning))' }} />}
                      {record.result === 'Missing' && <XCircle size={20} style={{ color: 'hsl(var(--error))' }} />}
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{record.result}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Auditors & Discrepancy Report */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {audit.status === 'Closed' && audit.discrepancyReport && (
            <div className="glass-panel" style={{ backgroundColor: 'hsla(var(--warning), 0.05)', borderColor: 'hsla(var(--warning), 0.2)' }}>
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Discrepancy Report</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Assets in Scope:</span> <span style={{ fontWeight: 600 }}>{audit.discrepancyReport.totalAssets}</span></li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Verified Present:</span> <span style={{ fontWeight: 600, color: 'hsl(var(--success))' }}>{audit.discrepancyReport.verified}</span></li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Missing (Lost):</span> <span style={{ fontWeight: 600, color: 'hsl(var(--error))' }}>{audit.discrepancyReport.missing}</span></li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Damaged:</span> <span style={{ fontWeight: 600, color: 'hsl(var(--warning))' }}>{audit.discrepancyReport.damaged}</span></li>
              </ul>
            </div>
          )}

          <div className="glass-panel">
            <h3 style={{ fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={20} /> Assigned Auditors
            </h3>
            
            {isAdminOrManager && audit.status !== 'Closed' && (
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <select 
                  className="input" 
                  value={selectedAuditor}
                  onChange={e => setSelectedAuditor(e.target.value)}
                >
                  <option value="">-- Add Auditor --</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name || emp.firstName + ' ' + emp.lastName}</option>
                  ))}
                </select>
                <button className="btn btn-primary" onClick={handleAssignAuditor}>Add</button>
              </div>
            )}

            {audit.auditorIds.length === 0 ? (
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>No auditors assigned yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {audit.auditorIds.map((auditor: any) => (
                  <li key={auditor._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', padding: '0.5rem', backgroundColor: 'hsla(var(--surface), 0.5)', borderRadius: '6px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '0.75rem' }}>
                      {(auditor.firstName?.[0] || auditor.name?.[0] || '?').toUpperCase()}
                    </div>
                    {auditor.firstName} {auditor.lastName}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
