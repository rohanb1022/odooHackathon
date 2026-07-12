'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, CheckCircle, AlertTriangle, ShieldCheck, UserPlus, XCircle, FileCheck } from 'lucide-react';

export default function AuditDetailsPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const user     = useAuthStore(s => s.user);

  const [audit, setAudit]             = useState<any>(null);
  const [records, setRecords]         = useState<any[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [employees, setEmployees]     = useState<any[]>([]);
  const [selectedAuditor, setSelectedAuditor] = useState('');
  const [assets, setAssets]           = useState<any[]>([]);
  const [verifyForm, setVerifyForm]   = useState({ assetId: '', result: 'Verified', notes: '' });

  useEffect(() => {
    fetchAuditDetails();
    if (user?.role === 'admin' || user?.role === 'asset_manager') fetchEmployees();
    fetchAssets();
  }, [id, user]);

  const fetchAuditDetails = async () => {
    try {
      const { data } = await api.get(`/audit-cycles/${id}`);
      setAudit(data.data.auditCycle);
      setRecords(data.data.records || []);
    } catch { alert('Failed to load audit details'); }
    finally { setIsLoading(false); }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await api.get('/users');
      const list = Array.isArray(data.data) ? data.data : (data.data?.users || []);
      setEmployees(list);
    } catch {}
  };

  const fetchAssets = async () => {
    try {
      const { data } = await api.get('/assets');
      setAssets(data.data);
    } catch {}
  };

  const handleAssignAuditor = async () => {
    if (!selectedAuditor) return;
    try {
      const currentIds = audit.auditorIds.map((a: any) => a._id);
      if (currentIds.includes(selectedAuditor)) return alert('User is already assigned.');
      await api.post(`/audit-cycles/${id}/assign`, { auditorIds: [...currentIds, selectedAuditor] });
      setSelectedAuditor('');
      fetchAuditDetails();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to assign auditor'); }
  };

  const handleVerifyAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/audit-cycles/${id}/verify`, verifyForm);
      setVerifyForm({ assetId: '', result: 'Verified', notes: '' });
      fetchAuditDetails();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to verify asset'); }
  };

  const handleCloseAudit = async () => {
    if (!confirm('Close this audit cycle? This action cannot be undone.')) return;
    try {
      await api.post(`/audit-cycles/${id}/close`);
      fetchAuditDetails();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to close audit cycle'); }
  };

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div className="spinner" />
    </div>
  );
  if (!audit) return (
    <div className="empty-state" style={{ marginTop: '4rem' }}>
      <div className="empty-state-icon"><FileCheck size={22} /></div>
      <p className="empty-state-title">Audit not found</p>
    </div>
  );

  const isAdminOrManager = user?.role === 'admin' || user?.role === 'asset_manager';
  const isAssignedAuditor = audit.auditorIds.some((a: any) => a._id === user?._id);
  const canVerify = (isAdminOrManager || isAssignedAuditor) && audit.status !== 'Closed';

  const resultIcon = (result: string) => {
    if (result === 'Verified') return <CheckCircle size={16} color="#10B981" />;
    if (result === 'Damaged')  return <AlertTriangle size={16} color="#F59E0B" />;
    return <XCircle size={16} color="#EF4444" />;
  };

  const resultBadge = (result: string) => {
    if (result === 'Verified') return 'badge badge-resolved';
    if (result === 'Damaged')  return 'badge badge-pending';
    return 'badge badge-rejected';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Back */}
      <button
        onClick={() => router.push('/dashboard/audits')}
        style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '.4rem', cursor: 'pointer', fontSize: '.875rem', width: 'fit-content', fontFamily: 'var(--font-sans)' }}
      >
        <ArrowLeft size={15} /> Back to Audits
      </button>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.875rem', flexWrap: 'wrap', marginBottom: '.5rem' }}>
            <h1 className="page-title" style={{ margin: 0 }}>{audit.title}</h1>
            <span className={audit.status === 'Closed' ? 'badge badge-completed' : 'badge badge-ongoing'}>{audit.status}</span>
          </div>
          <p className="page-subtitle">
            Scope: <strong style={{ color: 'hsl(var(--text-secondary))', textTransform: 'capitalize' }}>{audit.scopeType}</strong>
            &nbsp;·&nbsp; {new Date(audit.dateRangeStart).toLocaleDateString()} — {new Date(audit.dateRangeEnd).toLocaleDateString()}
          </p>
        </div>
        {isAdminOrManager && audit.status !== 'Closed' && (
          <button className="btn btn-danger" onClick={handleCloseAudit}>
            Close Audit Cycle
          </button>
        )}
      </div>

      {/* Discrepancy report (if closed) */}
      {audit.status === 'Closed' && audit.discrepancyReport && (
        <div className="alert alert-warning">
          <AlertTriangle size={18} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, marginBottom: '.5rem' }}>Discrepancy Report</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: '.625rem' }}>
              {[
                { label: 'Total Assets', value: audit.discrepancyReport.totalAssets, color: 'hsl(var(--text))' },
                { label: 'Verified',     value: audit.discrepancyReport.verified,    color: '#10B981' },
                { label: 'Missing',      value: audit.discrepancyReport.missing,     color: '#EF4444' },
                { label: 'Damaged',      value: audit.discrepancyReport.damaged,     color: '#F59E0B' },
              ].map(item => (
                <div key={item.label} style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: 8, padding: '.75rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.4rem', fontWeight: 800, color: item.color }}>{item.value}</p>
                  <p style={{ fontSize: '.73rem', color: 'hsl(var(--text-muted))', marginTop: 2 }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>

        {/* Left: Verify + records */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {canVerify && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '.9375rem', display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.25rem' }}>
                <ShieldCheck size={17} color="hsl(var(--primary))" /> Verify Asset
              </h3>
              <form onSubmit={handleVerifyAsset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Select Asset</label>
                  <select className="input-field" required value={verifyForm.assetId} onChange={e => setVerifyForm({ ...verifyForm, assetId: e.target.value })}>
                    <option value="">— Choose Asset —</option>
                    {assets.map(a => <option key={a._id} value={a._id}>{a.name} ({a.assetTag})</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.875rem' }}>
                  <div>
                    <label className="form-label">Result</label>
                    <select className="input-field" value={verifyForm.result} onChange={e => setVerifyForm({ ...verifyForm, result: e.target.value })}>
                      <option value="Verified">Verified (Present & Good)</option>
                      <option value="Damaged">Damaged (Needs repair)</option>
                      <option value="Missing">Missing (Not found)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Notes</label>
                    <input type="text" className="input-field" placeholder="Optional notes…" value={verifyForm.notes} onChange={e => setVerifyForm({ ...verifyForm, notes: e.target.value })} />
                  </div>
                </div>
                <div>
                  <button type="submit" className="btn btn-primary">Record Verification</button>
                </div>
              </form>
            </div>
          )}

          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontWeight: 700, fontSize: '.9375rem', marginBottom: '1.25rem' }}>
              Verification Records <span style={{ color: 'hsl(var(--text-muted))', fontWeight: 500, fontSize: '.85rem' }}>({records.length})</span>
            </h3>
            {records.length === 0
              ? (
                <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                  <div className="empty-state-icon"><ShieldCheck size={20} /></div>
                  <p className="empty-state-title">No records yet</p>
                  <p className="empty-state-desc">Verified assets will appear here.</p>
                </div>
              )
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {records.map((record, idx) => (
                    <div key={record._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '.875rem 0', borderBottom: idx < records.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '.875rem' }}>{record.assetId?.name}</p>
                        <p style={{ fontSize: '.73rem', fontFamily: 'monospace', color: 'hsl(var(--text-muted))', marginTop: 2 }}>{record.assetId?.assetTag}</p>
                        <p style={{ fontSize: '.75rem', color: 'hsl(var(--text-muted))', marginTop: 4 }}>
                          By {record.auditorId?.firstName || record.auditorId?.name} · {new Date(record.verifiedAt).toLocaleString()}
                        </p>
                        {record.notes && <p style={{ fontSize: '.78rem', fontStyle: 'italic', color: 'hsl(var(--text-secondary))', marginTop: 3 }}>"{record.notes}"</p>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', flexShrink: 0 }}>
                        {resultIcon(record.result)}
                        <span className={resultBadge(record.result)}>{record.result}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        </div>

        {/* Right: Auditors */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '.9375rem', display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.25rem' }}>
            <UserPlus size={17} color="hsl(var(--primary))" /> Assigned Auditors
          </h3>

          {isAdminOrManager && audit.status !== 'Closed' && (
            <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.25rem' }}>
              <select className="input-field" value={selectedAuditor} onChange={e => setSelectedAuditor(e.target.value)} style={{ flex: 1 }}>
                <option value="">— Add Auditor —</option>
                {employees.map(emp => (
                  <option key={emp._id} value={emp._id}>{emp.name || `${emp.firstName} ${emp.lastName}`}</option>
                ))}
              </select>
              <button className="btn btn-primary" onClick={handleAssignAuditor} style={{ flexShrink: 0 }}>Add</button>
            </div>
          )}

          {audit.auditorIds.length === 0
            ? <p style={{ fontSize: '.8rem', color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '1rem 0' }}>No auditors assigned yet.</p>
            : (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                {audit.auditorIds.map((auditor: any) => (
                  <li key={auditor._id} style={{ display: 'flex', alignItems: 'center', gap: '.625rem', padding: '.625rem .75rem', background: 'hsl(var(--surface-raised))', borderRadius: 8, border: '1px solid hsl(var(--border))' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgb(79,70,229/.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary))', fontWeight: 700, fontSize: '.72rem', flexShrink: 0 }}>
                      {((auditor.firstName || auditor.name || '?')[0]).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '.8375rem', fontWeight: 500 }}>{auditor.firstName ? `${auditor.firstName} ${auditor.lastName}` : auditor.name}</span>
                  </li>
                ))}
              </ul>
            )
          }
        </div>
      </div>
    </div>
  );
}
