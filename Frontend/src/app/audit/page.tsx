"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ChartCard } from "@/components/shared/chart-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ShieldCheck, Search, Filter, Plus, QrCode, AlertTriangle,
  CheckCircle2, XCircle, Clock, Download, FileText, Eye,
  Camera, MapPin, Package, RefreshCw, ChevronRight, BarChart3,
} from "lucide-react";
import {
  RadialBarChart, RadialBar, Cell, ResponsiveContainer,
  PieChart, Pie, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

type AuditStatus = "Verified" | "Missing" | "Damaged" | "Pending";

type AuditItem = {
  id: string; assetId: string; name: string; category: string;
  location: string; department: string; status: AuditStatus;
  lastSeen: string; assignee: string; notes: string;
};

const mockAuditItems: AuditItem[] = [
  { id: "1", assetId: "AST-1042", name: "MacBook Pro M3 Max", category: "Laptop", location: "Eng Floor 2, Desk 14", department: "Engineering", status: "Verified", lastSeen: "Jul 12, 2026", assignee: "Sarah Jenkins", notes: "" },
  { id: "2", assetId: "AST-1043", name: 'Dell UltraSharp 32"', category: "Monitor", location: "Design Studio, Bay 3", department: "Design", status: "Verified", lastSeen: "Jul 12, 2026", assignee: "Tom Walsh", notes: "" },
  { id: "3", assetId: "AST-1044", name: "Herman Miller Aeron", category: "Furniture", location: "Legal, Office 201", department: "Legal", status: "Missing", lastSeen: "Jul 8, 2026", assignee: "Mike Ross", notes: "Not found at registered location. Possibly moved to storage." },
  { id: "4", assetId: "AST-1045", name: "iPad Pro 12.9", category: "Tablet", location: "Sales, Locker 7", department: "Sales", status: "Damaged", lastSeen: "Jul 10, 2026", assignee: "Elena Gilbert", notes: "Cracked screen. Requires repair before reuse." },
  { id: "5", assetId: "AST-1046", name: "Lenovo ThinkPad X1", category: "Laptop", location: "IT Storage Room", department: "IT", status: "Pending", lastSeen: "Jul 11, 2026", assignee: "Unassigned", notes: "" },
  { id: "6", assetId: "AST-1051", name: "HP ProBook 450", category: "Laptop", location: "Finance, Desk 8", department: "Finance", status: "Verified", lastSeen: "Jul 12, 2026", assignee: "Rachel Green", notes: "" },
  { id: "7", assetId: "AST-1055", name: "Mac Studio M2 Ultra", category: "Desktop", location: "Eng Floor 1, Studio", department: "Engineering", status: "Damaged", lastSeen: "Jul 9, 2026", assignee: "Ross Geller", notes: "SSD failure. Sent for repair." },
  { id: "8", assetId: "AST-1060", name: "Dell Inspiron 15", category: "Laptop", location: "Marketing, Pod B", department: "Marketing", status: "Missing", lastSeen: "Jul 7, 2026", assignee: "Monica Bing", notes: "Last seen before office relocation." },
  { id: "9", assetId: "AST-1062", name: "Surface Pro 9", category: "Tablet", location: "Sales, Desk 3", department: "Sales", status: "Verified", lastSeen: "Jul 12, 2026", assignee: "Joey Tribbiani", notes: "" },
  { id: "10", assetId: "AST-1070", name: "Cisco IP Phone 8841", category: "Phone", location: "Reception, Desk 1", department: "Admin", status: "Pending", lastSeen: "Jul 11, 2026", assignee: "Pam Beesly", notes: "" },
];

const auditProgress = 62;
const departmentData = [
  { dept: "Engineering", total: 45, verified: 40 },
  { dept: "Sales", total: 38, verified: 28 },
  { dept: "Design", total: 22, verified: 20 },
  { dept: "Finance", total: 30, verified: 25 },
  { dept: "Marketing", total: 27, verified: 18 },
];

const statusColorMap: Record<AuditStatus, string> = {
  Verified: "bg-success/10 text-success border-success/20",
  Missing: "bg-destructive/10 text-destructive border-destructive/20",
  Damaged: "bg-warning/10 text-warning border-warning/20",
  Pending: "bg-muted text-muted-foreground border-border",
};

const statusIconMap: Record<AuditStatus, React.ElementType> = {
  Verified: CheckCircle2, Missing: XCircle, Damaged: AlertTriangle, Pending: Clock,
};

const pieData = [
  { name: "Verified", value: 5, fill: "var(--color-success)" },
  { name: "Pending", value: 2, fill: "var(--color-warning)" },
  { name: "Missing", value: 2, fill: "var(--color-destructive)" },
  { name: "Damaged", value: 1, fill: "var(--color-warning)" },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export default function AuditPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<AuditStatus | "All">("All");
  const [selectedItem, setSelectedItem] = useState<AuditItem | null>(null);
  const [qrOpen, setQrOpen] = useState(false);

  const filtered = mockAuditItems.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.assetId.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "All" || a.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const counts = {
    All: mockAuditItems.length,
    Verified: mockAuditItems.filter((a) => a.status === "Verified").length,
    Pending: mockAuditItems.filter((a) => a.status === "Pending").length,
    Missing: mockAuditItems.filter((a) => a.status === "Missing").length,
    Damaged: mockAuditItems.filter((a) => a.status === "Damaged").length,
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Audit"
        description="Conduct physical asset verification, track missing items, and generate audit reports."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Audit" }]}
        action={{ label: "New Audit Cycle", icon: Plus, onClick: () => {} }}
      />

      {/* Audit Progress Banner */}
      <Card className="bg-primary/5 border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Q3 2026 Audit Cycle — In Progress</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Cycle started Jul 1, 2026. Target completion: Jul 31, 2026. 3 auditors assigned.</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold text-primary">{auditProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="h-2 rounded-full bg-primary transition-all duration-700" style={{ width: `${auditProgress}%` }} />
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">62 / 100 assets verified</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setQrOpen(true)}>
                <QrCode className="h-4 w-4 mr-1" /> Scan QR
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-1" /> Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Verified" value={counts.Verified} icon={CheckCircle2} trend={{ value: 8, label: "this cycle" }} />
        <StatCard title="Pending Verification" value={counts.Pending} icon={Clock} trend={{ value: -4, label: "vs last cycle" }} trendUpIsGood={false} />
        <StatCard title="Missing Assets" value={counts.Missing} icon={XCircle} trend={{ value: 2, label: "vs last cycle" }} trendUpIsGood={false} />
        <StatCard title="Damaged Assets" value={counts.Damaged} icon={AlertTriangle} trend={{ value: 1, label: "vs last cycle" }} trendUpIsGood={false} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Audit Status Breakdown" description="Current cycle distribution" className="lg:col-span-1">
          <div className="h-[200px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-card)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: d.fill }} />
                <span className="text-muted-foreground">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Department Progress" description="Assets verified per department" className="lg:col-span-2">
          <div className="h-[220px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <YAxis dataKey="dept" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} width={70} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-card)" }} />
                <Bar dataKey="total" name="Total" fill="var(--color-muted)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="verified" name="Verified" fill="var(--color-success)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-card p-4 rounded-xl border">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search assets..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["All", "Verified", "Pending", "Missing", "Damaged"] as const).map((f) => (
            <Button
              key={f} size="sm" variant={activeFilter === f ? "default" : "outline"}
              className={`h-7 px-3 text-xs ${activeFilter === f ? "" : "text-muted-foreground"}`}
              onClick={() => setActiveFilter(f)}
            >
              {f} <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 h-4 text-[10px] rounded-full">{counts[f as keyof typeof counts]}</Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Asset List */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
        {filtered.map((a) => {
          const StatusIcon = statusIconMap[a.status];
          return (
            <motion.div key={a.id} variants={item}>
              <Card className="hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelectedItem(a)}>
                <CardContent className="flex items-center gap-4 py-3.5">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${a.status === "Verified" ? "bg-success/10" : a.status === "Missing" ? "bg-destructive/10" : a.status === "Damaged" ? "bg-warning/10" : "bg-muted"}`}>
                    <StatusIcon className={`h-4 w-4 ${a.status === "Verified" ? "text-success" : a.status === "Missing" ? "text-destructive" : a.status === "Damaged" ? "text-warning" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{a.name}</span>
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${statusColorMap[a.status]}`}>{a.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.assetId} · {a.category} · {a.department}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-6 text-xs text-muted-foreground shrink-0">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Last seen {a.lastSeen}</span>
                    <ChevronRight className="h-4 w-4 group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Detail Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="sm:max-w-[540px]">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={statusColorMap[selectedItem.status]}>{selectedItem.status}</Badge>
                <span className="text-xs text-muted-foreground font-mono">{selectedItem.assetId}</span>
              </div>
              <DialogTitle>{selectedItem.name}</DialogTitle>
              <DialogDescription>{selectedItem.category} · {selectedItem.department}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { icon: MapPin, label: "Location", value: selectedItem.location },
                  { icon: Package, label: "Assignee", value: selectedItem.assignee },
                  { icon: Clock, label: "Last Seen", value: selectedItem.lastSeen },
                  { icon: ShieldCheck, label: "Audit Status", value: selectedItem.status },
                ].map((m) => (
                  <div key={m.label} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg border">
                    <m.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <p className="font-medium text-sm">{m.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {selectedItem.notes && (
                <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg text-sm text-muted-foreground">
                  <p className="font-medium text-warning mb-1 text-xs">Auditor Notes</p>
                  {selectedItem.notes}
                </div>
              )}
              {/* QR Placeholder */}
              <div className="border border-dashed rounded-xl p-6 flex flex-col items-center gap-3 bg-muted/20">
                <QrCode className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">Scan the asset QR code to verify its physical presence and update status instantly.</p>
                <Button variant="outline" size="sm"><Camera className="h-4 w-4 mr-1" /> Open Scanner</Button>
              </div>
              {/* Image upload placeholder */}
              <div className="border border-dashed rounded-xl p-4 flex items-center justify-center gap-2 bg-muted/10 text-muted-foreground text-sm cursor-pointer hover:bg-muted/20 transition-colors">
                <Camera className="h-4 w-4" />
                <span>Attach damage photo or documentation</span>
              </div>
            </div>
            <DialogFooter className="pt-3 border-t gap-2">
              <Button variant="outline" onClick={() => setSelectedItem(null)}>Close</Button>
              {selectedItem.status !== "Verified" && (
                <Button className="bg-success hover:bg-success/90 text-white" onClick={() => setSelectedItem(null)}>
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Verified
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* QR Scan Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>QR Code Scanner</DialogTitle>
            <DialogDescription>Point your camera at an asset QR code to verify it instantly.</DialogDescription>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center gap-4">
            <div className="w-56 h-56 border-2 border-dashed border-primary/40 rounded-2xl bg-muted/20 flex items-center justify-center relative">
              <QrCode className="h-16 w-16 text-muted-foreground/40" />
              <div className="absolute inset-4 border-2 border-primary/20 rounded-xl" />
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-md" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-md" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-md" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-md" />
            </div>
            <p className="text-sm text-muted-foreground text-center">Camera access required. QR scanning simulated in this demo.</p>
            <Button className="w-full" onClick={() => setQrOpen(false)}><RefreshCw className="h-4 w-4 mr-2" /> Simulate Scan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
