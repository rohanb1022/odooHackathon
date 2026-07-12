"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users, Search, Filter, Plus, LayoutGrid, List,
  ChevronRight, Shield, Mail, Building2, Box,
} from "lucide-react";
import Link from "next/link";

type Role = "Admin" | "Manager" | "Employee" | "Auditor" | "IT Staff";

type User = {
  id: string; name: string; email: string; role: Role;
  department: string; status: "Active" | "Inactive" | "On Leave";
  assets: number; initials: string; joinDate: string; phone: string;
};

const roleColors: Record<Role, string> = {
  Admin: "bg-destructive/10 text-destructive border-destructive/20",
  Manager: "bg-primary/10 text-primary border-primary/20",
  Employee: "bg-muted text-muted-foreground border-border",
  Auditor: "bg-warning/10 text-warning border-warning/20",
  "IT Staff": "bg-success/10 text-success border-success/20",
};

const statusColors = {
  Active: "bg-success/10 text-success border-success/20",
  Inactive: "bg-muted text-muted-foreground border-border",
  "On Leave": "bg-warning/10 text-warning border-warning/20",
};

const users: User[] = [
  { id: "u001", name: "Alex Kumar", email: "alex.kumar@assetflow.io", role: "Admin", department: "Engineering", status: "Active", assets: 3, initials: "AK", joinDate: "Jan 2021", phone: "+1 (555) 0192" },
  { id: "u002", name: "Sarah Jenkins", email: "sarah.j@assetflow.io", role: "Employee", department: "Engineering", status: "Active", assets: 2, initials: "SJ", joinDate: "Mar 2022", phone: "+1 (555) 0134" },
  { id: "u003", name: "Marcus Webb", email: "marcus.w@assetflow.io", role: "Manager", department: "Sales", status: "Active", assets: 2, initials: "MW", joinDate: "Jun 2020", phone: "+1 (555) 0181" },
  { id: "u004", name: "Rachel Green", email: "rachel.g@assetflow.io", role: "Manager", department: "Finance", status: "Active", assets: 1, initials: "RG", joinDate: "Nov 2019", phone: "+1 (555) 0245" },
  { id: "u005", name: "James Carter", email: "james.c@assetflow.io", role: "IT Staff", department: "IT", status: "Active", assets: 5, initials: "JC", joinDate: "Feb 2021", phone: "+1 (555) 0367" },
  { id: "u006", name: "Priya Nair", email: "priya.n@assetflow.io", role: "IT Staff", department: "IT", status: "Active", assets: 4, initials: "PN", joinDate: "Aug 2022", phone: "+1 (555) 0412" },
  { id: "u007", name: "Tom Walsh", email: "tom.w@assetflow.io", role: "Manager", department: "Marketing", status: "Active", assets: 2, initials: "TW", joinDate: "Apr 2021", phone: "+1 (555) 0523" },
  { id: "u008", name: "Elena Gilbert", email: "elena.g@assetflow.io", role: "Auditor", department: "Finance", status: "On Leave", assets: 1, initials: "EG", joinDate: "Sep 2022", phone: "+1 (555) 0618" },
  { id: "u009", name: "Mike Ross", email: "mike.r@assetflow.io", role: "Manager", department: "Legal", status: "Active", assets: 2, initials: "MR", joinDate: "Jan 2019", phone: "+1 (555) 0724" },
  { id: "u010", name: "Pam Beesly", email: "pam.b@assetflow.io", role: "Employee", department: "Human Resources", status: "Active", assets: 1, initials: "PB", joinDate: "Mar 2023", phone: "+1 (555) 0835" },
  { id: "u011", name: "Marcus Lee", email: "marcus.l@assetflow.io", role: "IT Staff", department: "IT", status: "Active", assets: 3, initials: "ML", joinDate: "Jul 2022", phone: "+1 (555) 0941" },
  { id: "u012", name: "Sophie Lane", email: "sophie.l@assetflow.io", role: "Manager", department: "Design", status: "Inactive", assets: 2, initials: "SL", joinDate: "May 2021", phone: "+1 (555) 0156" },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "All">("All");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roles: (Role | "All")[] = ["All", "Admin", "Manager", "IT Staff", "Auditor", "Employee"];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Users"
        description="Manage employee accounts, roles, permissions, and asset assignments."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Users" }]}
        action={{ label: "Invite User", icon: Plus, onClick: () => {} }}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={users.length} icon={Users} trend={{ value: 3, label: "this month" }} />
        <StatCard title="Active" value={users.filter((u) => u.status === "Active").length} icon={Shield} trend={{ value: 2, label: "this month" }} />
        <StatCard title="On Leave" value={users.filter((u) => u.status === "On Leave").length} icon={Users} description="Currently out of office" />
        <StatCard title="Total Assigned" value={users.reduce((s, u) => s + u.assets, 0)} icon={Box} trend={{ value: 5, label: "vs last month" }} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-card p-4 rounded-xl border">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, email, department..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5">
            {roles.map((r) => (
              <Button key={r} size="sm" variant={roleFilter === r ? "default" : "outline"} className="h-7 px-3 text-xs" onClick={() => setRoleFilter(r)}>{r}</Button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg ml-1">
            <Button variant={view === "grid" ? "secondary" : "ghost"} size="sm" className="h-7 px-2" onClick={() => setView("grid")}><LayoutGrid className="h-4 w-4" /></Button>
            <Button variant={view === "list" ? "secondary" : "ghost"} size="sm" className="h-7 px-2" onClick={() => setView("list")}><List className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      {view === "grid" ? (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((user) => (
            <motion.div key={user.id} variants={item}>
              <Link href={`/users/${user.id}`}>
                <Card className="hover:shadow-md transition-all group cursor-pointer h-full">
                  <CardContent className="pt-5 pb-5 flex flex-col items-center text-center">
                    <div className="relative mb-3">
                      <Avatar className="h-16 w-16 border-2 border-border">
                        <AvatarFallback className="text-lg bg-primary/10 text-primary font-semibold">{user.initials}</AvatarFallback>
                      </Avatar>
                      <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${user.status === "Active" ? "bg-success" : user.status === "On Leave" ? "bg-warning" : "bg-muted-foreground"}`} />
                    </div>
                    <h3 className="font-bold text-base group-hover:text-primary transition-colors">{user.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{user.email}</p>
                    <div className="flex gap-1.5 flex-wrap justify-center mb-3">
                      <Badge variant="outline" className={`text-[10px] ${roleColors[user.role]}`}>{user.role}</Badge>
                      <Badge variant="outline" className={`text-[10px] ${statusColors[user.status]}`}>{user.status}</Badge>
                    </div>
                    <div className="w-full pt-3 border-t grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-muted/50 rounded-lg p-2">
                        <p className="font-bold">{user.assets}</p>
                        <p className="text-xs text-muted-foreground">Assets</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2">
                        <p className="font-bold text-xs truncate">{user.department}</p>
                        <p className="text-xs text-muted-foreground">Dept</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
          {filtered.map((user) => (
            <motion.div key={user.id} variants={item}>
              <Link href={`/users/${user.id}`}>
                <Card className="hover:shadow-md transition-all group cursor-pointer">
                  <CardContent className="flex items-center gap-4 py-3.5">
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10 border">
                        <AvatarFallback className="text-sm bg-primary/10 text-primary font-semibold">{user.initials}</AvatarFallback>
                      </Avatar>
                      <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${user.status === "Active" ? "bg-success" : user.status === "On Leave" ? "bg-warning" : "bg-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors">{user.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{user.email}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground shrink-0">
                      <Badge variant="outline" className={`text-xs ${roleColors[user.role]}`}>{user.role}</Badge>
                      <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{user.department}</span>
                      <span className="flex items-center gap-1"><Box className="h-3.5 w-3.5" />{user.assets} assets</span>
                      <span className="text-xs text-muted-foreground">Since {user.joinDate}</span>
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
