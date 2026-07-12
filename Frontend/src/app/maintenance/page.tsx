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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  LayoutGrid,
  List,
  ChevronRight,
  Calendar,
  User,
  Tag,
  Lightbulb,
  MoreHorizontal,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";

type Priority = "Critical" | "High" | "Medium" | "Low";
type Status = "Open" | "In Progress" | "Resolved" | "Pending Parts";

type MaintenanceRequest = {
  id: string;
  title: string;
  asset: string;
  assetId: string;
  priority: Priority;
  status: Status;
  technician: string;
  technicianInitials: string;
  department: string;
  createdAt: string;
  dueDate: string;
  description: string;
};

const mockRequests: MaintenanceRequest[] = [
  {
    id: "MNT-4401",
    title: "Battery replacement required",
    asset: "MacBook Pro M3 Max",
    assetId: "AST-1042",
    priority: "High",
    status: "In Progress",
    technician: "James Carter",
    technicianInitials: "JC",
    department: "Engineering",
    createdAt: "Jul 8, 2026",
    dueDate: "Jul 14, 2026",
    description: "Battery health at 43%. Device shuts off unexpectedly. Replacement authorized.",
  },
  {
    id: "MNT-4402",
    title: "Screen flickering issue",
    asset: "Dell UltraSharp 32\"",
    assetId: "AST-1043",
    priority: "Medium",
    status: "Open",
    technician: "Priya Nair",
    technicianInitials: "PN",
    department: "Design",
    createdAt: "Jul 9, 2026",
    dueDate: "Jul 16, 2026",
    description: "Monitor flickers when connected via DisplayPort. Possible cable or port issue.",
  },
  {
    id: "MNT-4403",
    title: "Keyboard unresponsive keys",
    asset: "Lenovo ThinkPad X1",
    assetId: "AST-1046",
    priority: "Low",
    status: "Open",
    technician: "Marcus Lee",
    technicianInitials: "ML",
    department: "Finance",
    createdAt: "Jul 10, 2026",
    dueDate: "Jul 20, 2026",
    description: "Keys B, N and space bar intermittently unresponsive. Cleaning attempt failed.",
  },
  {
    id: "MNT-4404",
    title: "Cooling fan loud noise",
    asset: "HP ProBook 450",
    assetId: "AST-1051",
    priority: "Critical",
    status: "Pending Parts",
    technician: "James Carter",
    technicianInitials: "JC",
    department: "IT",
    createdAt: "Jul 7, 2026",
    dueDate: "Jul 12, 2026",
    description: "Bearing failure in cooling fan. Device overheating. Awaiting fan module from supplier.",
  },
  {
    id: "MNT-4405",
    title: "SSD failure diagnosis",
    asset: "Mac Studio M2 Ultra",
    assetId: "AST-1055",
    priority: "Critical",
    status: "In Progress",
    technician: "Priya Nair",
    technicianInitials: "PN",
    department: "Engineering",
    createdAt: "Jul 10, 2026",
    dueDate: "Jul 13, 2026",
    description: "SMART diagnostics show reallocated sectors. Data backup in progress before replacement.",
  },
  {
    id: "MNT-4406",
    title: "AC adapter replacement",
    asset: "Dell Inspiron 15",
    assetId: "AST-1060",
    priority: "Medium",
    status: "Resolved",
    technician: "Marcus Lee",
    technicianInitials: "ML",
    department: "Marketing",
    createdAt: "Jul 5, 2026",
    dueDate: "Jul 10, 2026",
    description: "Adapter not charging. Replaced with OEM part. Verified charging at 90W.",
  },
  {
    id: "MNT-4407",
    title: "Touchpad calibration",
    asset: "Surface Pro 9",
    assetId: "AST-1062",
    priority: "Low",
    status: "Resolved",
    technician: "Marcus Lee",
    technicianInitials: "ML",
    department: "Sales",
    createdAt: "Jul 6, 2026",
    dueDate: "Jul 11, 2026",
    description: "Touchpad cursor drift issue resolved through driver update and firmware flash.",
  },
];

const trendData = [
  { month: "Feb", open: 8, resolved: 12 },
  { month: "Mar", open: 14, resolved: 10 },
  { month: "Apr", open: 9, resolved: 15 },
  { month: "May", open: 11, resolved: 13 },
  { month: "Jun", open: 6, resolved: 18 },
  { month: "Jul", open: 5, resolved: 7 },
];

const priorityColors: Record<Priority, string> = {
  Critical: "bg-destructive/10 text-destructive border-destructive/20",
  High: "bg-warning/10 text-warning border-warning/20",
  Medium: "bg-primary/10 text-primary border-primary/20",
  Low: "bg-muted text-muted-foreground border-border",
};

const statusColors: Record<Status, string> = {
  "Open": "bg-warning/10 text-warning border-warning/20",
  "In Progress": "bg-primary/10 text-primary border-primary/20",
  "Resolved": "bg-success/10 text-success border-success/20",
  "Pending Parts": "bg-destructive/10 text-destructive border-destructive/20",
};

const kanbanCols: { id: Status; label: string; color: string }[] = [
  { id: "Open", label: "Open", color: "border-warning" },
  { id: "In Progress", label: "In Progress", color: "border-primary" },
  { id: "Pending Parts", label: "Pending Parts", color: "border-destructive" },
  { id: "Resolved", label: "Resolved", color: "border-success" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function MaintenancePage() {
  const [view, setView] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<MaintenanceRequest | null>(null);

  const filtered = mockRequests.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.asset.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { title: "Open Requests", value: mockRequests.filter((r) => r.status === "Open").length, icon: Clock, trend: { value: -3, label: "vs last week" }, trendUpIsGood: false },
    { title: "In Progress", value: mockRequests.filter((r) => r.status === "In Progress").length, icon: Wrench, trend: { value: 2, label: "vs last week" } },
    { title: "Pending Parts", value: mockRequests.filter((r) => r.status === "Pending Parts").length, icon: AlertTriangle, trend: { value: 1, label: "vs last week" }, trendUpIsGood: false },
    { title: "Resolved (30d)", value: mockRequests.filter((r) => r.status === "Resolved").length, icon: CheckCircle2, trend: { value: 18, label: "vs last month" } },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Maintenance"
        description="Track, assign, and resolve maintenance requests across all enterprise assets."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Maintenance" }]}
        action={{ label: "New Request", icon: Plus, onClick: () => setNewOpen(true) }}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.title} {...s} />
        ))}
      </div>

      {/* AI Insight */}
      <Card className="bg-primary/5 border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <CardContent className="flex items-start gap-4 pt-5 pb-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-primary mb-1">AI Maintenance Analysis</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              2 critical requests (MNT-4404, MNT-4405) are overdue or near SLA breach. Technician James Carter has 3 active assignments — redistributing MNT-4402 to Priya Nair is recommended to balance workload and reduce mean time to resolution by ~22%.
            </p>
          </div>
          <Button size="sm" variant="default" className="shrink-0">
            Apply Suggestion
          </Button>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, asset, or ID..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <Button variant={view === "list" ? "secondary" : "ghost"} size="sm" className="h-7 px-2" onClick={() => setView("list")}>
            <List className="h-4 w-4 mr-1" /> List
          </Button>
          <Button variant={view === "kanban" ? "secondary" : "ghost"} size="sm" className="h-7 px-2" onClick={() => setView("kanban")}>
            <LayoutGrid className="h-4 w-4 mr-1" /> Kanban
          </Button>
        </div>
      </div>

      {/* Views */}
      {view === "list" ? (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {filtered.map((req) => (
            <motion.div key={req.id} variants={item}>
              <Card
                className="hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setSelectedReq(req)}
              >
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs text-muted-foreground font-mono">{req.id}</span>
                      <Badge variant="outline" className={priorityColors[req.priority]}>{req.priority}</Badge>
                      <Badge variant="outline" className={statusColors[req.status]}>{req.status}</Badge>
                    </div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors truncate">{req.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 truncate">{req.asset} · {req.department}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{req.technicianInitials}</AvatarFallback>
                      </Avatar>
                      <span>{req.technician}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Due {req.dueDate}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {kanbanCols.map((col) => {
            const colCards = filtered.filter((r) => r.status === col.id);
            return (
              <div key={col.id} className={`rounded-xl border-t-4 ${col.color} bg-card border border-border overflow-hidden`}>
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <span className="font-semibold text-sm">{col.label}</span>
                  <Badge variant="secondary" className="rounded-full px-2 py-0 h-5 text-xs">{colCards.length}</Badge>
                </div>
                <div className="p-3 space-y-3">
                  {colCards.map((req) => (
                    <motion.div
                      key={req.id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-background rounded-lg border p-3 cursor-pointer hover:shadow-sm transition-all"
                      onClick={() => setSelectedReq(req)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant="outline" className={`text-[10px] ${priorityColors[req.priority]}`}>{req.priority}</Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">{req.id}</span>
                      </div>
                      <p className="text-sm font-medium leading-snug mb-1">{req.title}</p>
                      <p className="text-xs text-muted-foreground mb-3 truncate">{req.asset}</p>
                      <div className="flex items-center justify-between">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{req.technicianInitials}</AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Calendar className="h-3 w-3" /> {req.dueDate}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  {colCards.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-6 border border-dashed rounded-lg">No requests</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trend Chart */}
      <ChartCard title="Maintenance Trend" description="Open vs resolved requests over the last 6 months">
        <div className="h-[240px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-card)" }} />
              <Bar dataKey="open" name="Open" fill="var(--color-warning)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Detail Dialog */}
      {selectedReq && (
        <Dialog open={!!selectedReq} onOpenChange={() => setSelectedReq(null)}>
          <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={priorityColors[selectedReq.priority]}>{selectedReq.priority}</Badge>
                <Badge variant="outline" className={statusColors[selectedReq.status]}>{selectedReq.status}</Badge>
                <span className="text-xs text-muted-foreground font-mono">{selectedReq.id}</span>
              </div>
              <DialogTitle className="mt-2">{selectedReq.title}</DialogTitle>
              <DialogDescription>{selectedReq.asset} · {selectedReq.department}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-2">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { icon: Tag, label: "Asset ID", value: selectedReq.assetId },
                  { icon: User, label: "Technician", value: selectedReq.technician },
                  { icon: Calendar, label: "Created", value: selectedReq.createdAt },
                  { icon: Clock, label: "Due Date", value: selectedReq.dueDate },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
                    <m.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <p className="font-medium">{m.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <p className="text-sm font-semibold mb-2">Description</p>
                <p className="text-sm text-muted-foreground leading-relaxed border rounded-lg p-3 bg-muted/30">{selectedReq.description}</p>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-sm font-semibold mb-3">Technician Timeline</p>
                <div className="relative border-l-2 border-muted ml-3 space-y-6">
                  {[
                    { action: "Request submitted", date: selectedReq.createdAt, user: "System", done: true },
                    { action: "Assigned to technician", date: selectedReq.createdAt, user: selectedReq.technician, done: true },
                    { action: "Diagnosis in progress", date: "In progress", user: selectedReq.technician, done: selectedReq.status !== "Open" },
                    { action: "Resolution & close", date: selectedReq.status === "Resolved" ? selectedReq.dueDate : "Pending", user: selectedReq.technician, done: selectedReq.status === "Resolved" },
                  ].map((ev, i) => (
                    <div key={i} className={`relative pl-6 ${!ev.done ? "opacity-50" : ""}`}>
                      <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-background flex items-center justify-center ${ev.done ? "bg-success" : "bg-muted-foreground"}`}>
                        {ev.done && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <p className="text-sm font-medium">{ev.action}</p>
                      <p className="text-xs text-muted-foreground">{ev.date} · {ev.user}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolution Notes */}
              {selectedReq.status === "Resolved" && (
                <div>
                  <p className="text-sm font-semibold mb-2">Resolution Notes</p>
                  <div className="p-3 bg-success/5 border border-success/20 rounded-lg text-sm text-muted-foreground">
                    Issue resolved successfully. Device tested and returned to user. No further action required.
                  </div>
                </div>
              )}

              {/* Comments */}
              <div>
                <p className="text-sm font-semibold mb-3">Comments</p>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">{selectedReq.technicianInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted/50 rounded-lg p-3 border text-sm">
                      <p className="font-medium text-xs mb-1">{selectedReq.technician} <span className="text-muted-foreground font-normal">· {selectedReq.createdAt}</span></p>
                      <p className="text-muted-foreground">Picked up the device. Running diagnostics now. Will update shortly.</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Input placeholder="Add a comment..." className="flex-1" />
                  <Button size="sm">Post</Button>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedReq(null)}>Close</Button>
              <Link href={`/maintenance/${selectedReq.id}`}>
                <Button>
                  View Full Details <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* New Request Dialog */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>New Maintenance Request</DialogTitle>
            <DialogDescription>Submit a new maintenance request for an asset.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Asset</Label>
              <Input placeholder="Search asset by name or ID..." />
            </div>
            <div className="space-y-2">
              <Label>Issue Title</Label>
              <Input placeholder="Briefly describe the issue..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Priority</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Assign Technician</Label>
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                  <option>James Carter</option>
                  <option>Priya Nair</option>
                  <option>Marcus Lee</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                placeholder="Detailed description of the issue..."
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input type="date" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button onClick={() => setNewOpen(false)}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
