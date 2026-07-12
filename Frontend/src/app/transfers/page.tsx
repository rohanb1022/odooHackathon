"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { ArrowRight, Check, X, Search, FileText, Clock } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type TransferRequest = {
  id: string;
  asset: string;
  from: string;
  to: string;
  requestedBy: string;
  date: string;
  status: "Pending Approval" | "Approved" | "Rejected" | "Completed";
  reason: string;
  timeline: { id: number; date: string; action: string; user: string; status: "completed" | "current" | "pending" }[];
};

const mockTransfers: TransferRequest[] = [
  { 
    id: "TRF-9012", asset: "MacBook Pro M3 Max", from: "IT Pool", to: "Sarah Jenkins", requestedBy: "Sarah Jenkins", date: "2024-05-10", status: "Pending Approval", reason: "Upgrade requested for new rendering project.",
    timeline: [
      { id: 1, date: "May 10, 10:30 AM", action: "Request Submitted", user: "Sarah Jenkins", status: "completed" },
      { id: 2, date: "Pending", action: "Manager Approval", user: "David Chen", status: "current" },
      { id: 3, date: "Pending", action: "IT Fulfillment", user: "IT Team", status: "pending" }
    ]
  },
  { 
    id: "TRF-9013", asset: "Dell UltraSharp 32\"", from: "Design Dept", to: "Marketing Dept", requestedBy: "Mike Ross", date: "2024-05-09", status: "Completed", reason: "Temporary reallocation for Q2 campaign.",
    timeline: [
      { id: 1, date: "May 09, 09:00 AM", action: "Request Submitted", user: "Mike Ross", status: "completed" },
      { id: 2, date: "May 09, 11:15 AM", action: "Manager Approval", user: "Elena Gilbert", status: "completed" },
      { id: 3, date: "May 10, 02:30 PM", action: "Asset Transferred", user: "IT Team", status: "completed" }
    ]
  },
  { 
    id: "TRF-9014", asset: "iPad Pro 12.9", from: "Sales Dept", to: "Elena Gilbert", requestedBy: "David Chen", date: "2024-05-08", status: "Rejected", reason: "No business justification provided.",
    timeline: [
      { id: 1, date: "May 08, 04:20 PM", action: "Request Submitted", user: "David Chen", status: "completed" },
      { id: 2, date: "May 09, 10:00 AM", action: "Request Rejected", user: "Sarah Jenkins", status: "completed" }
    ]
  },
  { 
    id: "TRF-9015", asset: "Herman Miller Aeron", from: "Storage", to: "HR Dept", requestedBy: "Pam Beesly", date: "2024-05-11", status: "Approved", reason: "New hire onboarding.",
    timeline: [
      { id: 1, date: "May 11, 11:45 AM", action: "Request Submitted", user: "Pam Beesly", status: "completed" },
      { id: 2, date: "May 11, 01:20 PM", action: "Manager Approval", user: "Michael Scott", status: "completed" },
      { id: 3, date: "Pending", action: "Asset Delivery", user: "Facilities", status: "current" }
    ]
  },
];

export default function TransfersPage() {
  const [selectedRequest, setSelectedRequest] = useState<TransferRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const columns: ColumnDef<TransferRequest>[] = [
    {
      accessorKey: "id",
      header: "Request ID",
      cell: ({ row }) => <span className="font-medium text-muted-foreground">{row.getValue("id")}</span>,
    },
    {
      accessorKey: "asset",
      header: "Asset",
      cell: ({ row }) => <span className="font-semibold">{row.getValue("asset")}</span>,
    },
    {
      id: "route",
      header: "Route",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2 text-sm">
          <span className="truncate max-w-[100px]" title={row.original.from}>{row.original.from}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span className="truncate max-w-[100px] font-medium" title={row.original.to}>{row.original.to}</span>
        </div>
      ),
    },
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge 
            variant="outline"
            className={
              status === "Approved" || status === "Completed" ? "bg-success/10 text-success border-success/20" :
              status === "Pending Approval" ? "bg-warning/10 text-warning border-warning/20" :
              status === "Rejected" ? "bg-destructive/10 text-destructive border-destructive/20" : ""
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedRequest(row.original);
              setActiveTab("details");
              setIsDetailsOpen(true);
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            Review
          </Button>
        );
      },
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Transfers"
        description="Manage asset transfer requests and approvals."
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search transfers..." className="pl-9" />
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={mockTransfers} />

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transfer Request Details</DialogTitle>
            <DialogDescription>
              Review the details and timeline of this asset transfer request.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6 py-2">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                <div>
                  <p className="text-sm text-muted-foreground">Asset</p>
                  <p className="font-semibold text-lg">{selectedRequest.asset}</p>
                </div>
                <Badge 
                  variant="outline"
                  className={
                    selectedRequest.status === "Approved" || selectedRequest.status === "Completed" ? "bg-success/10 text-success border-success/20" :
                    selectedRequest.status === "Pending Approval" ? "bg-warning/10 text-warning border-warning/20" :
                    selectedRequest.status === "Rejected" ? "bg-destructive/10 text-destructive border-destructive/20" : ""
                  }
                >
                  {selectedRequest.status}
                </Badge>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 border-b">
                <button 
                  onClick={() => setActiveTab("details")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "details" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  Request Details
                </button>
                <button 
                  onClick={() => setActiveTab("timeline")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "timeline" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  Approval Timeline
                </button>
              </div>

              {activeTab === "details" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 border-l-2 border-border pl-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">From</p>
                      <p className="font-medium">{selectedRequest.from}</p>
                    </div>
                    <div className="space-y-1 border-l-2 border-primary pl-4 relative">
                      <ArrowRight className="absolute -left-[9px] top-1 h-4 w-4 text-primary bg-background rounded-full" />
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">To</p>
                      <p className="font-medium">{selectedRequest.to}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Requested By</p>
                      <p className="font-medium">{selectedRequest.requestedBy}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Request Date</p>
                      <p className="font-medium">{selectedRequest.date}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Justification / Reason</p>
                    <div className="p-3 bg-muted rounded-md text-sm border">
                      {selectedRequest.reason}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "timeline" && (
                <div className="animate-in fade-in pl-2 py-2">
                  <div className="relative border-l-2 border-muted ml-3 space-y-8 mt-2 mb-4">
                    {selectedRequest.timeline.map((event, index) => (
                      <div key={event.id} className={`relative pl-6 ${event.status === 'pending' ? 'opacity-50' : ''}`}>
                        <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-background flex items-center justify-center ${
                          event.status === 'completed' ? 'bg-success border-success' : 
                          event.status === 'current' ? 'bg-primary border-primary animate-pulse' : 'bg-muted-foreground'
                        }`}>
                          {event.status === 'completed' && <Check className="h-2 w-2 text-white" />}
                        </div>
                        
                        <div className="flex flex-col mb-1">
                          <h4 className="font-semibold text-sm">{event.action}</h4>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            {event.status === 'completed' ? <Clock className="h-3 w-3" /> : null} 
                            {event.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{event.user.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{event.user}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex space-x-2 sm:justify-end mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
            {selectedRequest?.status === "Pending Approval" && (
              <>
                <Button variant="destructive" onClick={() => setIsDetailsOpen(false)}>
                  <X className="mr-2 h-4 w-4" /> Reject
                </Button>
                <Button variant="default" className="bg-success hover:bg-success/90" onClick={() => setIsDetailsOpen(false)}>
                  <Check className="mr-2 h-4 w-4" /> Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
