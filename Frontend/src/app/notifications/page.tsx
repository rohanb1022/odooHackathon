"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bell, CheckCheck, Trash2, Filter, Settings,
  ArrowRightLeft, Wrench, ShieldCheck, Box,
  AlertTriangle, Info, CheckCircle2, Clock,
  ChevronRight, MoreHorizontal, Archive,
} from "lucide-react";

type Priority = "critical" | "high" | "medium" | "low";
type NotifType = "transfer" | "maintenance" | "audit" | "asset" | "system" | "alert";

type Notification = {
  id: string;
  title: string;
  description: string;
  type: NotifType;
  priority: Priority;
  time: string;
  read: boolean;
  group: string;
  actor?: string;
  actorInitials?: string;
  actionLabel?: string;
  actionHref?: string;
};

const allNotifications: Notification[] = [
  {
    id: "n01", title: "Transfer Request Approved",
    description: "Your transfer request TRF-9015 for Herman Miller Aeron has been approved by Michael Scott.",
    type: "transfer", priority: "high", time: "2 minutes ago", read: false,
    group: "Today", actor: "Michael Scott", actorInitials: "MS", actionLabel: "View Transfer", actionHref: "/transfers",
  },
  {
    id: "n02", title: "Critical Maintenance Alert",
    description: "HP ProBook 450 (AST-1051) has exceeded its SLA window. Immediate attention required for MNT-4404.",
    type: "maintenance", priority: "critical", time: "14 minutes ago", read: false,
    group: "Today", actor: "System", actorInitials: "SY", actionLabel: "Review Request", actionHref: "/maintenance",
  },
  {
    id: "n03", title: "Audit Verification Pending",
    description: "Q3 Audit cycle requires your sign-off on 8 unverified assets in the Engineering department.",
    type: "audit", priority: "high", time: "1 hour ago", read: false,
    group: "Today", actor: "Audit System", actorInitials: "AS", actionLabel: "Go to Audit", actionHref: "/audit",
  },
  {
    id: "n04", title: "Low Inventory Warning",
    description: "Monitor stock in the IT pool is below the minimum threshold (3 remaining). Consider requisitioning.",
    type: "alert", priority: "medium", time: "3 hours ago", read: false,
    group: "Today", actor: "Inventory", actorInitials: "IV",
  },
  {
    id: "n05", title: "New Asset Added",
    description: "Alex Kumar added MacBook Pro M4 Max (AST-1092) to the Engineering department inventory.",
    type: "asset", priority: "low", time: "5 hours ago", read: true,
    group: "Today", actor: "Alex Kumar", actorInitials: "AK", actionLabel: "View Asset", actionHref: "/assets",
  },
  {
    id: "n06", title: "Maintenance Resolved",
    description: "Dell Inspiron 15 (AST-1060) AC adapter replacement completed by Marcus Lee. Asset returned to service.",
    type: "maintenance", priority: "low", time: "Yesterday, 4:30 PM", read: true,
    group: "Yesterday", actor: "Marcus Lee", actorInitials: "ML",
  },
  {
    id: "n07", title: "Transfer Request Rejected",
    description: "Transfer request TRF-9014 for iPad Pro 12.9 was rejected due to insufficient justification.",
    type: "transfer", priority: "medium", time: "Yesterday, 2:15 PM", read: true,
    group: "Yesterday", actor: "Sarah Jenkins", actorInitials: "SJ", actionLabel: "View Request", actionHref: "/transfers",
  },
  {
    id: "n08", title: "New Allocation Created",
    description: "Surface Pro 9 (AST-1062) has been allocated to Joey Tribbiani in the Sales department.",
    type: "asset", priority: "low", time: "Yesterday, 10:00 AM", read: true,
    group: "Yesterday", actor: "Pam Beesly", actorInitials: "PB",
  },
  {
    id: "n09", title: "Audit Cycle Completed",
    description: "Q2 2026 Audit cycle has been officially closed with 94% verification rate. Report available.",
    type: "audit", priority: "medium", time: "Jul 10, 2026", read: true,
    group: "Earlier",  actor: "Audit System", actorInitials: "AS", actionLabel: "View Report", actionHref: "/reports",
  },
  {
    id: "n10", title: "Scheduled Maintenance Reminder",
    description: "HVAC system in Server Room A is due for quarterly maintenance on Jul 15, 2026.",
    type: "system", priority: "medium", time: "Jul 9, 2026", read: true,
    group: "Earlier", actor: "System", actorInitials: "SY",
  },
  {
    id: "n11", title: "User Account Created",
    description: "New employee Chandler Bing has been onboarded and added to the Engineering department.",
    type: "system", priority: "low", time: "Jul 8, 2026", read: true,
    group: "Earlier", actor: "Admin", actorInitials: "AK",
  },
  {
    id: "n12", title: "Asset Health Degraded",
    description: "Mac Studio M2 Ultra (AST-1055) health score dropped to 34%. SSD failure in progress.",
    type: "alert", priority: "critical", time: "Jul 7, 2026", read: true,
    group: "Earlier", actor: "System", actorInitials: "SY", actionLabel: "View Asset", actionHref: "/assets",
  },
];

const typeIcon: Record<NotifType, React.ElementType> = {
  transfer: ArrowRightLeft,
  maintenance: Wrench,
  audit: ShieldCheck,
  asset: Box,
  system: Info,
  alert: AlertTriangle,
};

const typeColor: Record<NotifType, string> = {
  transfer: "bg-primary/10 text-primary",
  maintenance: "bg-warning/10 text-warning",
  audit: "bg-chart-5/10 text-chart-5",
  asset: "bg-success/10 text-success",
  system: "bg-muted text-muted-foreground",
  alert: "bg-destructive/10 text-destructive",
};

const priorityDot: Record<Priority, string> = {
  critical: "bg-destructive",
  high: "bg-warning",
  medium: "bg-primary",
  low: "bg-muted-foreground",
};

const priorityBadge: Record<Priority, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-warning/10 text-warning border-warning/20",
  medium: "bg-primary/10 text-primary border-primary/20",
  low: "bg-muted text-muted-foreground border-border",
};

const filterOpts = ["All", "Unread", "Critical", "Transfer", "Maintenance", "Audit", "Asset", "System"] as const;
type FilterOpt = typeof filterOpts[number];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(allNotifications);
  const [activeFilter, setActiveFilter] = useState<FilterOpt>("All");

  const filtered = notifications.filter((n) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Unread") return !n.read;
    if (activeFilter === "Critical") return n.priority === "critical";
    return n.type === activeFilter.toLowerCase();
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const groups = ["Today", "Yesterday", "Earlier"];

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Notifications"
        description="Stay on top of alerts, approvals, and activity across your enterprise assets."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Notifications" }]}
        action={{ label: "Notification Settings", icon: Settings, href: "/settings" }}
      />

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Unread", value: unreadCount, icon: Bell, color: "text-primary", bg: "bg-primary/10" },
          { label: "Critical", value: notifications.filter((n) => n.priority === "critical").length, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "Pending Action", value: notifications.filter((n) => n.actionLabel && !n.read).length, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
          { label: "Resolved Today", value: notifications.filter((n) => n.group === "Today" && n.read).length, icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 pt-4 pb-4">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between bg-card p-4 rounded-xl border">
        <div className="flex flex-wrap gap-1.5">
          {filterOpts.map((f) => (
            <Button
              key={f} size="sm"
              variant={activeFilter === f ? "default" : "outline"}
              className="h-7 px-3 text-xs"
              onClick={() => setActiveFilter(f)}
            >
              {f}
              {f === "Unread" && unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1.5 px-1.5 h-4 text-[10px] rounded-full">{unreadCount}</Badge>
              )}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4 mr-1.5" />Mark all read
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Archive className="h-4 w-4 mr-1.5" />Archive all
          </Button>
        </div>
      </div>

      {/* Grouped notifications */}
      <div className="space-y-6">
        {groups.map((group) => {
          const groupItems = filtered.filter((n) => n.group === group);
          if (groupItems.length === 0) return null;
          return (
            <div key={group}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground">{group}</h3>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{groupItems.length} notification{groupItems.length !== 1 ? "s" : ""}</span>
              </div>
              <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
                <AnimatePresence>
                  {groupItems.map((n) => {
                    const TypeIcon = typeIcon[n.type];
                    return (
                      <motion.div
                        key={n.id} variants={item}
                        exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                        layout
                      >
                        <Card className={`transition-all hover:shadow-md ${!n.read ? "border-primary/20 bg-primary/[0.02]" : ""}`}>
                          <CardContent className="flex gap-4 pt-4 pb-4">
                            {/* Icon */}
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${typeColor[n.type]}`}>
                              <TypeIcon className="h-4 w-4" />
                            </div>

                            {/* Body */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 mb-1 flex-wrap">
                                {!n.read && <span className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${priorityDot[n.priority]}`} />}
                                <p className={`text-sm ${!n.read ? "font-semibold" : "font-medium"} leading-snug`}>{n.title}</p>
                                <Badge variant="outline" className={`text-[10px] shrink-0 ${priorityBadge[n.priority]}`}>{n.priority}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed mb-2 line-clamp-2">{n.description}</p>
                              <div className="flex items-center gap-3 flex-wrap">
                                {n.actor && (
                                  <div className="flex items-center gap-1.5">
                                    <Avatar className="h-5 w-5">
                                      <AvatarFallback className="text-[9px] bg-primary/10 text-primary">{n.actorInitials}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">{n.actor}</span>
                                  </div>
                                )}
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />{n.time}
                                </span>
                                {n.actionLabel && (
                                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                                    {n.actionLabel} <ChevronRight className="h-3 w-3 ml-0.5" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-1.5 shrink-0">
                              {!n.read && (
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => markRead(n.id)}>
                                  <CheckCheck className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => dismiss(n.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">All caught up</h3>
            <p className="text-sm text-muted-foreground">No notifications match this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
