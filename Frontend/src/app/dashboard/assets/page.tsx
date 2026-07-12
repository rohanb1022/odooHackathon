'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, QrCode, Package, X } from 'lucide-react';
import api from '@/lib/axios';
import PromptModal from '@/components/ui/PromptModal';

interface Asset {
  _id: string; name: string; assetTag: string; serialNumber: string;
  categoryId: { _id: string; name: string }; status: string;
  condition: string; location: string; isShared: boolean;
}

const STATUS_OPTS = ['Available','Allocated','Reserved','Under Maintenance','Lost','Retired','Disposed'];

function getBadgeClass(status: string) {
  const map: Record<string, string> = {
    'Available': 'badge-available', 'Allocated': 'badge-allocated',
    'Reserved': 'badge-reserved', 'Under Maintenance': 'badge-maintenance',
    'Lost': 'badge-lost', 'Retired': 'badge-retired', 'Disposed': 'badge-disposed',
  };
  return `badge ${map[status] || 'badge-standard'}`;
}

function getConditionStyle(c: string) {
  if (c === 'New' || c === 'Good')  return { color: '#10B981', fontWeight: 600, fontSize: '.78rem' };
  if (c === 'Fair')                  return { color: '#F59E0B', fontWeight: 600, fontSize: '.78rem' };
  return                                    { color: '#EF4444', fontWeight: 600, fontSize: '.78rem' };
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(7)].map((_, i) => (
        <td key={i} style={{ padding: '.875rem 1rem' }}>
          <div className="skeleton" style={{ height: 14, width: i === 1 ? '80%' : '60%', borderRadius: 4 }} />
        </td>
      ))}
    </tr>
  );
}

export default function AssetsPage() {
  const [assets, setAssets]           = useState<Asset[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [scanModalOpen, setScanModalOpen] = useState(false);

  useEffect(() => { fetchAssets(); }, []);

  const fetchAssets = async () => {
    try {
      const { data } = await api.get('/assets');
      if (data.success) setAssets(data.data);
    } catch {}
    finally { setIsLoading(false); }
  };

  const handleScanQR = () => {
    setScanModalOpen(true);
  };

  const handleScanSubmit = (scanned: string) => {
    if (scanned) setSearch(scanned);
    setScanModalOpen(false);
  };

  const filtered = assets.filter(a => {
    const q = search.toLowerCase();
    const matchSearch =
      a.name?.toLowerCase().includes(q) ||
      a.assetTag?.toLowerCase().includes(q) ||
      a.serialNumber?.toLowerCase().includes(q);
    return matchSearch && (statusFilter ? a.status === statusFilter : true);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Asset Directory</h1>
          <p className="page-subtitle">Track and manage all {isLoading ? '…' : assets.length} organizational assets.</p>
        </div>
        <Link href="/dashboard/assets/register" className="btn btn-primary">
          <Plus size={15} /> Register Asset
        </Link>
      </div>

      {/* Search + Filter bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
          <input
            type="text"
            placeholder="Search by name, tag, or serial…"
            className="input-field"
            style={{ paddingLeft: '2.25rem', paddingRight: search ? '2.25rem' : undefined }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer', display: 'flex' }}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <Filter size={14} style={{ color: 'hsl(var(--text-muted))', flexShrink: 0 }} />
          <select className="input-field" style={{ width: 'auto', minWidth: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {statusFilter && (
          <button className="btn btn-ghost btn-sm" onClick={() => setStatusFilter('')} style={{ color: 'hsl(var(--text-muted))' }}>
            <X size={13} /> Clear filter
          </button>
        )}

        <button className="btn btn-outline" onClick={handleScanQR} style={{ marginLeft: 'auto', gap: '.4rem' }}>
          <QrCode size={15} /> Scan QR
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Table stats bar */}
        {!isLoading && (
          <div style={{ padding: '.75rem 1.25rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ fontSize: '.78rem', color: 'hsl(var(--text-muted))' }}>
              Showing <span style={{ fontWeight: 600, color: 'hsl(var(--text))' }}>{filtered.length}</span>
              {filtered.length !== assets.length && <> of <span style={{ fontWeight: 600, color: 'hsl(var(--text))' }}>{assets.length}</span></>} assets
            </span>
          </div>
        )}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Name</th>
                <th>Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Condition</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
                : filtered.length === 0
                ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <div className="empty-state-icon"><Package size={22} /></div>
                        <p className="empty-state-title">No assets found</p>
                        <p className="empty-state-desc">Try adjusting your search or filters.</p>
                      </div>
                    </td>
                  </tr>
                )
                : filtered.map(asset => (
                  <tr key={asset._id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '.82rem', color: 'hsl(var(--primary))', background: 'rgb(79,70,229/.08)', padding: '.15rem .5rem', borderRadius: 5 }}>
                        {asset.assetTag}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'hsl(var(--text))' }}>{asset.name}</td>
                    <td style={{ color: 'hsl(var(--text-secondary))' }}>{asset.categoryId?.name || '—'}</td>
                    <td style={{ color: 'hsl(var(--text-secondary))', fontSize: '.8125rem' }}>{asset.location}</td>
                    <td><span className={getBadgeClass(asset.status)}>{asset.status}</span></td>
                    <td><span style={getConditionStyle(asset.condition)}>{asset.condition}</span></td>
                    <td>
                      {asset.isShared
                        ? <span className="badge badge-shared">Shared</span>
                        : <span className="badge badge-standard">Standard</span>
                      }
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <PromptModal 
        isOpen={scanModalOpen}
        title="Simulate QR Scanner"
        message="Enter the QR Code (Asset Tag or Serial Number) you want to scan:"
        placeholder="e.g. AF-0001"
        onConfirm={handleScanSubmit}
        onCancel={() => setScanModalOpen(false)}
      />
    </div>
  );
}
