"use client";

import React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, MapPin, User, FileText, Share2, Printer } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AllocationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const allocation = {
    id: id || "ALC-2001",
    assetName: "MacBook Pro M3 Max",
    assetId: "AST-1042",
    assignee: "Sarah Jenkins",
    department: "Engineering",
    status: "Active",
    dateAllocated: "2023-11-15",
    expectedReturn: "2026-11-15",
    location: "HQ - San Francisco",
    notes: "Standard issue for senior engineering role. Includes required software bundle.",
  };

  const timeline = [
    { id: 1, date: "Nov 15, 2023", time: "10:30 AM", action: "Asset Allocated", user: "Admin", details: "Asset handed over to Sarah Jenkins." },
    { id: 2, date: "Nov 14, 2023", time: "02:15 PM", action: "Allocation Approved", user: "Manager", details: "Approved by Engineering Lead." },
    { id: 3, date: "Nov 12, 2023", time: "09:00 AM", action: "Allocation Requested", user: "Sarah Jenkins", details: "Request submitted via portal." },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">Allocation {allocation.id}</h1>
              <Badge 
                variant="outline"
                className={
                  allocation.status === "Active" ? "bg-success/10 text-success border-success/20" :
                  allocation.status === "Returned" ? "bg-secondary text-secondary-foreground" : "bg-warning/10 text-warning border-warning/20"
                }
              >
                {allocation.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">Asset: {allocation.assetName} ({allocation.assetId})</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Printer className="h-4 w-4 mr-2"/> Print Agreement</Button>
          <Button variant="outline"><Share2 className="h-4 w-4 mr-2"/> Share</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Allocation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><User className="h-4 w-4"/> Assignee</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">{allocation.assignee.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium leading-none">{allocation.assignee}</p>
                      <p className="text-xs text-muted-foreground mt-1">{allocation.department}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="h-4 w-4"/> Location</p>
                  <p className="font-medium">{allocation.location}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><Clock className="h-4 w-4"/> Allocated On</p>
                  <p className="font-medium">{allocation.dateAllocated}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><Clock className="h-4 w-4"/> Expected Return</p>
                  <p className="font-medium">{allocation.expectedReturn}</p>
                </div>
                
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1"><FileText className="h-4 w-4"/> Notes</p>
                  <p className="text-sm bg-muted/50 p-3 rounded-md border">{allocation.notes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Asset Overview</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <div className="h-24 w-24 bg-muted rounded-lg flex items-center justify-center border shrink-0">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{allocation.assetName}</h3>
                <p className="text-sm text-muted-foreground">ID: {allocation.assetId}</p>
                <Button variant="link" className="px-0 h-auto" onClick={() => router.push(`/assets/${allocation.assetId}`)}>
                  View Full Asset Details →
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Timeline */}
        <div className="md:col-span-1 space-y-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
              <CardDescription>History of this allocation.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-muted ml-3 space-y-6">
                {timeline.map((event, index) => (
                  <div key={event.id} className="relative pl-6">
                    <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-background ${
                      index === 0 ? 'bg-primary' : 'bg-muted-foreground'
                    }`} />
                    
                    <div className="mb-1">
                      <h4 className="font-semibold text-sm">{event.action}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{event.date} at {event.time}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{event.details}</p>
                    <p className="text-xs font-medium mt-1">By {event.user}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
