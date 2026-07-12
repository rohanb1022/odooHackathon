'use client';

import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Booking {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  resourceId?: { name: string; assetTag: string };
  bookedBy?: { name: string; firstName?: string; lastName?: string };
}

interface Props {
  bookings: Booking[];
  onSelectBooking: (booking: Booking) => void;
}

export default function BookingsCalendar({ bookings, onSelectBooking }: Props) {
  const events = bookings.map(b => ({
    id: b._id,
    title: b.title || `${b.resourceId?.name || 'Asset'} Booking`,
    start: new Date(b.startTime),
    end: new Date(b.endTime),
    resource: b,
  }));

  const eventStyleGetter = (event: any) => {
    const status = event.resource.status;
    let backgroundColor = 'var(--primary)';
    
    if (status === 'Upcoming') backgroundColor = 'var(--warning)';
    else if (status === 'Ongoing') backgroundColor = 'var(--info)';
    else if (status === 'Completed') backgroundColor = 'var(--success)';
    else if (status === 'Cancelled') backgroundColor = 'var(--error)';

    return {
      style: {
        backgroundColor: `hsl(${backgroundColor})`,
        borderRadius: '4px',
        opacity: 0.9,
        color: '#fff',
        border: '0px',
        display: 'block'
      }
    };
  };

  return (
    <div style={{ height: '700px', backgroundColor: 'hsl(var(--surface))', padding: '1rem', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%', fontFamily: 'var(--font-sans)' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={(e) => onSelectBooking(e.resource)}
        views={['month', 'week', 'day']}
        defaultView="week"
      />
      <style dangerouslySetInnerHTML={{
        __html: `
          .rbc-calendar {
            font-family: var(--font-sans);
          }
          .rbc-header {
            padding: 10px;
            font-weight: 600;
            background-color: hsla(var(--surface), 0.5);
          }
          .rbc-today {
            background-color: hsla(var(--primary), 0.05);
          }
          .rbc-event {
            padding: 2px 5px;
            font-size: 0.85rem;
            font-weight: 500;
          }
          .rbc-toolbar button {
            color: hsl(var(--text-main));
          }
          .rbc-toolbar button.rbc-active {
            background-color: hsl(var(--primary));
            color: white;
            border-color: hsl(var(--primary));
          }
        `
      }} />
    </div>
  );
}
