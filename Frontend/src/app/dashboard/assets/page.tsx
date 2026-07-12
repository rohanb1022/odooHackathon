'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, QrCode } from 'lucide-react';
import api from '@/lib/axios';

interface Asset {
  _id: string;
  name: string;
  assetTag: string;
  serialNumber: string;
  category: { _id: string; name: string };
  status: string;
  condition: string;
  location: string;
  isShared: boolean;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const { data } = await api.get('/assets');
      if (data.success) {
        setAssets(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch assets', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase()) || 
                          asset.assetTag.toLowerCase().includes(search.toLowerCase()) ||
                          asset.serialNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? asset.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Available': return 'var(--success)';
      case 'Allocated': return 'var(--info)';
      case 'Reserved': return 'var(--warning)';
      case 'Under Maintenance': return 'var(--warning)';
      case 'Lost': case 'Disposed': case 'Retired': return 'var(--error)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Asset Directory</h1>
          <p style={{ color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>Track and manage all organizational assets.</p>
        </div>
        
        <Link href="/dashboard/assets/register" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={16} /> Register Asset
        </Link>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
            <input 
              type="text" 
              placeholder="Search by name, tag, or serial..." 
              className="input-field" 
              style={{ paddingLeft: '2.5rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} style={{ color: 'hsl(var(--text-muted))' }} />
            <select 
              className="input-field" 
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Allocated">Allocated</option>
              <option value="Reserved">Reserved</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
          <button className="btn btn-outline" style={{ gap: '0.5rem' }}>
            <QrCode size={18} /> Scan QR
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--text-muted))' }}>Loading assets...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(var(--border))', color: 'hsl(var(--text-muted))', backgroundColor: 'hsla(var(--surface), 0.5)' }}>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Asset Tag</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Name</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Category</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Location</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Condition</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                      No assets found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map(asset => (
                    <tr key={asset._id} style={{ borderBottom: '1px solid hsl(var(--border))', transition: 'background-color var(--transition-fast)' }} className="hover:bg-hsla-surface">
                      <td style={{ padding: '1rem', fontWeight: 600, color: 'hsl(var(--primary))' }}>{asset.assetTag}</td>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{asset.name}</td>
                      <td style={{ padding: '1rem' }}>{asset.category?.name || '-'}</td>
                      <td style={{ padding: '1rem' }}>{asset.location}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.6rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.75rem', 
                          fontWeight: 500,
                          backgroundColor: `hsla(${getStatusColor(asset.status)}, 0.1)`,
                          color: `hsl(${getStatusColor(asset.status)})`
                        }}>
                          {asset.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{asset.condition}</td>
                      <td style={{ padding: '1rem' }}>
                        {asset.isShared ? (
                          <span style={{ fontSize: '0.75rem', backgroundColor: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Shared</span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--text-muted))', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Standard</span>
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
    </div>
  );
}
