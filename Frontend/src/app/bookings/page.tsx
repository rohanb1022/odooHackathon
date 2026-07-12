"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Clock, MapPin, Users, AlertCircle, Calendar as CalendarIcon, Info } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Booking = {
  id: string;
  title: string;
  resource: string;
  time: string;
  duration: string;
  organizer: string;
  status: "Confirmed" | "Tentative" | "Conflict";
  attendees: number;
};

const mockBookings: Booking[] = [
  { id: "BK-301", title: "Q3 Planning Session", resource: "Conference Room A", time: "10:00 AM", duration: "2h", organizer: "Sarah Jenkins", status: "Confirmed", attendees: 8 },
  { id: "BK-302", title: "Client Demo", resource: "Demo Lab 1", time: "1:00 PM", duration: "1h", organizer: "Mike Ross", status: "Confirmed", attendees: 4 },
  { id: "BK-303", title: "Engineering Sync", resource: "Conference Room A", time: "11:30 AM", duration: "1h", organizer: "David Chen", status: "Conflict", attendees: 12 },
  { id: "BK-304", title: "1:1 Review", resource: "Huddle Room 3", time: "3:30 PM", duration: "30m", organizer: "Elena Gilbert", status: "Tentative", attendees: 2 },
];

export default function BookingsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // States for Booking Details
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // States for New Booking
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [newBookingTime, setNewBookingTime] = useState("");
  const [newBookingResource, setNewBookingResource] = useState("");

  // Simple conflict detection simulation
  const hasConflict = newBookingTime === "10:00" && newBookingResource.toLowerCase().includes("a");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Bookings"
        description="Schedule and manage shared resources, rooms, and specialized equipment."
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Calendar */}
        <div className="md:col-span-4 lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="p-3">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border-0 w-full flex justify-center"
              />
            </CardContent>
          </Card>
          
          <Dialog open={isNewBookingOpen} onOpenChange={setIsNewBookingOpen}>
            <DialogTrigger>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Book Resource
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book a Resource</DialogTitle>
                <DialogDescription>
                  Reserve a room or equipment for a specific time.
                </DialogDescription>
              </DialogHeader>
              
              {hasConflict && (
                <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-start gap-3 mt-2 border border-destructive/20 animate-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Scheduling Conflict Detected</h4>
                    <p className="text-sm mt-1 opacity-90">
                      &quot;Conference Room A&quot; is already booked for &quot;Q3 Planning Session&quot; at 10:00 AM. Please select a different time or resource.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Meeting Title</Label>
                  <Input id="title" placeholder="e.g. Q3 Planning" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resource">Resource</Label>
                  <Input 
                    id="resource" 
                    placeholder="e.g. Conference Room A" 
                    value={newBookingResource}
                    onChange={(e) => setNewBookingResource(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input 
                      id="time" 
                      type="time" 
                      value={newBookingTime}
                      onChange={(e) => setNewBookingTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                      <option>30m</option>
                      <option>1h</option>
                      <option>1h 30m</option>
                      <option>2h</option>
                    </select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewBookingOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={hasConflict}>Confirm Booking</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Right Column: Agenda */}
        <div className="md:col-span-8 lg:col-span-9">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div>
                <CardTitle>Agenda</CardTitle>
                <CardDescription>
                  {date ? date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : "Select a date"}
                </CardDescription>
              </div>
              <Badge variant="secondary">{mockBookings.length} Events</Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {mockBookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    onClick={() => {
                      setSelectedBooking(booking);
                      setIsDetailsOpen(true);
                    }}
                    className={`flex flex-col sm:flex-row gap-4 p-4 rounded-xl border relative overflow-hidden transition-all hover:shadow-md cursor-pointer ${
                      booking.status === 'Conflict' ? 'bg-destructive/5 border-destructive/20 hover:border-destructive/40' : 'bg-card hover:border-primary/30'
                    }`}
                  >
                    {/* Status Indicator Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      booking.status === 'Confirmed' ? 'bg-success' :
                      booking.status === 'Tentative' ? 'bg-warning' : 'bg-destructive'
                    }`} />
                    
                    <div className="w-24 shrink-0 flex flex-col justify-center text-center sm:text-left sm:pl-2">
                      <span className="text-lg font-bold">{booking.time}</span>
                      <span className="text-xs text-muted-foreground">{booking.duration}</span>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="font-semibold text-lg">{booking.title}</h4>
                        <Badge 
                          variant={booking.status === 'Confirmed' ? 'default' : 'outline'}
                          className={
                            booking.status === 'Confirmed' ? 'bg-success hover:bg-success text-white' :
                            booking.status === 'Conflict' ? 'border-destructive text-destructive' : 'border-warning text-warning'
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{booking.resource}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          <span>{booking.attendees} attendees</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="shrink-0 flex items-center justify-center sm:justify-end">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">{booking.organizer.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {selectedBooking && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge 
                    variant={selectedBooking.status === 'Confirmed' ? 'default' : 'outline'}
                    className={
                      selectedBooking.status === 'Confirmed' ? 'bg-success hover:bg-success text-white' :
                      selectedBooking.status === 'Conflict' ? 'border-destructive text-destructive' : 'border-warning text-warning'
                    }
                  >
                    {selectedBooking.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{selectedBooking.id}</span>
                </div>
                <DialogTitle className="text-xl">{selectedBooking.title}</DialogTitle>
                <DialogDescription>
                  Organized by {selectedBooking.organizer}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="flex items-start gap-4">
                  <div className="bg-muted p-2 rounded-md">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {date?.toLocaleDateString()} • {selectedBooking.time} ({selectedBooking.duration})
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-muted p-2 rounded-md">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Resource</p>
                    <p className="text-sm text-muted-foreground">{selectedBooking.resource}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-muted p-2 rounded-md">
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Attendees</p>
                    <p className="text-sm text-muted-foreground">{selectedBooking.attendees} confirmed participants</p>
                  </div>
                </div>
              </div>

              {selectedBooking.status === 'Conflict' && (
                <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20 flex gap-3 text-sm text-destructive mt-2">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>This booking conflicts with an existing reservation. Please reschedule or select a different resource.</p>
                </div>
              )}

              <DialogFooter className="flex sm:justify-between sm:space-x-2 w-full mt-4">
                <Button variant="outline" className="w-full sm:w-auto text-destructive hover:text-destructive hover:bg-destructive/10">
                  Cancel Booking
                </Button>
                <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                  <Button className="flex-1 sm:flex-none">Reschedule</Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
