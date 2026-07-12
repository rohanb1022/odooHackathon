'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, AlertTriangle, History } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';
import { toast } from 'react-toastify';

export default function NewAllocationPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  
  const [assetHistory, setAssetHistory] = useState<any[]>([]);
  const [currentAllocation, setCurrentAllocation] = useState<any | null>(null);
  
  // Transfer Form State
  const [transferReason, setTransferReason] = useState('');
  const [transferTo, setTransferTo] = useState('');

  // Allocate Form State
  const [allocateTo, setAllocateTo] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedAssetId) {
      fetchAssetHistory(selectedAssetId);
    } else {
      setAssetHistory([]);
      setCurrentAllocation(null);
    }
  }, [selectedAssetId]);

  const fetchInitialData = async () => {
    try {
      const [assetsRes, empRes] = await Promise.all([
        api.get('/assets'), // Fetch all assets so we can select allocated ones too
        api.get('/users')
      ]);
      setAssets(assetsRes.data.data || []);
      setEmployees(empRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load initial data');
    }
  };

  const fetchAssetHistory = async (assetId: string) => {
    try {
      // Get all allocations for this asset to show history
      const { data } = await api.get(`/allocations?assetId=${assetId}`);
      const history = data.data.allocations || [];
      setAssetHistory(history);

      // Check if it's currently allocated (Active status)
      const active = history.find((h: any) => h.status === 'Active');
      setCurrentAllocation(active || null);
    } catch (error) {
      toast.error('Failed to fetch asset history');
    }
  };

  const selectedAsset = assets.find(a => a._id === selectedAssetId);

  const handleSubmitTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferReason || !transferTo) return toast.error('Please fill all fields');
    
    setIsSubmitting(true);
    try {
      // Create transfer request
      await api.post(`/allocations/${selectedAssetId}/transfer`, { reason: transferReason, targetUser: transferTo });
      toast.success('Transfer requested successfully!');
      router.push('/dashboard/allocations');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit transfer request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocateTo) return toast.error('Please select an employee');

    setIsSubmitting(true);
    try {
      await api.post('/allocations', {
        assetId: selectedAssetId,
        allocatedToUser: allocateTo,
        expectedReturnDate: returnDate,
        notes: notes
      });
      toast.success('Asset allocated successfully!');
      router.push('/dashboard/allocations');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to allocate asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/dashboard/allocations" className="btn btn-outline" style={{ padding: '0.5rem' }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="page-title">Asset Allocation & Transfer</h1>
          <p className="page-subtitle">Assign an asset or request a transfer</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: 'hsl(var(--text-secondary))' }}>
            Asset
          </label>
          <select 
            className="input-field" 
            value={selectedAssetId}
            onChange={(e) => setSelectedAssetId(e.target.value)}
            style={{ fontSize: '1rem', padding: '0.75rem' }}
          >
            <option value="">Select an asset...</option>
            {assets.map(asset => (
              <option key={asset._id} value={asset._id}>
                {asset.assetTag} - {asset.name}
              </option>
            ))}
          </select>
        </div>

        {selectedAssetId && currentAllocation && (
          <div style={{ 
            background: 'hsl(var(--error) / 0.1)', 
            border: '1px solid hsl(var(--error) / 0.3)',
            borderRadius: '8px',
            padding: '1.25rem',
            marginBottom: '2rem'
          }}>
            <p style={{ color: 'hsl(var(--error))', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <AlertTriangle size={18} />
              Already Allocated to {currentAllocation.allocatedToUser?.name} {currentAllocation.departmentId ? `(${currentAllocation.departmentId.name})` : ''}
            </p>
            <p style={{ color: 'hsl(var(--error) / 0.8)', fontSize: '0.9rem', marginLeft: '1.6rem' }}>
              Direct re-allocation is blocked - submit a transfer request below
            </p>
          </div>
        )}

        {selectedAssetId && currentAllocation && (
          <form onSubmit={handleSubmitTransfer}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>Transfer Request</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>From</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={currentAllocation.allocatedToUser?.name || 'Unknown User'} 
                  disabled 
                  style={{ opacity: 0.7 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>To</label>
                <select 
                  className="input-field"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  required
                >
                  <option value="">Select Employee...</option>
                  {employees.filter(e => e._id !== currentAllocation.allocatedToUser?._id).map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>Reason</label>
              <textarea 
                className="input-field"
                rows={4}
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder="Why is this transfer needed?"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ background: '#10b981', borderColor: '#10b981' }} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        )}

        {selectedAssetId && !currentAllocation && (
          <form onSubmit={handleSubmitAllocation}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>New Allocation</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>Allocate To</label>
                <select 
                  className="input-field"
                  value={allocateTo}
                  onChange={(e) => setAllocateTo(e.target.value)}
                  required
                >
                  <option value="">Select Employee...</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>Expected Return Date (Optional)</label>
                <input 
                  type="date" 
                  className="input-field"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>Notes (Optional)</label>
              <textarea 
                className="input-field"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Allocating...' : 'Allocate Asset'}
            </button>
          </form>
        )}

        {selectedAssetId && (
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid hsl(var(--border))' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={16} /> Allocation history
            </h4>
            
            {assetHistory.length === 0 ? (
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem' }}>No history found for this asset.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {assetHistory.map((hist, i) => {
                  const items = [];
                  
                  // Allocation event
                  const allocDate = new Date(hist.allocatedDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                  let allocText = `Allocated to ${hist.allocatedToUser?.name || 'Unknown'}`;
                  if (hist.departmentId) allocText += ` - ${hist.departmentId.name}`;
                  
                  items.push(
                    <li key={`alloc-${hist._id || i}`} style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>
                      <span style={{ display: 'inline-block', width: '60px', color: 'hsl(var(--text-muted))' }}>{allocDate}</span> 
                      - {allocText}
                    </li>
                  );

                  // Return event (if returned)
                  if (hist.status === 'Returned' && hist.updatedAt) {
                    const retDate = new Date(hist.updatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                    items.push(
                      <li key={`ret-${hist._id || i}`} style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))' }}>
                        <span style={{ display: 'inline-block', width: '60px', color: 'hsl(var(--text-muted))' }}>{retDate}</span> 
                        - Returned by {hist.allocatedToUser?.name || 'Unknown'} - condition: {hist.conditionAtReturn || 'N/A'}
                      </li>
                    );
                  }

                  return items;
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
