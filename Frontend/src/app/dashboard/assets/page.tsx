"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, QrCode, ChevronDown, ChevronUp, Sparkles, Activity, AlertTriangle, Package, X } from 'lucide-react';
import api from '@/lib/axios';

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

// Custom simple markdown renderer for clean, professional styling
const MarkdownRenderer = ({ text }: { text: string }) => {
  if (!text) return null;

  const lines = text.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = (key: string | number) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${key}`} style={{ margin: '0 0 0.75rem 0', paddingLeft: '1.25rem', listStyleType: 'disc' }}>
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed === '') {
      flushList(index);
      renderedElements.push(<div key={`empty-${index}`} style={{ height: '0.4rem' }} />);
      return;
    }

    // Check for headers (e.g. ### Header)
    const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      flushList(index);
      const level = headerMatch[1].length;
      const content = headerMatch[2];
      const parsedContent = parseInlineMarkdown(content);

      const headerStyle = {
        marginTop: '0.75rem',
        marginBottom: '0.4rem',
        fontWeight: 700,
        lineHeight: '1.25'
      };

      if (level === 1) {
        renderedElements.push(<h1 key={`h-${index}`} style={{ ...headerStyle, fontSize: '1.3rem' }}>{parsedContent}</h1>);
      } else if (level === 2) {
        renderedElements.push(<h2 key={`h-${index}`} style={{ ...headerStyle, fontSize: '1.15rem' }}>{parsedContent}</h2>);
      } else {
        renderedElements.push(<h3 key={`h-${index}`} style={{ ...headerStyle, fontSize: '1.05rem' }}>{parsedContent}</h3>);
      }
      return;
    }

    // Check for bullet list items
    const bulletMatch = line.match(/^[\*\-\+]\s+(.*)$/);
    if (bulletMatch) {
      inList = true;
      const content = bulletMatch[1];
      listItems.push(
        <li key={`li-${index}`} style={{ marginBottom: '0.2rem', lineHeight: '1.4' }}>
          {parseInlineMarkdown(content)}
        </li>
      );
      return;
    }

    // Normal text
    flushList(index);
    renderedElements.push(
      <p key={`p-${index}`} style={{ margin: '0 0 0.5rem 0', lineHeight: '1.4' }}>
        {parseInlineMarkdown(line)}
      </p>
    );
  });

  flushList('end');
  return <>{renderedElements}</>;
};

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|[^\*`]+)/g;
  let keyIndex = 0;

  const matches = text.matchAll(regex);
  for (const match of matches) {
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(<strong key={keyIndex++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={keyIndex++}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={keyIndex++}
          style={{
            backgroundColor: 'hsla(var(--primary), 0.15)',
            color: 'hsl(var(--primary))',
            padding: '0.1rem 0.25rem',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.85em'
          }}
        >
          {token.slice(1, -1)}
        </code>
      );
    } else {
      parts.push(<React.Fragment key={keyIndex++}>{token}</React.Fragment>);
    }
  }

  return parts;
}

export default function AssetsPage() {
  const [assets, setAssets]           = useState<Asset[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Row Expansion State
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiData, setAiData] = useState<Record<string, { health: any, prediction: any }>>({});
  const [loadingExpanded, setLoadingExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const { data } = await api.get('/assets');
      if (data.success) setAssets(data.data);
    } catch {}
    finally { setIsLoading(false); }
  };

  const toggleRow = async (assetId: string) => {
    if (expandedId === assetId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(assetId);

    if (aiData[assetId]) return; // Already loaded

    setLoadingExpanded((prev) => ({ ...prev, [assetId]: true }));
    try {
      const [healthRes, predRes] = await Promise.all([
        api.get(`/ai/asset-health/${assetId}`),
        api.get(`/ai/predict-maintenance/${assetId}`)
      ]);
      setAiData((prev) => ({
        ...prev,
        [assetId]: {
          health: healthRes.data.success ? healthRes.data.data : null,
          prediction: predRes.data.success ? predRes.data.data : null
        }
      }));
    } catch (err) {
      console.error("Failed to load AI details for asset", err);
    } finally {
      setLoadingExpanded((prev) => ({ ...prev, [assetId]: false }));
    }
  };

  const handleScanQR = () => {
    const scanned = prompt('📷 Simulate Scanner: Enter QR Code (Asset Tag or Serial)');
    if (scanned) setSearch(scanned);
  };

  const filteredAssets = assets.filter(asset => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      (asset.name?.toLowerCase().includes(searchLower)) ||
      (asset.assetTag?.toLowerCase().includes(searchLower)) ||
      (asset.serialNumber?.toLowerCase().includes(searchLower));
    const matchesStatus = statusFilter ? asset.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'var(--success)';
      case 'Allocated': return 'var(--info)';
      case 'Reserved': return 'var(--warning)';
      case 'Under Maintenance': return 'var(--warning)';
      case 'Lost': case 'Disposed': case 'Retired': return 'var(--error)';
      default: return 'var(--text-muted)';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return '#10b981'; // Green
    if (score >= 50) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Asset Directory</h1>
          <p className="page-subtitle">Track and manage all {isLoading ? '…' : assets.length} organizational assets.</p>
        </div>

        <Link href="/dashboard/assets/register" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Plus size={16} /> Register Asset
        </Link>
      </div>

      {/* Search + Filter bar */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
          <input
            type="text"
            placeholder="Search by name, tag, or serial..."
            className="input-field"
            style={{ paddingLeft: '2.5rem', paddingRight: search ? '2.5rem' : undefined }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer', display: 'flex' }}>
              <X size={14} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} style={{ color: 'hsl(var(--text-muted))' }} />
          <select
            className="input-field"
            style={{ width: 'auto', minWidth: '160px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {statusFilter && (
          <button className="btn btn-ghost btn-sm" onClick={() => setStatusFilter('')} style={{ color: 'hsl(var(--text-muted))' }}>
            <X size={13} /> Clear filter
          </button>
        )}

        <button className="btn btn-outline" onClick={handleScanQR} style={{ gap: '0.5rem', marginLeft: 'auto' }}>
          <QrCode size={18} /> Scan QR
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Table stats bar */}
        {!isLoading && (
          <div style={{ padding: '.75rem 1.25rem', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ fontSize: '.78rem', color: 'hsl(var(--text-muted))' }}>
              Showing <span style={{ fontWeight: 600, color: 'hsl(var(--text))' }}>{filteredAssets.length}</span>
              {filteredAssets.length !== assets.length && <> of <span style={{ fontWeight: 600, color: 'hsl(var(--text))' }}>{assets.length}</span></>} assets
            </span>
          </div>
        )}

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--text-muted))' }}>Loading assets...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(var(--border))', color: 'hsl(var(--text-muted))', backgroundColor: 'hsla(var(--surface), 0.5)' }}>
                  <th style={{ padding: '1rem', width: '48px' }}></th>
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
                    <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                      <div className="empty-state">
                        <div className="empty-state-icon"><Package size={22} /></div>
                        <p className="empty-state-title">No assets found</p>
                        <p className="empty-state-desc">Try adjusting your search or filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map(asset => {
                    const isExpanded = expandedId === asset._id;
                    const data = aiData[asset._id];
                    const isLoadingDetails = loadingExpanded[asset._id];

                    return (
                      <React.Fragment key={asset._id}>
                        <tr
                          onClick={() => toggleRow(asset._id)}
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
                          <td style={{ padding: '1rem' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '.82rem', color: 'hsl(var(--primary))', background: 'rgb(79,70,229/.08)', padding: '.15rem .5rem', borderRadius: 5 }}>
                              {asset.assetTag}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 600, color: 'hsl(var(--text))' }}>{asset.name}</td>
                          <td style={{ padding: '1rem', color: 'hsl(var(--text-secondary))' }}>{asset.categoryId?.name || '—'}</td>
                          <td style={{ padding: '1rem', color: 'hsl(var(--text-secondary))', fontSize: '.8125rem' }}>{asset.location}</td>
                          <td style={{ padding: '1rem' }}>
                            <span className={getBadgeClass(asset.status)}>
                              {asset.status}
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={getConditionStyle(asset.condition)}>{asset.condition}</span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {asset.isShared ? (
                              <span className="badge badge-shared">Shared</span>
                            ) : (
                              <span className="badge badge-standard">Standard</span>
                            )}
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr style={{ backgroundColor: 'hsla(var(--secondary), 0.3)' }}>
                            <td colSpan={8} style={{ padding: '1.5rem', borderBottom: '1px solid hsl(var(--border))' }}>
                              {isLoadingDetails ? (
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', height: '100px', color: 'hsl(var(--text-muted))' }}>
                                  <div style={{ width: '16px', height: '16px', border: '2px solid hsl(var(--border))', borderTopColor: 'hsl(var(--primary))', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                  <span>AI Copilot generating asset reliability report...</span>
                                </div>
                              ) : data ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
                                  {/* Left: General Info */}
                                  <div>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--text))', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Asset Metadata Details</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                                      <span style={{ color: 'hsl(var(--text-muted))', fontWeight: 500 }}>Serial Number:</span>
                                      <span style={{ fontWeight: 600 }}>{asset.serialNumber || 'N/A'}</span>
                                      <span style={{ color: 'hsl(var(--text-muted))', fontWeight: 500 }}>Exact Location:</span>
                                      <span>{asset.location}</span>
                                      <span style={{ color: 'hsl(var(--text-muted))', fontWeight: 500 }}>Configuration Category:</span>
                                      <span>{asset.categoryId?.name}</span>
                                    </div>

                                    {data.health?.maintenancePlan && (
                                      <div style={{ marginTop: '1.5rem' }}>
                                        <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--text-muted))', marginBottom: '0.5rem' }}>Preventative Maintenance Plan</h5>
                                        <div style={{ fontSize: '0.85rem', lineHeight: '1.5', color: 'hsl(var(--text))' }}>
                                          <MarkdownRenderer text={data.health.maintenancePlan} />
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Right: AI Center */}
                                  <div style={{ borderLeft: '1px solid hsl(var(--border))', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'purple' }}>
                                      <Sparkles size={16} />
                                      <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>AI Reliability Center</span>
                                    </div>

                                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                      {/* Circular Gauge */}
                                      {data.health?.healthScore !== undefined && (
                                        <div style={{ flexShrink: 0 }}>
                                          <svg width="80" height="80" viewBox="0 0 36 36">
                                            <path
                                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                              fill="none"
                                              stroke="hsl(var(--border))"
                                              strokeWidth="3.5"
                                            />
                                            <path
                                              strokeDasharray={`${data.health.healthScore}, 100`}
                                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                              fill="none"
                                              stroke={getHealthColor(data.health.healthScore)}
                                              strokeWidth="3.5"
                                              strokeLinecap="round"
                                            />
                                            <text x="18" y="20.35" fontSize="9" fontWeight="bold" textAnchor="middle" fill="hsl(var(--text))">
                                              {data.health.healthScore}%
                                            </text>
                                          </svg>
                                        </div>
                                      )}

                                      <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Asset Health Index</div>
                                        <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>
                                          {data.health?.conditionSummary}
                                        </div>
                                        {data.health?.lifeExpectancy && (
                                          <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                                            Useful Life Remaining: <strong style={{ color: 'purple' }}>{data.health.lifeExpectancy}</strong>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Predictions Panel */}
                                    {data.prediction && (
                                      <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'hsla(270, 50%, 40%, 0.05)', border: '1px solid hsla(270, 50%, 40%, 0.15)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.85rem', color: 'purple' }}>
                                          <Activity size={14} /> Predictive Failures Info
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                                          <div>
                                            <div style={{ color: 'hsl(var(--text-muted))' }}>Failure Risk (30d)</div>
                                            <div style={{ fontWeight: 700, color: data.prediction.failureProbability > 0.4 ? 'red' : 'green', fontSize: '1rem' }}>
                                              {(data.prediction.failureProbability * 100).toFixed(0)}%
                                            </div>
                                          </div>
                                          <div>
                                            <div style={{ color: 'hsl(var(--text-muted))' }}>Predicted Next Service</div>
                                            <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                                              {data.prediction.nextMaintenanceDate}
                                            </div>
                                          </div>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.5rem', borderTop: '1px solid hsla(270, 50%, 40%, 0.1)', paddingTop: '0.4rem' }}>
                                          <strong>AI Assessment:</strong> {data.prediction.reasoning}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', color: 'hsl(var(--text-muted))' }}>
                                  <AlertTriangle size={16} style={{ marginRight: '6px' }} />
                                  <span>No AI diagnostic information could be compiled. Please check if your GEMINI_API_KEY is configured.</span>
                                </div>
                              )}
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
    </div>
  );
}
