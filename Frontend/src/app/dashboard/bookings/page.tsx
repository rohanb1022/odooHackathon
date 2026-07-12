'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, X, CalendarCheck, LayoutList } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { toast } from 'react-toastify';
import dynamic from 'next/dynamic';

const BookingsCalendar = dynamic(() => import('@/components/BookingsCalendar'), { ssr: false });

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
  const [viewMode, setViewMode]     = useState<'calendar' | 'list'>('calendar');
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any | null>(null);

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
      const { data } = await api.get('/assets?isBookable=true');
      setResources(data.data);
      setShowModal(true);
    } catch { toast.error('Failed to load shared resources'); }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/bookings', form);
      toast.success('Resource booked successfully!');
      setShowModal(false);
      setForm({ resourceId: '', startTime: '', endTime: '', purpose: '' });
      fetchBookings();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to book resource (Overlap likely)'); }
  };

  const handleCancel = (id: string) => {
    setBookingToCancel(id);
    setCancelConfirmOpen(true);
  };

  const submitCancel = async () => {
    if (!bookingToCancel) return;
    try {
      await api.patch(`/bookings/${bookingToCancel}/cancel`, { cancelReason: 'User cancelled' });
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to cancel booking'); }
    finally { setCancelConfirmOpen(false); setBookingToCancel(null); }
  };

  const statusCounts = (s: string) => bookings.filter(b => b.status === s).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Bookings & Reservations</h1>
          <p style={{ color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>Schedule and manage asset usage.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', backgroundColor: 'hsla(var(--border), 0.5)', borderRadius: '8px', padding: '4px' }}>
            <button 
              onClick={() => setViewMode('calendar')}
              style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: '6px', 
                fontSize: '0.875rem', 
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: viewMode === 'calendar' ? 'hsl(var(--surface))' : 'transparent',
                boxShadow: viewMode === 'calendar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                color: viewMode === 'calendar' ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))'
              }}
            >
              <CalendarIcon size={16} /> Calendar
            </button>
            <button 
              onClick={() => setViewMode('list')}
              style={{ 
                padding: '0.5rem 1rem', 
                borderRadius: '6px', 
                fontSize: '0.875rem', 
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: viewMode === 'list' ? 'hsl(var(--surface))' : 'transparent',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                color: viewMode === 'list' ? 'hsl(var(--primary))' : 'hsl(var(--text-muted))'
              }}
            >
              <LayoutList size={16} /> List
            </button>
          </div>

          <button className="btn btn-primary" onClick={loadResources} style={{ gap: '0.5rem' }}>
            <Plus size={16} /> New Booking
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <BookingsCalendar 
          bookings={bookings} 
          onSelectBooking={(booking: any) => setBookingDetails(booking)} 
        />
      ) : (
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          {!isLoading && bookings.length > 0 && (
            <div style={{ display: 'flex', gap: '.625rem', flexWrap: 'wrap', padding: '1rem' }}>
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
      )}

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

      {/* Booking Details Modal */}
      {bookingDetails && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setBookingDetails(null)}>
          <div className="modal-content" style={{ maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Booking Details</h2>
              <button onClick={() => setBookingDetails(null)}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              <div><strong style={{ color: 'hsl(var(--text-muted))' }}>Title</strong><br/>{bookingDetails.title}</div>
              <div><strong style={{ color: 'hsl(var(--text-muted))' }}>Resource</strong><br/>{bookingDetails.resourceId?.name} ({bookingDetails.resourceId?.assetTag})</div>
              <div><strong style={{ color: 'hsl(var(--text-muted))' }}>Booked By</strong><br/>{bookingDetails.bookedBy?.name}</div>
              <div><strong style={{ color: 'hsl(var(--text-muted))' }}>Time</strong><br/>{new Date(bookingDetails.startTime).toLocaleString()} - {new Date(bookingDetails.endTime).toLocaleString()}</div>
              <div><strong style={{ color: 'hsl(var(--text-muted))' }}>Status</strong><br/><span className={getBadgeClass(bookingDetails.status)}>{bookingDetails.status}</span></div>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setBookingDetails(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={cancelConfirmOpen}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? The resource will become available to others."
        confirmText="Cancel Booking"
        isDanger={true}
        onConfirm={submitCancel}
        onCancel={() => { setCancelConfirmOpen(false); setBookingToCancel(null); }}
      />
    </div>
  );
}
