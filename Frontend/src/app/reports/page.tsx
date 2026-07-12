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
  FileBarChart, Download, FileText, Calendar, Filter,
  TrendingUp, Box, Wrench, Building2, Users,
  ArrowUpRight, Clock, CheckCircle2, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";

const assetGrowthData = [
  { month: "Jan", total: 2100, added: 45, retired: 8 },
  { month: "Feb", total: 2140, added: 52, retired: 12 },
  { month: "Mar", total: 2198, added: 67, retired: 9 },
  { month: "Apr", total: 2260, added: 71, retired: 9 },
  { month: "May", total: 2330, added: 80, retired: 10 },
  { month: "Jun", total: 2400, added: 88, retired: 18 },
  { month: "Jul", total: 2543, added: 158, retired: 15 },
];

const maintenanceData = [
  { month: "Jan", open: 8, resolved: 22, avgDays: 3.2 },
  { month: "Feb", open: 14, resolved: 18, avgDays: 4.1 },
  { month: "Mar", open: 9, resolved: 25, avgDays: 2.8 },
  { month: "Apr", open: 11, resolved: 20, avgDays: 3.5 },
  { month: "May", open: 6, resolved: 28, avgDays: 2.1 },
  { month: "Jun", open: 5, resolved: 30, avgDays: 1.9 },
  { month: "Jul", open: 13, resolved: 14, avgDays: 2.4 },
];

const deptUtilData = [
  { dept: "Engineering", utilization: 87, assets: 124 },
  { dept: "IT", utilization: 95, assets: 210 },
  { dept: "Sales", utilization: 78, assets: 88 },
  { dept: "Marketing", utilization: 74, assets: 63 },
  { dept: "Design", utilization: 92, assets: 56 },
  { dept: "Finance", utilization: 65, assets: 42 },
];

type ReportDef = {
  id: string; title: string; description: string; category: string;
  lastGenerated: string; format: string; icon: React.ElementType; color: string;
};

const reportCatalog: ReportDef[] = [
  { id: "r1", title: "Executive Asset Summary", description: "High-level overview of total assets, utilization, and health KPIs for leadership.", category: "Executive", lastGenerated: "Jul 12, 2026", format: "PDF", icon: TrendingUp, color: "bg-primary/10 text-primary" },
  { id: "r2", title: "Full Asset Inventory", description: "Complete listing of all assets with status, assignee, health, and location.", category: "Assets", lastGenerated: "Jul 11, 2026", format: "CSV", icon: Box, color: "bg-chart-4/10 text-chart-4" },
  { id: "r3", title: "Asset Depreciation Report", description: "Asset value over time with depreciation schedules and book value calculations.", category: "Assets", lastGenerated: "Jul 10, 2026", format: "XLSX", icon: FileBarChart, color: "bg-warning/10 text-warning" },
  { id: "r4", title: "Maintenance History Report", description: "All maintenance requests, resolution times, costs, and technician performance.", category: "Maintenance", lastGenerated: "Jul 12, 2026", format: "PDF", icon: Wrench, color: "bg-destructive/10 text-destructive" },
  { id: "r5", title: "SLA & Resolution Times", description: "Maintenance SLA compliance rates and mean time to resolution by priority.", category: "Maintenance", lastGenerated: "Jul 9, 2026", format: "PDF", icon: Clock, color: "bg-warning/10 text-warning" },
  { id: "r6", title: "Department Asset Allocation", description: "Assets distributed across departments with utilization and cost breakdown.", category: "Departments", lastGenerated: "Jul 11, 2026", format: "XLSX", icon: Building2, color: "bg-success/10 text-success" },
  { id: "r7", title: "Compliance & Audit Report", description: "Audit cycle results, missing asset records, and compliance status.", category: "Audit", lastGenerated: "Jul 8, 2026", format: "PDF", icon: CheckCircle2, color: "bg-primary/10 text-primary" },
  { id: "r8", title: "User Activity Report", description: "Employee interactions with assets including allocations, transfers, and returns.", category: "Users", lastGenerated: "Jul 10, 2026", format: "CSV", icon: Users, color: "bg-chart-5/10 text-chart-5" },
];

const categories = ["All", "Executive", "Assets", "Maintenance", "Departments", "Audit", "Users"];
const formatColor: Record<string, string> = {
  PDF: "bg-destructive/10 text-destructive border-destructive/20",
  CSV: "bg-success/10 text-success border-success/20",
  XLSX: "bg-warning/10 text-warning border-warning/20",
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export default function ReportsPage() {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);

  const filtered = reportCatalog.filter((r) => {
    const matchCat = categoryFilter === "All" || r.category === categoryFilter;
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleGenerate = (id: string) => {
    setGenerating(id);
    setTimeout(() => setGenerating(null), 1800);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Reports"
        description="Generate, schedule, and export comprehensive reports across all modules."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Reports" }]}
        action={{ label: "Schedule Report", icon: Calendar, onClick: () => {} }}
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Assets" value="2,543" icon={Box} trend={{ value: 6.2, label: "vs last quarter" }} />
        <StatCard title="Avg Utilization" value="82%" icon={TrendingUp} trend={{ value: 4, label: "vs last quarter" }} />
        <StatCard title="Resolved (30d)" value="112" icon={CheckCircle2} trend={{ value: 18, label: "vs prev 30d" }} />
        <StatCard title="Reports Generated" value="48" icon={FileBarChart} trend={{ value: 12, label: "this month" }} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Asset Growth" description="Total inventory trend with additions and retirements">
          <div className="h-[220px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={assetGrowthData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="repGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} domain={[2000, 2600]} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-card)" }} />
                <Area type="monotone" dataKey="total" name="Total Assets" stroke="var(--color-primary)" strokeWidth={2} fill="url(#repGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Maintenance Overview" description="Open vs resolved tickets with avg resolution days">
          <div className="h-[220px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={maintenanceData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-card)" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="resolved" name="Resolved" stroke="var(--color-success)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="open" name="Open" stroke="var(--color-warning)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Department Utilization" description="Asset utilization rate across all departments">
        <div className="h-[200px] mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptUtilData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} domain={[0, 100]} unit="%" />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-card)" }} />
              <Bar dataKey="utilization" name="Utilization %" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Report catalog */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-card p-4 rounded-xl border">
          <div className="relative w-full sm:w-64">
            <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reports..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <Button key={c} size="sm" variant={categoryFilter === c ? "default" : "outline"} className="h-7 px-3 text-xs" onClick={() => setCategoryFilter(c)}>{c}</Button>
            ))}
          </div>
        </div>

        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((report) => (
            <motion.div key={report.id} variants={item}>
              <Card className="hover:shadow-md transition-all group h-full flex flex-col">
                <CardContent className="pt-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${report.color}`}>
                      <report.icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${formatColor[report.format]}`}>{report.format}</Badge>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{report.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">{report.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />Last: {report.lastGenerated}
                    </span>
                    <div className="flex gap-1.5">
                      <Button
                        size="sm" variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => handleGenerate(report.id)}
                        disabled={generating === report.id}
                      >
                        {generating === report.id
                          ? <><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Generating...</>
                          : <><ArrowUpRight className="h-3 w-3 mr-1" />Generate</>
                        }
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
