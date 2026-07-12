"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ChartCard } from "@/components/shared/chart-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  ArrowRightLeft, 
  Box, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  Bell,
  CalendarDays,
  Share2
} from "lucide-react";
import { 
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip
} from "recharts";
import Link from "next/link";

const stats = [
  { title: "Total Assets", value: "2,543", icon: Box, trend: { value: 12, label: "from last month" } },
  { title: "Active Allocations", value: "1,205", icon: ArrowRightLeft, trend: { value: 5, label: "from last month" } },
  { title: "Needs Maintenance", value: "32", icon: Wrench, trend: { value: -2, label: "from last month" }, trendUpIsGood: false },
  { title: "System Health", value: "98.5%", icon: CheckCircle2, trend: { value: 1.2, label: "from last month" } },
];

const assetData = [
  { name: "Jan", laptops: 400, monitors: 240, phones: 240 },
  { name: "Feb", laptops: 300, monitors: 139, phones: 221 },
  { name: "Mar", laptops: 200, monitors: 980, phones: 229 },
  { name: "Apr", laptops: 278, monitors: 390, phones: 200 },
  { name: "May", laptops: 189, monitors: 480, phones: 218 },
  { name: "Jun", laptops: 239, monitors: 380, phones: 250 },
];

const activityData = [
  { id: 1, user: "Sarah Jenkins", action: "allocated", asset: "MacBook Pro M3", time: "2 hours ago", avatar: "SJ" },
  { id: 2, user: "Mike Ross", action: "requested maintenance for", asset: "Dell UltraSharp 32\"", time: "4 hours ago", avatar: "MR" },
  { id: 3, user: "Elena Gilbert", action: "transferred", asset: "iPad Pro", time: "5 hours ago", avatar: "EG" },
  { id: 4, user: "System", action: "completed audit for", asset: "Engineering Dept", time: "1 day ago", avatar: "SY" },
];

const notificationsData = [
  { id: 1, title: "Transfer Request Approved", description: "Your request for iPad Pro has been approved.", time: "10m ago", read: false },
  { id: 2, title: "Low Inventory Alert", description: "Monitor inventory is below 10 units.", time: "1h ago", read: false },
  { id: 3, title: "Maintenance Scheduled", description: "HVAC maintenance in Server Room A tomorrow.", time: "2h ago", read: true },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Welcome back, Alex!"
        description="Here's what's happening with your enterprise assets today."
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/assets/new" className="inline-flex h-20 flex-col items-center justify-center gap-2 rounded-md border border-input bg-card hover:bg-accent hover:text-accent-foreground transition-all border-dashed shadow-sm text-sm font-medium">
          <Plus className="h-5 w-5 text-primary" />
          <span>Add New Asset</span>
        </Link>
        <Link href="/allocations" className="inline-flex h-20 flex-col items-center justify-center gap-2 rounded-md border border-input bg-card hover:bg-accent hover:text-accent-foreground transition-all border-dashed shadow-sm text-sm font-medium">
          <Share2 className="h-5 w-5 text-primary" />
          <span>Allocate Asset</span>
        </Link>
        <Link href="/transfers" className="inline-flex h-20 flex-col items-center justify-center gap-2 rounded-md border border-input bg-card hover:bg-accent hover:text-accent-foreground transition-all border-dashed shadow-sm text-sm font-medium">
          <ArrowRightLeft className="h-5 w-5 text-primary" />
          <span>Request Transfer</span>
        </Link>
        <Link href="/bookings" className="inline-flex h-20 flex-col items-center justify-center gap-2 rounded-md border border-input bg-card hover:bg-accent hover:text-accent-foreground transition-all border-dashed shadow-sm text-sm font-medium">
          <CalendarDays className="h-5 w-5 text-primary" />
          <span>Book Resource</span>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-12 lg:grid-cols-12">
        {/* AI Insight Card */}
        <Card className="bg-primary/5 border-primary/20 md:col-span-8 lg:col-span-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <CardContent className="flex flex-col sm:flex-row items-start gap-4 pt-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <Lightbulb className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-primary mb-1">AI Insight: Maintenance Optimization</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Based on recent usage patterns, 15 laptops in the Engineering department are due for battery replacement in the next 30 days. Scheduling preventative maintenance now can reduce downtime by 40%.
              </p>
              <Button variant="default" size="sm" className="mt-4 shadow-sm">Review Recommendations</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="md:col-span-4 lg:col-span-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notifications
              </CardTitle>
              <Badge variant="secondary" className="px-1.5 min-w-5 h-5 flex items-center justify-center rounded-full">2</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notificationsData.map(notification => (
                <div key={notification.id} className="flex gap-3 items-start">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notification.read ? 'bg-muted' : 'bg-primary'}`} />
                  <div>
                    <p className={`text-sm ${notification.read ? 'text-muted-foreground' : 'font-medium'}`}>{notification.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{notification.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <ChartCard 
          title="Asset Growth" 
          description="Total assets distributed over the last 6 months" 
          className="lg:col-span-4"
        >
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={assetData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLaptops" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)' }}
                />
                <Area type="monotone" dataKey="laptops" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorLaptops)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {activityData.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">{activity.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      <span className="font-semibold">{activity.user}</span> {activity.action} <span className="font-semibold">{activity.asset}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6">View All Activity</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
