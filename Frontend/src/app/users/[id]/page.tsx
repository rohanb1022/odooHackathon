"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTable } from "@/components/shared/data-table";
import {
  Mail, Phone, Building2, Calendar, Shield, Box,
  Edit, Key, Trash2, ToggleLeft, Check, X,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

const user = {
  id: "u001", name: "Alex Kumar", email: "alex.kumar@assetflow.io",
  phone: "+1 (555) 0192", role: "Admin", department: "Engineering",
  status: "Active", assets: 3, initials: "AK", joinDate: "January 15, 2021",
  manager: "— (C-Suite)", location: "Floor 2, Desk 14",
};

type AssetRow = { id: string; name: string; category: string; status: string; since: string; health: number };

const assignedAssets: AssetRow[] = [
  { id: "AST-1042", name: "MacBook Pro M3 Max", category: "Laptop", status: "In Use", since: "Jan 2021", health: 98 },
  { id: "AST-1073", name: "WD My Cloud NAS", category: "Storage", status: "In Use", since: "Mar 2022", health: 76 },
  { id: "AST-1080", name: "Logitech MX Master 3", category: "Peripheral", status: "In Use", since: "Jun 2023", health: 100 },
];

const assetCols: ColumnDef<AssetRow>[] = [
  { accessorKey: "id", header: "ID", cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.getValue("id")}</span> },
  { accessorKey: "name", header: "Asset", cell: ({ row }) => <Link href={`/assets/${row.original.id}`} className="font-semibold text-sm hover:text-primary hover:underline">{row.getValue("name")}</Link> },
  { accessorKey: "category", header: "Category" },
  {
    accessorKey: "status", header: "Status",
    cell: ({ row }) => <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{row.getValue("status")}</Badge>,
  },
  { accessorKey: "since", header: "Assigned Since" },
  {
    accessorKey: "health", header: "Health",
    cell: ({ row }) => {
      const h = row.getValue("health") as number;
      return (
        <div className="flex items-center gap-2">
          <div className="w-16 bg-muted rounded-full h-1.5">
            <div className={`h-1.5 rounded-full ${h > 80 ? "bg-success" : h > 50 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${h}%` }} />
          </div>
          <span className="text-xs">{h}%</span>
        </div>
      );
    },
  },
];

type Permission = { module: string; view: boolean; create: boolean; edit: boolean; delete: boolean };

const permissions: Permission[] = [
  { module: "Assets", view: true, create: true, edit: true, delete: true },
  { module: "Allocations", view: true, create: true, edit: true, delete: false },
  { module: "Maintenance", view: true, create: true, edit: true, delete: false },
  { module: "Audit", view: true, create: true, edit: true, delete: false },
  { module: "Departments", view: true, create: true, edit: true, delete: true },
  { module: "Users", view: true, create: true, edit: true, delete: true },
  { module: "Reports", view: true, create: true, edit: false, delete: false },
  { module: "Settings", view: true, create: false, edit: true, delete: false },
];

const PermIcon = ({ val }: { val: boolean }) =>
  val ? <Check className="h-4 w-4 text-success mx-auto" /> : <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />;

export default function UserProfilePage() {
  const [tab, setTab] = useState<"assets" | "permissions" | "activity">("assets");

  const activity = [
    { action: "Approved transfer TRF-9015", time: "2 hours ago", type: "transfer" },
    { action: "Allocated AST-1080 to Monica Bing", time: "Yesterday, 3:40 PM", type: "allocation" },
    { action: "Updated maintenance priority for MNT-4404", time: "Jul 10, 2026", type: "maintenance" },
    { action: "Completed Q3 audit verification for Engineering", time: "Jul 8, 2026", type: "audit" },
    { action: "Added new asset AST-1090 to inventory", time: "Jul 5, 2026", type: "asset" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="User Profile"
        description="View and manage employee details, assigned assets, and system permissions."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Users", href: "/users" }, { label: user.name }]}
        action={{ label: "Edit Profile", icon: Edit, onClick: () => {} }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6 pb-5 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">{user.initials}</AvatarFallback>
                </Avatar>
                <span className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-background ${user.status === "Active" ? "bg-success" : "bg-muted-foreground"}`} />
              </div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground mb-3">{user.department}</p>
              <div className="flex gap-1.5 flex-wrap justify-center mb-4">
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                  <Shield className="h-3 w-3 mr-1" />{user.role}
                </Badge>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">{user.status}</Badge>
              </div>
              <div className="flex gap-2 w-full">
                <Button variant="outline" size="sm" className="flex-1"><Mail className="h-3.5 w-3.5 mr-1" />Email</Button>
                <Button variant="outline" size="sm" className="flex-1"><Phone className="h-3.5 w-3.5 mr-1" />Call</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Contact & Info</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { icon: Mail, label: "Email", value: user.email },
                { icon: Phone, label: "Phone", value: user.phone },
                { icon: Building2, label: "Department", value: user.department },
                { icon: Calendar, label: "Joined", value: user.joinDate },
                { icon: Box, label: "Assets", value: `${user.assets} items assigned` },
              ].map((m) => (
                <div key={m.label} className="flex items-start gap-2.5">
                  <m.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="font-medium">{m.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Account Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start gap-2"><Key className="h-4 w-4" />Reset Password</Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2"><ToggleLeft className="h-4 w-4" />Deactivate Account</Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" />Remove User</Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-1 border-b">
            {(["assets", "permissions", "activity"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {t === "assets" ? `Assigned Assets (${assignedAssets.length})` : t === "permissions" ? "Permissions" : "Activity Log"}
              </button>
            ))}
          </div>

          {tab === "assets" && <DataTable columns={assetCols} data={assignedAssets} />}

          {tab === "permissions" && (
            <Card>
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2.5 px-3 font-semibold text-muted-foreground w-40">Module</th>
                        {["View", "Create", "Edit", "Delete"].map((h) => (
                          <th key={h} className="text-center py-2.5 px-4 font-semibold text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {permissions.map((p) => (
                        <tr key={p.module} className="hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 px-3 font-medium">{p.module}</td>
                          <td className="py-2.5 px-4"><PermIcon val={p.view} /></td>
                          <td className="py-2.5 px-4"><PermIcon val={p.create} /></td>
                          <td className="py-2.5 px-4"><PermIcon val={p.edit} /></td>
                          <td className="py-2.5 px-4"><PermIcon val={p.delete} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-4 p-3 bg-muted/30 rounded-lg border">
                  Permissions are inherited from the <span className="font-semibold text-primary">Admin</span> role. Individual overrides can be applied below.
                </p>
                <Button size="sm" className="mt-3"><Edit className="h-3.5 w-3.5 mr-1.5" />Edit Permissions</Button>
              </CardContent>
            </Card>
          )}

          {tab === "activity" && (
            <Card>
              <CardContent className="pt-5">
                <div className="relative border-l-2 border-muted ml-3 space-y-6">
                  {activity.map((a, i) => (
                    <div key={i} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1.5 h-3.5 w-3.5 rounded-full bg-primary/20 border-2 border-primary" />
                      <p className="text-sm font-medium">{a.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
