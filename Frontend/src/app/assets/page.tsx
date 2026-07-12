"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, LayoutGrid, List, Box } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

type Asset = {
  id: string;
  name: string;
  category: string;
  status: "Available" | "In Use" | "Maintenance" | "Retired";
  assignee?: string;
  department: string;
  health: number;
};

const mockAssets: Asset[] = [
  { id: "AST-1042", name: "MacBook Pro M3 Max", category: "Laptop", status: "In Use", assignee: "Sarah Jenkins", department: "Engineering", health: 98 },
  { id: "AST-1043", name: "Dell UltraSharp 32\"", category: "Monitor", status: "Available", department: "IT", health: 100 },
  { id: "AST-1044", name: "Herman Miller Aeron", category: "Furniture", status: "In Use", assignee: "Mike Ross", department: "Legal", health: 85 },
  { id: "AST-1045", name: "iPad Pro 12.9", category: "Tablet", status: "Maintenance", department: "Sales", health: 45 },
  { id: "AST-1046", name: "Lenovo ThinkPad X1", category: "Laptop", status: "Available", department: "IT", health: 100 },
];

const columns: ColumnDef<Asset>[] = [
  {
    accessorKey: "id",
    header: "Asset ID",
    cell: ({ row }) => <span className="font-medium">{row.getValue("id")}</span>,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/assets/${row.getValue("id")}`} className="font-semibold text-primary hover:underline">
        {row.getValue("name")}
      </Link>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge 
          variant={
            status === "Available" ? "default" :
            status === "In Use" ? "secondary" :
            status === "Maintenance" ? "destructive" : "outline"
          }
          className={
            status === "Available" ? "bg-success hover:bg-success/80 text-white" :
            status === "In Use" ? "bg-primary/10 text-primary hover:bg-primary/20 border-0" :
            status === "Maintenance" ? "bg-warning hover:bg-warning/80 text-white" : ""
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "assignee",
    header: "Assignee",
    cell: ({ row }) => row.getValue("assignee") || <span className="text-muted-foreground italic">Unassigned</span>,
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "health",
    header: "Health",
    cell: ({ row }) => {
      const health = row.getValue("health") as number;
      return (
        <div className="flex items-center gap-2">
          <div className="w-full bg-secondary rounded-full h-2 max-w-[60px]">
            <div 
              className={`h-2 rounded-full ${health > 80 ? 'bg-success' : health > 50 ? 'bg-warning' : 'bg-destructive'}`} 
              style={{ width: `${health}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{health}%</span>
        </div>
      );
    },
  },
];

export default function AssetsPage() {
  const [view, setView] = useState<"table" | "grid">("table");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Assets"
        description="Manage your enterprise hardware, software, and physical assets."
        action={{ label: "Add Asset", icon: Plus, href: "/assets/new" }}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border">
        <div className="flex w-full sm:w-auto items-center space-x-2">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets by name, ID, or assignee..."
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2 bg-muted p-1 rounded-lg">
          <Button 
            variant={view === "table" ? "secondary" : "ghost"} 
            size="sm" 
            className="h-7 px-2"
            onClick={() => setView("table")}
          >
            <List className="h-4 w-4 mr-1" /> Table
          </Button>
          <Button 
            variant={view === "grid" ? "secondary" : "ghost"} 
            size="sm" 
            className="h-7 px-2"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="h-4 w-4 mr-1" /> Grid
          </Button>
        </div>
      </div>

      {view === "table" ? (
        <DataTable columns={columns} data={mockAssets} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {mockAssets.map(asset => (
            <div key={asset.id} className="border bg-card rounded-xl p-5 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Box className="h-6 w-6" />
                </div>
                <Badge 
                  variant="outline"
                  className={
                    asset.status === "Available" ? "border-success text-success" :
                    asset.status === "In Use" ? "border-primary text-primary" :
                    asset.status === "Maintenance" ? "border-warning text-warning" : ""
                  }
                >
                  {asset.status}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg line-clamp-1">
                <Link href={`/assets/${asset.id}`} className="hover:underline">{asset.name}</Link>
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{asset.id} • {asset.category}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assignee</span>
                  <span className="font-medium">{asset.assignee || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Department</span>
                  <span className="font-medium">{asset.department}</span>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Health</span>
                    <span className="text-xs font-medium">{asset.health}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${asset.health > 80 ? 'bg-success' : asset.health > 50 ? 'bg-warning' : 'bg-destructive'}`} 
                      style={{ width: `${asset.health}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
