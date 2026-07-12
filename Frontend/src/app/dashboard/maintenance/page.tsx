'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Clock,
  UserCheck,
  PlayCircle,
  LayoutGrid,
  List,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Tag,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import PromptModal from '@/components/ui/PromptModal';
import { toast } from 'react-toastify';

interface MaintenanceItem {
  _id: string;
  assetId?: {
    _id: string;
    name: string;
    assetTag: string;
    location?: string;
    status?: string;
    condition?: string;
  };
  raisedBy?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
  };
  technicianId?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
  };
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'Approved' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected';
  photo?: string;
  resolvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  aiDiagnostic?: {
    recommendedPriority?: string;
    probableCauses?: string[];
    suggestedActions?: string[];
    suggestedSpareParts?: string[];
    analyzedAt?: string;
  };
}

export default function MaintenancePage() {
  const user = useAuthStore((state) => state.user);
  const [requests, setRequests] = useState<MaintenanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Row Expansion State for Table View AI Diagnostics
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [requestForm, setRequestForm] = useState({
    assetId: '',
    issueDescription: '',
    priority: 'Medium',
  });

  // Assign Technician Modal State
  const [assignModal, setAssignModal] = useState<{ open: boolean; reqId: string; currentTech?: string }>({
    open: false,
    reqId: '',
  });
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTech, setSelectedTech] = useState('');

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [requestToReject, setRequestToReject] = useState<string | null>(null);

  // Drag and Drop state
  const [draggedItem, setDraggedItem] = useState<MaintenanceItem | null>(null);

  useEffect(() => {
    fetchRequests();
    fetchTechnicians();
  }, [user]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const isAdminOrManager = user?.role && ['Admin', 'admin', 'Asset Manager', 'asset_manager'].includes(user.role as string);
      const url = isAdminOrManager
        ? '/maintenance'
        : `/maintenance?raisedBy=${user?._id}`;
      const { data } = await api.get(url);
      setRequests(data.data?.requests || data.data || []);
    } catch (error) {
      console.error('Failed to fetch maintenance', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const { data } = await api.get('/auth/users');
      const allUsers = data.data?.users || data.data || [];
      setTechnicians(allUsers);
    } catch (error) {
      console.error('Failed to fetch users for assignment', error);
    }
  };

  const loadAssets = async () => {
    try {
      const { data } = await api.get('/assets');
      setAssets(data.data?.assets || data.data || []);
      setShowModal(true);
    } catch (error) {
      toast.error('Failed to load assets');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', {
        assetId: requestForm.assetId,
        description: requestForm.issueDescription,
        priority: requestForm.priority,
      });
      toast.success('Maintenance request submitted successfully!');
      setShowModal(false);
      setRequestForm({ assetId: '', issueDescription: '', priority: 'Medium' });
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  const updateStatus = async (id: string, newStatus: string, extraData: any = {}) => {
    try {
      if (newStatus === 'Rejected' && !extraData.rejectionReason) {
        setRequestToReject(id);
        setRejectModalOpen(true);
        return;
      }

      setRequests((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: newStatus as any, ...extraData } : item))
      );

      await api.patch(`/maintenance/${id}/status`, { status: newStatus, ...extraData });
      toast.success(`Maintenance moved to ${newStatus}`);
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
      fetchRequests();
    }
  };

  const handleRejectSubmit = async (reason: string) => {
    if (!reason || !requestToReject) return;
    try {
      await api.patch(`/maintenance/${requestToReject}/reject`, { rejectionReason: reason });
      toast.success('Maintenance request rejected');
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject maintenance request');
    } finally {
      setRejectModalOpen(false);
      setRequestToReject(null);
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedTech) {
      toast.error('Please select a technician');
      return;
    }
    try {
      await api.patch(`/maintenance/${assignModal.reqId}/assign`, { technicianId: selectedTech });
      setAssignModal({ open: false, reqId: '' });
      setSelectedTech('');
      toast.success('Technician assigned successfully');
      fetchRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign technician');
    }
  };

  const toggleRow = (reqId: string) => {
    setExpandedId(expandedId === reqId ? null : reqId);
  };

  // Drag & Drop Handlers
  const handleDragStart = (item: MaintenanceItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetColumnStatus: string) => {
    if (!draggedItem || draggedItem.status === targetColumnStatus) return;

    let targetStatus = targetColumnStatus;
    if (targetColumnStatus === 'Technician assigned') targetStatus = 'Assigned';
    if (targetColumnStatus === 'in progress') targetStatus = 'In Progress';

    updateStatus(draggedItem._id, targetStatus);
    setDraggedItem(null);
  };

  const getTechName = (tech?: any) => {
    if (!tech) return 'Assigned Tech';
    if (tech.name) return tech.name;
    if (tech.firstName || tech.lastName) return `${tech.firstName || ''} ${tech.lastName || ''}`.trim();
    return tech.email?.split('@')[0] || 'Assigned Tech';
  };

  const getResolveDateStr = (dateStr?: string) => {
    if (!dateStr) return 'Resolved';
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `resolved ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const columns = [
    { id: 'Pending', label: 'Pending', status: 'Pending', color: '#f59e0b', bgHeader: '#fffbeb' },
    { id: 'Approved', label: 'Approved', status: 'Approved', color: '#3b82f6', bgHeader: '#eff6ff' },
    { id: 'Technician assigned', label: 'Technician assigned', status: 'Assigned', color: '#8b5cf6', bgHeader: '#f5f3ff' },
    { id: 'in progress', label: 'in progress', status: 'In Progress', color: '#06b6d4', bgHeader: '#ecfeff' },
    { id: 'Resolved', label: 'Resolved', status: 'Resolved', color: '#10b981', bgHeader: '#ecfdf5' },
  ];

  return (
    <div style={{ padding: '0 0 40px 0', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Top Header & View Switcher */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
          paddingBottom: '24px',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '14px',
              }}
            >
              AF
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>
              Maintenance Board
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
            Visual workflow for tracking equipment repairs, approvals, and AI diagnostic cycles.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* View Toggle */}
          <div style={{ backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: viewMode === 'kanban' ? '#ffffff' : 'transparent',
                color: viewMode === 'kanban' ? '#0f172a' : '#475569',
                boxShadow: viewMode === 'kanban' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <LayoutGrid size={15} />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? '#0f172a' : '#475569',
                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <List size={15} />
              <span>Table</span>
            </button>
          </div>

          <button
            onClick={loadAssets}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '14px',
              padding: '10px 18px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(15, 23, 42, 0.15)',
            }}
          >
            <Plus size={18} />
            <span>Raise Request</span>
          </button>
        </div>
      </div>

      {/* ─── KANBAN BOARD VIEW (Exact Sketch Layout) ─── */}
      {viewMode === 'kanban' ? (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(230px, 1fr))',
              gap: '16px',
              alignItems: 'start',
              marginBottom: '32px',
              overflowX: 'auto',
              paddingBottom: '16px',
            }}
          >
            {columns.map((col) => {
              const colItems = requests.filter((item) => item.status === col.status);

              return (
                <div
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(col.id)}
                  style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '18px',
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '520px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  {/* Column Header */}
                  <div
                    style={{
                      backgroundColor: col.bgHeader,
                      borderBottom: `3px solid ${col.color}`,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: '15px', color: '#1e293b' }}>
                      {col.label}
                    </span>
                    <span
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 800,
                      }}
                    >
                      {colItems.length}
                    </span>
                  </div>

                  {/* Cards Container */}
                  <div
                    style={{
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      flex: 1,
                      overflowY: 'auto',
                      maxHeight: '700px',
                    }}
                  >
                    {colItems.length === 0 ? (
                      <div
                        style={{
                          height: '120px',
                          border: '2px dashed #cbd5e1',
                          borderRadius: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#94a3b8',
                          fontStyle: 'italic',
                        }}
                      >
                        Drop card here
                      </div>
                    ) : (
                      colItems.map((item) => {
                        const isResolved = item.status === 'Resolved';
                        const assetTag = item.assetId?.assetTag || 'AF-XXXX';
                        const assetName = item.assetId?.name || 'Unknown Asset';
                        const techNameStr = getTechName(item.technicianId);
                        const resolveDateStr = getResolveDateStr(item.resolvedAt || item.updatedAt);

                        return (
                          <div
                            key={item._id}
                            draggable
                            onDragStart={() => handleDragStart(item)}
                            style={{
                              padding: '16px',
                              borderRadius: '14px',
                              border: isResolved ? '1px solid #bbf7d0' : '1px solid #cbd5e1',
                              backgroundColor: isResolved ? '#dcfce7' : '#ffffff',
                              color: isResolved ? '#065f46' : '#1e293b',
                              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
                              cursor: 'grab',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {/* Card Top: Asset Tag & Priority Pill */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                              <span
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  backgroundColor: isResolved ? '#bbf7d0' : '#f1f5f9',
                                  color: isResolved ? '#065f46' : '#0f172a',
                                  border: isResolved ? 'none' : '1px solid #e2e8f0',
                                }}
                              >
                                {assetTag}
                              </span>

                              {!isResolved && (
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '9999px',
                                    textTransform: 'uppercase',
                                    backgroundColor:
                                      item.priority === 'Critical' || item.priority === 'High'
                                        ? '#ffe4e6'
                                        : item.priority === 'Medium'
                                        ? '#dbeafe'
                                        : '#f1f5f9',
                                    color:
                                      item.priority === 'Critical' || item.priority === 'High'
                                        ? '#be123c'
                                        : item.priority === 'Medium'
                                        ? '#1d4ed8'
                                        : '#475569',
                                  }}
                                >
                                  {item.priority}
                                </span>
                              )}
                            </div>

                            {/* Issue Description / Asset Name */}
                            <p
                              style={{
                                fontSize: '14px',
                                fontWeight: 700,
                                lineHeight: 1.4,
                                margin: '0 0 10px 0',
                                color: isResolved ? '#047857' : '#0f172a',
                              }}
                            >
                              {item.description}
                            </p>

                            <div
                              style={{
                                fontSize: '12px',
                                marginBottom: '12px',
                                fontWeight: 500,
                                color: isResolved ? '#065f46' : '#64748b',
                              }}
                            >
                              Asset: <strong style={{ color: isResolved ? '#065f46' : '#1e293b' }}>{assetName}</strong>
                            </div>

                            {/* AI Diagnostic Badge if available */}
                            {item.aiDiagnostic && (
                              <div
                                style={{
                                  backgroundColor: '#f5f3ff',
                                  border: '1px solid #ddd6fe',
                                  color: '#6d28d9',
                                  padding: '6px 10px',
                                  borderRadius: '8px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  marginBottom: '10px',
                                }}
                              >
                                <Sparkles size={13} color="#7c3aed" />
                                <span>AI Analyzed Fault</span>
                              </div>
                            )}

                            {/* Dynamic Bottom Info / Sketch Notes */}
                            {item.status === 'Assigned' && (
                              <div
                                style={{
                                  backgroundColor: '#f3e8ff',
                                  border: '1px solid #e9d5ff',
                                  color: '#581c87',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  padding: '6px 10px',
                                  borderRadius: '8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  marginBottom: '12px',
                                }}
                              >
                                <UserCheck size={14} color="#7e22ce" />
                                <span>tech: {techNameStr}</span>
                              </div>
                            )}

                            {isResolved && (
                              <div
                                style={{
                                  fontWeight: 800,
                                  fontSize: '12px',
                                  color: '#065f46',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  paddingTop: '6px',
                                  borderTop: '1px solid #bbf7d0',
                                }}
                              >
                                <CheckCircle2 size={14} color="#059669" />
                                <span>{resolveDateStr}</span>
                              </div>
                            )}

                            {/* Quick Action Footer inside Card */}
                            {!isResolved && (['Admin', 'admin', 'Asset Manager', 'asset_manager'].includes(user?.role as string) || item.technicianId?._id === user?._id) && (
                              <div
                                style={{
                                  paddingTop: '10px',
                                  borderTop: '1px solid #f1f5f9',
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  alignItems: 'center',
                                  justifyContent: 'flex-end',
                                  gap: '6px',
                                }}
                              >
                                {item.status === 'Pending' && (
                                  <>
                                    <button
                                      onClick={() => updateStatus(item._id, 'Rejected')}
                                      style={{
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        backgroundColor: '#ffe4e6',
                                        color: '#be123c',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Reject
                                    </button>
                                    <button
                                      onClick={() => updateStatus(item._id, 'Approved')}
                                      style={{
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        padding: '5px 10px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: '#2563eb',
                                        color: '#ffffff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Approve <ArrowRight size={12} />
                                    </button>
                                  </>
                                )}

                                {item.status === 'Approved' && (
                                  <>
                                    <button
                                      onClick={() => setAssignModal({ open: true, reqId: item._id })}
                                      style={{
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        padding: '5px 10px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: '#f3e8ff',
                                        color: '#6b21a8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <UserPlus size={13} /> Assign Tech
                                    </button>
                                    <button
                                      onClick={() => updateStatus(item._id, 'In Progress')}
                                      style={{
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        padding: '5px 10px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        backgroundColor: '#0f172a',
                                        color: '#ffffff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      Start <PlayCircle size={12} />
                                    </button>
                                  </>
                                )}

                                {item.status === 'Assigned' && (
                                  <button
                                    onClick={() => updateStatus(item._id, 'In Progress')}
                                    style={{
                                      width: '100%',
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      padding: '6px 12px',
                                      borderRadius: '8px',
                                      border: 'none',
                                      backgroundColor: '#0f172a',
                                      color: '#ffffff',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Start Work <PlayCircle size={14} />
                                  </button>
                                )}

                                {item.status === 'In Progress' && (
                                  <button
                                    onClick={() => updateStatus(item._id, 'Resolved')}
                                    style={{
                                      width: '100%',
                                      fontSize: '12px',
                                      fontWeight: 800,
                                      padding: '6px 12px',
                                      borderRadius: '8px',
                                      border: 'none',
                                      backgroundColor: '#059669',
                                      color: '#ffffff',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Mark Resolved <CheckCircle2 size={14} />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sketch Footer Note Banner */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              💡
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                Approving a card moves the asset to under maintenance, resolving return it to available
              </p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                All status transitions automatically sync your physical asset inventory state across Allocations and Bookings.
              </p>
            </div>
          </div>
        </>
      ) : (
        /* ─── TABLE VIEW FALLBACK (Premium Redesign with AI Diagnostics Support) ─── */
        <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #cbd5e1', overflow: 'hidden', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)' }}>
          {/* Table Top Summary Header */}
          <div style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>All Maintenance Records</span>
              <span style={{ backgroundColor: '#e2e8f0', color: '#334155', padding: '2px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 800 }}>
                {requests.length} total
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
              Click any row to view automated AI diagnostic suggestions & root cause analysis.
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: '64px', textAlign: 'center', color: '#64748b', fontWeight: 500, fontSize: '15px' }}>Loading maintenance records...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    <th style={{ padding: '16px 20px', width: '30px' }}></th>
                    <th style={{ padding: '16px 20px', fontWeight: 800, whiteSpace: 'nowrap' }}>Asset Equipment</th>
                    <th style={{ padding: '16px 20px', fontWeight: 800 }}>Issue Description</th>
                    <th style={{ padding: '16px 20px', fontWeight: 800, whiteSpace: 'nowrap' }}>Reported By</th>
                    <th style={{ padding: '16px 20px', fontWeight: 800, whiteSpace: 'nowrap' }}>Technician Assigned</th>
                    <th style={{ padding: '16px 20px', fontWeight: 800, whiteSpace: 'nowrap' }}>Priority</th>
                    <th style={{ padding: '16px 20px', fontWeight: 800, whiteSpace: 'nowrap' }}>Status</th>
                    <th style={{ padding: '16px 20px', fontWeight: 800, whiteSpace: 'nowrap' }}>Quick Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: '14px' }}>
                        No maintenance requests recorded in the system.
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => {
                      const isResolved = req.status === 'Resolved';
                      const isRejected = req.status === 'Rejected';
                      const assetTag = req.assetId?.assetTag || 'AF-XXXX';
                      const assetName = req.assetId?.name || 'Unknown Asset';
                      const reporterName = getTechName(req.raisedBy);
                      const techName = req.technicianId ? getTechName(req.technicianId) : null;
                      const initialReporter = reporterName.charAt(0).toUpperCase();
                      const isExpanded = expandedId === req._id;

                      return (
                        <React.Fragment key={req._id}>
                          <tr
                            onClick={() => toggleRow(req._id)}
                            style={{
                              borderBottom: isExpanded ? 'none' : '1px solid #f1f5f9',
                              backgroundColor: isResolved ? '#fafcfb' : isExpanded ? '#f8fafc' : '#ffffff',
                              transition: 'background-color 0.15s ease',
                              cursor: 'pointer',
                            }}
                          >
                            <td style={{ padding: '16px 0 16px 20px', color: '#64748b' }}>
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </td>

                            {/* Column 1: Asset Tag Pill + Asset Name */}
                            <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span
                                  style={{
                                    backgroundColor: '#0f172a',
                                    color: '#ffffff',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    letterSpacing: '0.5px',
                                  }}
                                >
                                  {assetTag}
                                </span>
                                <span style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>
                                  {assetName}
                                </span>
                              </div>
                            </td>

                            {/* Column 2: Issue Description */}
                            <td style={{ padding: '16px 20px', maxWidth: '300px', color: '#334155', fontWeight: 600, fontSize: '13px', lineHeight: 1.4 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span>{req.description}</span>
                                {req.aiDiagnostic && (
                                  <span title="AI Diagnostic Available" style={{ display: 'inline-flex', alignItems: 'center', color: '#7c3aed', backgroundColor: '#f3e8ff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>
                                    <Sparkles size={11} /> AI
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Column 3: Reported By with Avatar */}
                            <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                  style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '9999px',
                                    backgroundColor: '#e2e8f0',
                                    color: '#334155',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 800,
                                  }}
                                >
                                  {initialReporter}
                                </span>
                                <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>{reporterName}</span>
                              </div>
                            </td>

                            {/* Column 4: Technician */}
                            <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                              {techName ? (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#f3e8ff', border: '1px solid #e9d5ff', color: '#6b21a8', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
                                  <UserCheck size={14} color="#7e22ce" />
                                  <span>{techName}</span>
                                </div>
                              ) : (
                                <span style={{ display: 'inline-block', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', color: '#94a3b8', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                                  Unassigned
                                </span>
                              )}
                            </td>

                            {/* Column 5: Priority with Dot Indicator */}
                            <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  padding: '4px 10px',
                                  borderRadius: '9999px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  textTransform: 'uppercase',
                                  backgroundColor: req.priority === 'Critical' || req.priority === 'High' ? '#ffe4e6' : req.priority === 'Medium' ? '#dbeafe' : '#f1f5f9',
                                  color: req.priority === 'Critical' || req.priority === 'High' ? '#be123c' : req.priority === 'Medium' ? '#1d4ed8' : '#475569',
                                }}
                              >
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                                {req.priority}
                              </span>
                            </td>

                            {/* Column 6: Status Pill (Strictly NoWrap) */}
                            <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '5px 12px',
                                  borderRadius: '9999px',
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  whiteSpace: 'nowrap',
                                  backgroundColor:
                                    req.status === 'Resolved'
                                      ? '#dcfce7'
                                      : req.status === 'Pending'
                                      ? '#fef3c7'
                                      : req.status === 'Approved'
                                      ? '#dbeafe'
                                      : req.status === 'Assigned'
                                      ? '#f3e8ff'
                                      : req.status === 'In Progress'
                                      ? '#cffafe'
                                      : '#fee2e2',
                                  color:
                                    req.status === 'Resolved'
                                      ? '#065f46'
                                      : req.status === 'Pending'
                                      ? '#92400e'
                                      : req.status === 'Approved'
                                      ? '#1e40af'
                                      : req.status === 'Assigned'
                                      ? '#6b21a8'
                                      : req.status === 'In Progress'
                                      ? '#155e75'
                                      : '#b91c1c',
                                  border: req.status === 'Resolved' ? '1px solid #bbf7d0' : 'none',
                                }}
                              >
                                {req.status}
                              </span>
                            </td>

                            {/* Column 7: Quick Actions */}
                            <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {!isResolved && !isRejected && (['Admin', 'admin', 'Asset Manager', 'asset_manager'].includes(user?.role as string) || req.technicianId?._id === user?._id) ? (
                                  <>
                                    {req.status === 'Pending' && (
                                      <>
                                        <button
                                          onClick={() => updateStatus(req._id, 'Approved')}
                                          style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '6px 14px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' }}
                                        >
                                          Approve <ArrowRight size={12} />
                                        </button>
                                        <button
                                          onClick={() => updateStatus(req._id, 'Rejected')}
                                          style={{ backgroundColor: '#ffe4e6', color: '#be123c', padding: '6px 10px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                                        >
                                          Reject
                                        </button>
                                      </>
                                    )}

                                    {req.status === 'Approved' && (
                                      <>
                                        <button
                                          onClick={() => setAssignModal({ open: true, reqId: req._id })}
                                          style={{ backgroundColor: '#f3e8ff', border: '1px solid #e9d5ff', color: '#6b21a8', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
                                        >
                                          <UserPlus size={13} /> Assign Tech
                                        </button>
                                        <button
                                          onClick={() => updateStatus(req._id, 'In Progress')}
                                          style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '6px 14px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(15, 23, 42, 0.2)' }}
                                        >
                                          Start <PlayCircle size={13} />
                                        </button>
                                      </>
                                    )}

                                    {req.status === 'Assigned' && (
                                      <button
                                        onClick={() => updateStatus(req._id, 'In Progress')}
                                        style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '6px 16px', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(15, 23, 42, 0.2)' }}
                                      >
                                        Start Work <PlayCircle size={13} />
                                      </button>
                                    )}

                                    {req.status === 'In Progress' && (
                                      <button
                                        onClick={() => updateStatus(req._id, 'Resolved')}
                                        style={{ backgroundColor: '#059669', color: '#ffffff', padding: '6px 16px', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)' }}
                                      >
                                        Mark Resolved <CheckCircle2 size={13} />
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {isResolved ? (
                                      <>
                                        <CheckCircle2 size={14} color="#059669" />
                                        <span style={{ color: '#065f46' }}>Completed</span>
                                      </>
                                    ) : isRejected ? (
                                      <span style={{ color: '#be123c' }}>Rejected</span>
                                    ) : (
                                      '--'
                                    )}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Row for AI Diagnostics */}
                          {isExpanded && (
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                              <td colSpan={8} style={{ padding: '0 20px 20px 48px' }}>
                                <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Sparkles size={16} color="#7c3aed" /> AI Maintenance Diagnostic Report
                                  </h4>

                                  {req.aiDiagnostic ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                                      <div>
                                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>AI Recommended Priority:</span>
                                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, backgroundColor: req.aiDiagnostic.recommendedPriority === 'High' || req.aiDiagnostic.recommendedPriority === 'Critical' ? '#ffe4e6' : '#dbeafe', color: req.aiDiagnostic.recommendedPriority === 'High' || req.aiDiagnostic.recommendedPriority === 'Critical' ? '#be123c' : '#1d4ed8' }}>
                                          {req.aiDiagnostic.recommendedPriority || req.priority}
                                        </span>
                                      </div>

                                      <div>
                                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Probable Failure Root Causes:</span>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                          {req.aiDiagnostic.probableCauses?.map((cause: string, cidx: number) => (
                                            <div key={cidx} style={{ fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#7c3aed' }} />
                                              {cause}
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {req.aiDiagnostic.suggestedSpareParts && req.aiDiagnostic.suggestedSpareParts.length > 0 && (
                                        <div>
                                          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Suggested Spare Parts & Tools:</span>
                                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {req.aiDiagnostic.suggestedSpareParts.map((part: string, pidx: number) => (
                                              <span key={pidx} style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '6px', backgroundColor: '#f3e8ff', color: '#6b21a8', fontWeight: 700 }}>
                                                🔧 {part}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748b', fontSize: '13px' }}>
                                      <AlertTriangle size={16} />
                                      <span>No automated AI diagnostics generated for this request yet. New requests will be automatically analyzed upon submission.</span>
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
      )}

      {/* ─── RAISE MAINTENANCE MODAL ─── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', maxWidth: '500px', width: '100%', padding: '28px', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)', border: '1px solid #cbd5e1' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>Raise Maintenance Request</h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>Log an equipment fault or schedule preventative servicing.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>Asset *</label>
                <select
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', color: '#1e293b', fontWeight: 500 }}
                  required
                  value={requestForm.assetId}
                  onChange={(e) => setRequestForm({ ...requestForm, assetId: e.target.value })}
                >
                  <option value="">Select Asset</option>
                  {assets.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} ({a.assetTag}) - {a.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>Priority *</label>
                <select
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', color: '#1e293b', fontWeight: 500 }}
                  required
                  value={requestForm.priority}
                  onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value as any })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>Issue Description *</label>
                <textarea
                  style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', color: '#1e293b', fontWeight: 500, fontFamily: 'inherit' }}
                  required
                  rows={4}
                  placeholder="e.g. Projector bulb not turning on, noisy compressor..."
                  value={requestForm.issueDescription}
                  onChange={(e) => setRequestForm({ ...requestForm, issueDescription: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 24px', borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#ffffff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(15, 23, 42, 0.15)' }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ASSIGN TECHNICIAN MODAL ─── */}
      {assignModal.open && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', maxWidth: '440px', width: '100%', padding: '26px', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)', border: '1px solid #cbd5e1' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>Assign Maintenance Technician</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 18px 0' }}>Select the staff member responsible for this repair.</p>

            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '6px' }}>Select Technician *</label>
              <select
                style={{ width: '100%', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '10px 14px', fontSize: '14px', color: '#1e293b', fontWeight: 500 }}
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
              >
                <option value="">-- Choose User / Tech --</option>
                {technicians.map((t) => (
                  <option key={t._id} value={t._id}>
                    {getTechName(t)} ({t.role || 'Staff'})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setAssignModal({ open: false, reqId: '' })}
                style={{ padding: '8px 18px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#334155', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignSubmit}
                style={{ padding: '8px 20px', borderRadius: '12px', border: 'none', backgroundColor: '#7e22ce', color: '#ffffff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(126, 34, 206, 0.2)' }}
              >
                Assign & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── REJECT PROMPT MODAL ─── */}
      <PromptModal
        isOpen={rejectModalOpen}
        title="Reject Maintenance Request"
        message="Please provide a reason for rejecting this maintenance request:"
        placeholder="Rejection reason..."
        onConfirm={handleRejectSubmit}
        onCancel={() => {
          setRejectModalOpen(false);
          setRequestToReject(null);
        }}
      />
    </div>
  );
}
