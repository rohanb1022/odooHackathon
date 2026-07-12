"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Share2, History, CheckCircle2, ArrowRightLeft, CornerDownLeft } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

type Allocation = {
  id: string;
  asset: string;
  assetId: string;
  assignee: string;
  dateAllocated: string;
  status: "Active" | "Returned" | "Pending";
};

const mockAllocations: Allocation[] = [
  { id: "ALC-2001", asset: "MacBook Pro M3 Max", assetId: "AST-1042", assignee: "Sarah Jenkins", dateAllocated: "2023-11-15", status: "Active" },
  { id: "ALC-2002", asset: "Herman Miller Aeron", assetId: "AST-1044", assignee: "Mike Ross", dateAllocated: "2023-12-01", status: "Active" },
  { id: "ALC-2003", asset: "iPad Pro 12.9", assetId: "AST-1045", assignee: "Elena Gilbert", dateAllocated: "2023-10-10", status: "Returned" },
  { id: "ALC-2004", asset: "Dell UltraSharp 32\"", assetId: "AST-1043", assignee: "David Chen", dateAllocated: "2024-01-20", status: "Pending" },
];

export default function AllocationsPage() {
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<Allocation | null>(null);

  const columns: ColumnDef<Allocation>[] = [
    {
      accessorKey: "id",
      header: "Allocation ID",
      cell: ({ row }) => (
        <Link href={`/allocations/${row.getValue("id")}`} className="font-medium text-primary hover:underline">
          {row.getValue("id")}
        </Link>
      ),
    },
    {
      accessorKey: "asset",
      header: "Asset",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold">{row.getValue("asset")}</div>
          <div className="text-xs text-muted-foreground">{row.original.assetId}</div>
        </div>
      ),
    },
    {
      accessorKey: "assignee",
      header: "Assignee",
    },
    {
      accessorKey: "dateAllocated",
      header: "Date Allocated",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge 
            variant={
              status === "Active" ? "default" :
              status === "Returned" ? "secondary" : "outline"
            }
            className={
              status === "Active" ? "bg-success/10 text-success border-success/20 hover:bg-success/20" :
              status === "Pending" ? "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20" : ""
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
        const status = row.getValue("status") as string;
        return (
          <div className="flex space-x-2">
            {status === "Active" && (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedAllocation(row.original);
                    setReturnDialogOpen(true);
                  }}
                >
                  <CornerDownLeft className="h-4 w-4 mr-1" /> Return
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedAllocation(row.original);
                    setTransferDialogOpen(true);
                  }}
                >
                  <ArrowRightLeft className="h-4 w-4 mr-1" /> Transfer
                </Button>
              </>
            )}
            {status === "Pending" && (
              <Button variant="default" size="sm" className="bg-success hover:bg-success/90">
                Approve
              </Button>
            )}
            <Link href={`/allocations/${row.original.id}`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-2">
              <History className="h-4 w-4" />
            </Link>
          </div>
        );
      },
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Allocations"
        description="Track and manage asset assignments across your organization."
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Input placeholder="Search allocations..." className="w-full sm:w-80" />
        </div>
        
        <Dialog>
          <DialogTrigger>
            <Button>
              <Share2 className="mr-2 h-4 w-4" />
              New Allocation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Allocate Asset</DialogTitle>
              <DialogDescription>
                Assign an available asset to a user or department.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="asset">Asset</Label>
                <Input id="asset" placeholder="Search for available asset..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Input id="assignee" placeholder="Search user or department..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Start Date</Label>
                <Input id="date" type="date" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Complete Allocation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={mockAllocations} />

      {/* Return Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Asset</DialogTitle>
            <DialogDescription>
              Are you sure you want to process the return for {selectedAllocation?.asset}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Return Condition</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option>Good (Normal Wear)</option>
                <option>Damaged</option>
                <option>Needs Repair</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Input placeholder="Any observations..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => setReturnDialogOpen(false)}>Confirm Return</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Asset</DialogTitle>
            <DialogDescription>
              Initiate a transfer for {selectedAllocation?.asset} from {selectedAllocation?.assignee}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Transfer To</Label>
              <Input placeholder="Search user or department..." />
            </div>
            <div className="space-y-2">
              <Label>Transfer Date</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input placeholder="Why is this being transferred?" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => setTransferDialogOpen(false)}>Initiate Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
