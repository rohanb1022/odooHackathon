"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ChartCard } from "@/components/shared/chart-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Building2, Search, Plus, Users, Box, Wrench,
  TrendingUp, ChevronRight, LayoutGrid, List, MapPin,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import Link from "next/link";

type Department = {
  id: string; name: string; head: string; headInitials: string;
  location: string; employees: number; assets: number;
  maintenanceOpen: number; budget: string; utilization: number;
  color: string;
};

const departments: Department[] = [
  { id: "dept-1", name: "Engineering", head: "Alex Kumar", headInitials: "AK", location: "Floor 2 & 3", employees: 48, assets: 124, maintenanceOpen: 3, budget: "$280,000", utilization: 87, color: "bg-primary/10 text-primary" },
  { id: "dept-2", name: "Design", head: "Sophie Lane", headInitials: "SL", location: "Floor 1, Studio", employees: 18, assets: 56, maintenanceOpen: 1, budget: "$95,000", utilization: 92, color: "bg-chart-5/10 text-chart-5" },
  { id: "dept-3", name: "Sales", head: "Marcus Webb", headInitials: "MW", location: "Floor 1, East Wing", employees: 32, assets: 88, maintenanceOpen: 2, budget: "$140,000", utilization: 78, color: "bg-success/10 text-success" },
  { id: "dept-4", name: "Finance", head: "Rachel Green", headInitials: "RG", location: "Floor 4", employees: 14, assets: 42, maintenanceOpen: 0, budget: "$60,000", utilization: 65, color: "bg-warning/10 text-warning" },
  { id: "dept-5", name: "Marketing", head: "Tom Walsh", headInitials: "TW", location: "Floor 1, West Wing", employees: 22, assets: 63, maintenanceOpen: 2, budget: "$110,000", utilization: 74, color: "bg-chart-4/10 text-chart-4" },
  { id: "dept-6", name: "Legal", head: "Mike Ross", headInitials: "MR", location: "Floor 5", employees: 9, assets: 28, maintenanceOpen: 0, budget: "$45,000", utilization: 58, color: "bg-destructive/10 text-destructive" },
  { id: "dept-7", name: "IT", head: "James Carter", headInitials: "JC", location: "Basement B1", employees: 11, assets: 210, maintenanceOpen: 5, budget: "$320,000", utilization: 95, color: "bg-primary/10 text-primary" },
  { id: "dept-8", name: "Human Resources", head: "Pam Beesly", headInitials: "PB", location: "Floor 3, North", employees: 8, assets: 22, maintenanceOpen: 0, budget: "$35,000", utilization: 60, color: "bg-success/10 text-success" },
];

const budgetData = departments.map((d) => ({
  name: d.name.length > 6 ? d.name.slice(0, 6) + "." : d.name,
  assets: d.assets,
  employees: d.employees,
}));

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function DepartmentsPage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = departments.filter(
    (d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.head.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Departments"
        description="Manage organizational units, their assets, headcount, and resource utilization."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Departments" }]}
        action={{ label: "Add Department", icon: Plus, onClick: () => {} }}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Departments" value={departments.length} icon={Building2} trend={{ value: 1, label: "vs last quarter" }} />
        <StatCard title="Total Employees" value={departments.reduce((s, d) => s + d.employees, 0)} icon={Users} trend={{ value: 6, label: "vs last month" }} />
        <StatCard title="Total Assets" value={departments.reduce((s, d) => s + d.assets, 0)} icon={Box} trend={{ value: 12, label: "vs last month" }} />
        <StatCard title="Open Maintenance" value={departments.reduce((s, d) => s + d.maintenanceOpen, 0)} icon={Wrench} trend={{ value: -2, label: "vs last week" }} trendUpIsGood={false} />
      </div>

      <ChartCard title="Assets & Headcount by Department" description="Comparative view across all departments">
        <div className="h-[240px] mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={budgetData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-card)" }} />
              <Bar dataKey="assets" name="Assets" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="employees" name="Employees" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search departments..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          <Button variant={view === "grid" ? "secondary" : "ghost"} size="sm" className="h-7 px-2" onClick={() => setView("grid")}>
            <LayoutGrid className="h-4 w-4 mr-1" /> Grid
          </Button>
          <Button variant={view === "list" ? "secondary" : "ghost"} size="sm" className="h-7 px-2" onClick={() => setView("list")}>
            <List className="h-4 w-4 mr-1" /> List
          </Button>
        </div>
      </div>

      {view === "grid" ? (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((dept) => (
            <motion.div key={dept.id} variants={item}>
              <Link href={`/departments/${dept.id}`}>
                <Card className="hover:shadow-md transition-all group cursor-pointer h-full">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${dept.color}`}>
                        <Building2 className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className={`text-xs ${dept.maintenanceOpen > 0 ? "border-warning/30 text-warning bg-warning/5" : "border-success/30 text-success bg-success/5"}`}>
                        {dept.maintenanceOpen > 0 ? `${dept.maintenanceOpen} open tickets` : "All clear"}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{dept.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 mb-4">
                      <MapPin className="h-3 w-3" /> {dept.location}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div className="bg-muted/50 rounded-lg p-2 text-center">
                        <p className="font-bold text-lg">{dept.employees}</p>
                        <p className="text-xs text-muted-foreground">Employees</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2 text-center">
                        <p className="font-bold text-lg">{dept.assets}</p>
                        <p className="text-xs text-muted-foreground">Assets</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Utilization</span>
                        <span className="font-semibold">{dept.utilization}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all ${dept.utilization > 80 ? "bg-success" : dept.utilization > 60 ? "bg-warning" : "bg-muted-foreground"}`} style={{ width: `${dept.utilization}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{dept.headInitials}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{dept.head}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
          {filtered.map((dept) => (
            <motion.div key={dept.id} variants={item}>
              <Link href={`/departments/${dept.id}`}>
                <Card className="hover:shadow-md transition-all group cursor-pointer">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${dept.color}`}>
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{dept.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{dept.location}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground shrink-0">
                      <span><span className="font-semibold text-foreground">{dept.employees}</span> employees</span>
                      <span><span className="font-semibold text-foreground">{dept.assets}</span> assets</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${dept.utilization > 80 ? "bg-success" : "bg-warning"}`} style={{ width: `${dept.utilization}%` }} />
                        </div>
                        <span className="text-xs">{dept.utilization}%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-6 w-6"><AvatarFallback className="text-[10px] bg-primary/10 text-primary">{dept.headInitials}</AvatarFallback></Avatar>
                        <span className="text-sm">{dept.head}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
