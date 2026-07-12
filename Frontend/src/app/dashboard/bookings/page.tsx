'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';

export default function BookingsPage() {
  const user = useAuthStore(state => state.user);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [bookingForm, setBookingForm] = useState({ resourceId: '', startTime: '', endTime: '', purpose: '' });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings');
      setBookings(data.data);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadResources = async () => {
    try {
      // Shared resources only
      const { data } = await api.get('/assets?isShared=true');
      setResources(data.data);
      setShowModal(true);
    } catch (error) {
      alert('Failed to load shared resources');
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/bookings', {
        resource: bookingForm.resourceId,
        startTime: new Date(bookingForm.startTime).toISOString(),
        endTime: new Date(bookingForm.endTime).toISOString(),
        purpose: bookingForm.purpose
      });
      alert('Resource booked successfully!');
      setShowModal(false);
      fetchBookings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to book resource (Overlap likely)');
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: 'Cancelled' });
      alert('Booking cancelled');
      fetchBookings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return 'var(--info)';
      case 'Ongoing': return 'var(--primary)';
      case 'Completed': return 'var(--success)';
      case 'Cancelled': return 'var(--error)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Resource Bookings</h1>
          <p style={{ color: 'hsl(var(--text-muted))', marginTop: '0.25rem' }}>Reserve shared rooms, vehicles, and equipment.</p>
        </div>
        
        <button className="btn btn-primary" onClick={loadResources} style={{ gap: '0.5rem' }}>
          <Plus size={16} /> Book Resource
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--text-muted))' }}>Loading bookings...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(var(--border))', color: 'hsl(var(--text-muted))', backgroundColor: 'hsla(var(--surface), 0.5)' }}>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Resource</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Booked By</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Start Time</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>End Time</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Purpose</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Status</th>
                  <th style={{ padding: '1rem', fontWeight: 500 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                      No active bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.map(booking => {
                    const startDate = new Date(booking.startTime);
                    const endDate = new Date(booking.endTime);
                    return (
                      <tr key={booking._id} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                        <td style={{ padding: '1rem', fontWeight: 500 }}>{booking.resource?.name}</td>
                        <td style={{ padding: '1rem' }}>{booking.user?.name}</td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CalendarIcon size={14} style={{ color: 'hsl(var(--text-muted))' }} />
                            {startDate.toLocaleDateString()}
                            <Clock size={14} style={{ marginLeft: '0.5rem', color: 'hsl(var(--text-muted))' }} />
                            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={14} style={{ color: 'hsl(var(--text-muted))' }} />
                            {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td style={{ padding: '1rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {booking.purpose}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.25rem 0.6rem', 
                            borderRadius: '9999px', 
                            fontSize: '0.75rem', 
                            fontWeight: 500,
                            backgroundColor: `hsla(${getStatusColor(booking.status)}, 0.1)`,
                            color: `hsl(${getStatusColor(booking.status)})`
                          }}>
                            {booking.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {(booking.status === 'Upcoming' || booking.status === 'Ongoing') && (booking.user?._id === user?._id || user?.role === 'admin') && (
                            <button onClick={() => handleCancel(booking._id)} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'hsl(var(--error))', borderColor: 'hsla(var(--error), 0.3)' }}>
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Book a Resource</h2>
            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Resource *</label>
                <select className="input-field" required value={bookingForm.resourceId} onChange={e => setBookingForm({...bookingForm, resourceId: e.target.value})}>
                  <option value="">Select Resource</option>
                  {resources.map(r => <option key={r._id} value={r._id}>{r.name} ({r.location})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Start Time *</label>
                  <input type="datetime-local" className="input-field" required value={bookingForm.startTime} onChange={e => setBookingForm({...bookingForm, startTime: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>End Time *</label>
                  <input type="datetime-local" className="input-field" required value={bookingForm.endTime} onChange={e => setBookingForm({...bookingForm, endTime: e.target.value})} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Purpose</label>
                <input type="text" className="input-field" required placeholder="e.g. Weekly Sync" value={bookingForm.purpose} onChange={e => setBookingForm({...bookingForm, purpose: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
