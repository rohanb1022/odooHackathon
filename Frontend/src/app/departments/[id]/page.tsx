"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTable } from "@/components/shared/data-table";
import {
  Building2, Users, Box, Wrench, MapPin, DollarSign,
  TrendingUp, Mail, Phone, Edit, MoreHorizontal,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

const dept = {
  id: "dept-1", name: "Engineering", head: "Alex Kumar", headInitials: "AK",
  headEmail: "alex.kumar@assetflow.io", headPhone: "+1 (555) 0192",
  location: "Floor 2 & 3, Tower A", employees: 48, assets: 124,
  maintenanceOpen: 3, budget: "$280,000", utilization: 87,
  description: "Responsible for product development, infrastructure, and technical operations.",
};

const members = [
  { id: "u1", name: "Alex Kumar", role: "Head of Engineering", email: "alex.kumar@assetflow.io", assets: 3, initials: "AK", status: "Active" },
  { id: "u2", name: "Sarah Jenkins", role: "Senior Engineer", email: "sarah.j@assetflow.io", assets: 2, initials: "SJ", status: "Active" },
  { id: "u3", name: "Ross Geller", role: "Systems Engineer", email: "ross.g@assetflow.io", assets: 2, initials: "RG", status: "On Leave" },
  { id: "u4", name: "Monica Bing", role: "DevOps Engineer", email: "monica.b@assetflow.io", assets: 1, initials: "MB", status: "Active" },
  { id: "u5", name: "Chandler Bing", role: "Frontend Engineer", email: "chandler.b@assetflow.io", assets: 2, initials: "CB", status: "Active" },
];

type MemberRow = typeof members[0];
type AssetRow = { id: string; name: string; category: string; status: string; assignee: string; health: number };

const deptAssets: AssetRow[] = [
  { id: "AST-1042", name: "MacBook Pro M3 Max", category: "Laptop", status: "In Use", assignee: "Sarah Jenkins", health: 98 },
  { id: "AST-1055", name: "Mac Studio M2 Ultra", category: "Desktop", status: "Maintenance", assignee: "Ross Geller", health: 34 },
  { id: "AST-1071", name: "LG 27UK850 Monitor", category: "Monitor", status: "In Use", assignee: "Monica Bing", health: 100 },
  { id: "AST-1072", name: "Logitech MX Keys", category: "Peripheral", status: "Available", assignee: "—", health: 100 },
  { id: "AST-1073", name: "WD My Cloud NAS", category: "Storage", status: "In Use", assignee: "Chandler Bing", health: 76 },
];

const memberCols: ColumnDef<MemberRow>[] = [
  {
    accessorKey: "name",
    header: "Member",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-primary/10 text-primary">{row.original.initials}</AvatarFallback>
        </Avatar>
        <div>
          <Link href={`/users/${row.original.id}`} className="font-semibold text-sm hover:text-primary hover:underline">{row.original.name}</Link>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  { accessorKey: "role", header: "Role" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.getValue("status") as string;
      return <Badge variant="outline" className={s === "Active" ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}>{s}</Badge>;
    },
  },
  {
    accessorKey: "assets",
    header: "Assigned Assets",
    cell: ({ row }) => <span className="font-medium">{row.getValue("assets")}</span>,
  },
];

const assetCols: ColumnDef<AssetRow>[] = [
  { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue("id")}</span> },
  { accessorKey: "name", header: "Asset", cell: ({ row }) => <Link href={`/assets/${row.original.id}`} className="font-semibold text-sm hover:text-primary hover:underline">{row.getValue("name")}</Link> },
  { accessorKey: "category", header: "Category" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.getValue("status") as string;
      return (
        <Badge variant="outline" className={
          s === "In Use" ? "bg-primary/10 text-primary border-primary/20" :
          s === "Available" ? "bg-success/10 text-success border-success/20" :
          "bg-warning/10 text-warning border-warning/20"
        }>{s}</Badge>
      );
    },
  },
  { accessorKey: "assignee", header: "Assignee" },
  {
    accessorKey: "health",
    header: "Health",
    cell: ({ row }) => {
      const h = row.getValue("health") as number;
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-muted rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${h > 80 ? "bg-success" : h > 50 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${h}%` }} />
          </div>
          <span className="text-xs text-muted-foreground">{h}%</span>
        </div>
      );
    },
  },
];

export default function DepartmentDetailPage() {
  const [tab, setTab] = useState<"members" | "assets">("members");
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title={dept.name}
        description={dept.description}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Departments", href: "/departments" }, { label: dept.name }]}
        action={{ label: "Edit Department", icon: Edit, onClick: () => {} }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
              </div>
              <CardTitle className="mt-3 text-xl">{dept.name}</CardTitle>
              <CardDescription className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{dept.location}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Department Head</p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback className="text-sm bg-primary/10 text-primary">{dept.headInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{dept.head}</p>
                    <p className="text-xs text-muted-foreground">{dept.headEmail}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1"><Mail className="h-3.5 w-3.5 mr-1" />Email</Button>
                  <Button variant="outline" size="sm" className="flex-1"><Phone className="h-3.5 w-3.5 mr-1" />Call</Button>
                </div>
              </div>
              <div className="pt-3 border-t space-y-3">
                {[
                  { label: "Annual Budget", value: dept.budget, icon: DollarSign },
                  { label: "Headcount", value: `${dept.employees} employees`, icon: Users },
                  { label: "Total Assets", value: `${dept.assets} items`, icon: Box },
                  { label: "Open Tickets", value: `${dept.maintenanceOpen} requests`, icon: Wrench },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5"><m.icon className="h-3.5 w-3.5" />{m.label}</span>
                    <span className="font-semibold">{m.value}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" />Utilization</span>
                  <span className="font-semibold">{dept.utilization}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${dept.utilization > 80 ? "bg-success" : "bg-warning"}`} style={{ width: `${dept.utilization}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right — Tables */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-1 border-b">
            {(["members", "assets"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {t === "members" ? `Members (${members.length})` : `Assets (${deptAssets.length})`}
              </button>
            ))}
          </div>
          {tab === "members" ? <DataTable columns={memberCols} data={members} /> : <DataTable columns={assetCols} data={deptAssets} />}
        </div>
      </div>
    </div>
  );
}
