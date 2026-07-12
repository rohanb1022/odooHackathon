'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, X, CalendarCheck } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';

function getBadgeClass(status: string) {
  const m: Record<string, string> = {
    Upcoming: 'badge-upcoming', Ongoing: 'badge-ongoing',
    Completed: 'badge-completed', Cancelled: 'badge-cancelled',
  };
  return `badge ${m[status] || 'badge-standard'}`;
}

function formatDT(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

function SkeletonRow() {
  return (
    <tr>
      {[...Array(7)].map((_, i) => (
        <td key={i} style={{ padding: '.875rem 1rem' }}>
          <div className="skeleton" style={{ height: 14, width: i === 0 ? '75%' : '60%', borderRadius: 4 }} />
        </td>
      ))}
    </tr>
  );
}

export default function BookingsPage() {
  const user = useAuthStore(s => s.user);
  const [bookings, setBookings]     = useState<any[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [resources, setResources]   = useState<any[]>([]);
  const [form, setForm]             = useState({ resourceId: '', startTime: '', endTime: '', purpose: '' });

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings');
      setBookings(data.data);
    } catch {}
    finally { setIsLoading(false); }
  };

  const loadResources = async () => {
    try {
      const { data } = await api.get('/assets?isShared=true');
      setResources(data.data);
      setShowModal(true);
    } catch { alert('Failed to load shared resources'); }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/bookings', {
        resourceId: form.resourceId,
        startTime:  new Date(form.startTime).toISOString(),
        endTime:    new Date(form.endTime).toISOString(),
        title:      form.purpose,
      });
      alert('Resource booked successfully!');
      setShowModal(false);
      setForm({ resourceId: '', startTime: '', endTime: '', purpose: '' });
      fetchBookings();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to book resource (Overlap likely)'); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${id}/status`, { status: 'Cancelled' });
      fetchBookings();
    } catch (err: any) { alert(err.response?.data?.message || 'Failed to cancel booking'); }
  };

  const statusCounts = (s: string) => bookings.filter(b => b.status === s).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <div className="page-header">
        <div>
          <h1 className="page-title">Resource Bookings</h1>
          <p className="page-subtitle">Reserve shared rooms, vehicles, and equipment.</p>
        </div>
        <button className="btn btn-primary" onClick={loadResources}>
          <Plus size={15} /> Book Resource
        </button>
      </div>

      {/* Summary pills */}
      {!isLoading && bookings.length > 0 && (
        <div style={{ display: 'flex', gap: '.625rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Upcoming',  count: statusCounts('Upcoming'),  color: '#0EA5E9', bg: 'rgb(14,165,233/.1)' },
            { label: 'Ongoing',   count: statusCounts('Ongoing'),   color: '#4F46E5', bg: 'rgb(79,70,229/.1)' },
            { label: 'Completed', count: statusCounts('Completed'), color: '#10B981', bg: 'rgb(16,185,129/.1)' },
            { label: 'Cancelled', count: statusCounts('Cancelled'), color: '#94A3B8', bg: 'rgb(148,163,184/.1)' },
          ].map(chip => (
            <div key={chip.label} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', padding: '.3rem .8rem', borderRadius: 999, background: chip.bg, border: `1px solid ${chip.color}28` }}>
              <CalendarIcon size={12} color={chip.color} />
              <span style={{ fontSize: '.78rem', fontWeight: 600, color: chip.color }}>{chip.count} {chip.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Booked By</th>
                <th>Start</th>
                <th>End</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                : bookings.length === 0
                ? (
                  <tr><td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><CalendarCheck size={22} /></div>
                      <p className="empty-state-title">No bookings yet</p>
                      <p className="empty-state-desc">Reserve a shared resource to get started.</p>
                    </div>
                  </td></tr>
                )
                : bookings.map(booking => {
                  const start = formatDT(booking.startTime);
                  const end   = formatDT(booking.endTime);
                  const canCancel = (booking.status === 'Upcoming' || booking.status === 'Ongoing') &&
                    (booking.user?._id === user?._id || user?.role === 'admin');
                  return (
                    <tr key={booking._id}>
                      <td style={{ fontWeight: 600 }}>{booking.resourceId?.name}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgb(79,70,229/.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', fontWeight: 700, color: 'hsl(var(--primary))', flexShrink: 0 }}>
                            {booking.bookedBy?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span style={{ fontSize: '.8125rem' }}>{booking.bookedBy?.name}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '.8125rem' }}>
                          <p style={{ fontWeight: 500 }}>{start.date}</p>
                          <p style={{ color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '.25rem', marginTop: 2 }}>
                            <Clock size={11} />{start.time}
                          </p>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '.8125rem' }}>
                          <p style={{ fontWeight: 500 }}>{end.date}</p>
                          <p style={{ color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '.25rem', marginTop: 2 }}>
                            <Clock size={11} />{end.time}
                          </p>
                        </div>
                      </td>
                      <td style={{ maxWidth: 200 }}>
                        <p style={{ fontSize: '.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200, color: 'hsl(var(--text-secondary))' }}>{booking.title}</p>
                      </td>
                      <td><span className={getBadgeClass(booking.status)}>{booking.status}</span></td>
                      <td>
                        {canCancel && (
                          <button onClick={() => handleCancel(booking._id)} className="btn btn-outline btn-sm" style={{ color: 'hsl(var(--error))', borderColor: 'rgb(239,68,68/.3)' }}>
                            <X size={12} /> Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-panel">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgb(79,70,229/.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarIcon size={17} color="#4F46E5" />
                </div>
                <h2 className="modal-title">Book a Resource</h2>
              </div>
              <button className="btn-icon btn-ghost" onClick={() => setShowModal(false)} style={{ color: 'hsl(var(--text-muted))' }}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <form id="book-form" onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Resource <span style={{ color: 'hsl(var(--error))' }}>*</span></label>
                  <select className="input-field" required value={form.resourceId} onChange={e => setForm({ ...form, resourceId: e.target.value })}>
                    <option value="">Select a resource…</option>
                    {resources.map(r => <option key={r._id} value={r._id}>{r.name} ({r.location})</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.875rem' }}>
                  <div>
                    <label className="form-label">Start Time <span style={{ color: 'hsl(var(--error))' }}>*</span></label>
                    <input type="datetime-local" className="input-field" required value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">End Time <span style={{ color: 'hsl(var(--error))' }}>*</span></label>
                    <input type="datetime-local" className="input-field" required value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Purpose <span style={{ color: 'hsl(var(--error))' }}>*</span></label>
                  <input type="text" className="input-field" required placeholder="e.g. Weekly Sync, Team Offsite…" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" form="book-form" className="btn btn-primary">Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
