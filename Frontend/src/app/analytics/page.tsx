"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ChartCard } from "@/components/shared/chart-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LineChart, AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, Box, Wrench, Zap,
  Activity, BarChart3, Calendar, RefreshCw, Download,
  Building2, AlertTriangle, CheckCircle2, Clock,
} from "lucide-react";

/* ── mock data ─────────────────────────────────────── */
const utilizationTrend = [
  { month: "Jan", engineering: 82, sales: 70, design: 88, finance: 60, marketing: 68 },
  { month: "Feb", engineering: 84, sales: 72, design: 89, finance: 62, marketing: 70 },
  { month: "Mar", engineering: 83, sales: 75, design: 91, finance: 64, marketing: 71 },
  { month: "Apr", engineering: 86, sales: 74, design: 90, finance: 63, marketing: 73 },
  { month: "May", engineering: 85, sales: 77, design: 92, finance: 65, marketing: 72 },
  { month: "Jun", engineering: 87, sales: 78, design: 93, finance: 65, marketing: 74 },
  { month: "Jul", engineering: 87, sales: 78, design: 92, finance: 65, marketing: 74 },
];

const assetHealthDist = [
  { name: "Excellent (90-100%)", value: 48, fill: "#10B981" },
  { name: "Good (70-89%)", value: 29, fill: "#4F46E5" },
  { name: "Fair (50-69%)", value: 14, fill: "#F59E0B" },
  { name: "Poor (<50%)", value: 9, fill: "#EF4444" },
];

const forecastData = [
  { month: "Aug", actual: null, forecast: 2590 },
  { month: "Sep", actual: null, forecast: 2640 },
  { month: "Oct", actual: null, forecast: 2700 },
  { month: "Nov", actual: null, forecast: 2780 },
  { month: "Dec", actual: null, forecast: 2860 },
  { month: "Jan'27", actual: null, forecast: 2950 },
];

const historicalAndForecast = [
  { month: "Apr", actual: 2260, forecast: null },
  { month: "May", actual: 2330, forecast: null },
  { month: "Jun", actual: 2400, forecast: null },
  { month: "Jul", actual: 2543, forecast: 2543 },
  ...forecastData,
];

const maintenanceCostData = [
  { month: "Jan", hardware: 4200, software: 1800, labour: 3600 },
  { month: "Feb", hardware: 5100, software: 1400, labour: 4200 },
  { month: "Mar", hardware: 3800, software: 2100, labour: 3900 },
  { month: "Apr", hardware: 4600, software: 1900, labour: 4100 },
  { month: "May", hardware: 3200, software: 2400, labour: 3500 },
  { month: "Jun", hardware: 2900, software: 1600, labour: 3200 },
  { month: "Jul", hardware: 3800, software: 2000, labour: 3800 },
];

const deptRadarData = [
  { metric: "Utilization", Engineering: 87, Sales: 78, Design: 92, Finance: 65, Marketing: 74 },
  { metric: "Health", Engineering: 88, Sales: 76, Design: 94, Finance: 80, Marketing: 71 },
  { metric: "Compliance", Engineering: 95, Sales: 82, Design: 90, Finance: 98, Marketing: 78 },
  { metric: "Coverage", Engineering: 82, Sales: 70, Design: 85, Finance: 72, Marketing: 68 },
  { metric: "Efficiency", Engineering: 90, Sales: 74, Design: 88, Finance: 76, Marketing: 72 },
];

/* heatmap data: days × hours */
const heatmapDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const heatmapHours = ["9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm"];
const heatmapData: { day: string; hour: string; value: number }[] = [];
heatmapDays.forEach((d) =>
  heatmapHours.forEach((h) => {
    const base = d === "Wed" || d === "Thu" ? 60 : 40;
    const hourBoost = h === "10am" || h === "2pm" || h === "3pm" ? 30 : 0;
    heatmapData.push({ day: d, hour: h, value: Math.min(100, base + hourBoost + Math.round(Math.random() * 20)) });
  })
);

const kpis = [
  { title: "Asset Utilization", value: "82%", change: +4.1, icon: Activity, good: true },
  { title: "Avg Asset Health", value: "86%", change: +1.8, icon: CheckCircle2, good: true },
  { title: "MTTR (days)", value: "2.4", change: -0.6, icon: Wrench, good: false },
  { title: "Cost per Asset/mo", value: "$18.40", change: -3.2, icon: TrendingDown, good: false },
];

const forecastCards = [
  { label: "Projected Assets (Dec '26)", value: "~2,860", delta: "+317 from today", trend: "up", note: "Based on current acquisition rate" },
  { label: "Maintenance Cost (Q4)", value: "~$36,000", delta: "+8% vs Q3", trend: "up", note: "Seasonally adjusted estimate" },
  { label: "Assets Retiring (6mo)", value: "~42", delta: "≈1.7% of fleet", trend: "neutral", note: "Based on age and health scores" },
  { label: "Utilization Forecast (Dec)", value: "88%", delta: "+6pp from today", trend: "up", note: "Driven by headcount growth" },
];

const PERIOD_OPTS = ["7D", "30D", "90D", "1Y", "All"];
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

function HeatmapCell({ value }: { value: number }) {
  const opacity = Math.max(0.08, value / 100);
  return (
    <div
      className="rounded aspect-square"
      style={{ backgroundColor: `rgba(79,70,229,${opacity})` }}
      title={`${value}% activity`}
    />
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30D");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Analytics"
        description="Deep-dive into asset utilization, health trends, cost analysis, and predictive forecasts."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Analytics" }]}
        action={{ label: "Export Dashboard", icon: Download, onClick: () => {} }}
      />

      {/* Period selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Period:</span>
        <div className="flex bg-muted p-1 rounded-lg gap-1">
          {PERIOD_OPTS.map((p) => (
            <Button key={p} size="sm" variant={period === p ? "secondary" : "ghost"} className="h-7 px-3 text-xs" onClick={() => setPeriod(p)}>{p}</Button>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <motion.div key={k.title} variants={item}>
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">{k.title}</span>
                  <k.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold mb-1">{k.value}</p>
                <p className={`text-xs flex items-center gap-1 ${
                  (k.good && k.change > 0) || (!k.good && k.change < 0)
                    ? "text-success" : "text-destructive"
                }`}>
                  {k.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {k.change > 0 ? "+" : ""}{k.change}% vs last period
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Utilization Trend */}
      <ChartCard title="Department Utilization Trend" description="Asset utilization rate per department over time">
        <div className="h-[260px] mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={utilizationTrend} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} unit="%" domain={[55, 100]} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-card)" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {["engineering", "sales", "design", "finance", "marketing"].map((d, i) => {
                const colors = ["var(--color-primary)", "var(--color-chart-2)", "var(--color-chart-5)", "var(--color-warning)", "var(--color-chart-4)"];
                return <Line key={d} type="monotone" dataKey={d} name={d[0].toUpperCase() + d.slice(1)} stroke={colors[i]} strokeWidth={2} dot={false} />;
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Asset Health + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Asset Health Distribution" description="Portfolio health score breakdown">
          <div className="h-[220px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={assetHealthDist} cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={3} dataKey="value">
                  {assetHealthDist.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-card)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {assetHealthDist.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-xs">
                <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                <span className="text-muted-foreground truncate">{d.name}</span>
                <span className="font-semibold ml-auto">{d.value}%</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Department Comparison Radar" description="Multi-metric performance across departments">
          <div className="h-[280px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={deptRadarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }} />
                <Radar name="Engineering" dataKey="Engineering" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="Design" dataKey="Design" stroke="var(--color-chart-5)" fill="var(--color-chart-5)" fillOpacity={0.1} strokeWidth={2} />
                <Radar name="Sales" dataKey="Sales" stroke="var(--color-chart-2)" fill="var(--color-chart-2)" fillOpacity={0.1} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-card)" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Heatmap */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Asset Activity Heatmap</CardTitle>
          <CardDescription>Booking and allocation activity intensity by day and hour (this week)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              <div className="grid gap-1" style={{ gridTemplateColumns: `56px repeat(${heatmapHours.length}, 1fr)` }}>
                <div />
                {heatmapHours.map((h) => (
                  <div key={h} className="text-[10px] text-muted-foreground text-center pb-1">{h}</div>
                ))}
                {heatmapDays.map((day) => (
                  <React.Fragment key={day}>
                    <div className="text-xs text-muted-foreground flex items-center pr-2">{day}</div>
                    {heatmapHours.map((hour) => {
                      const cell = heatmapData.find((c) => c.day === day && c.hour === hour);
                      return <HeatmapCell key={hour} value={cell?.value ?? 0} />;
                    })}
                  </React.Fragment>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4 justify-end">
                <span className="text-[10px] text-muted-foreground">Low</span>
                {[0.08, 0.25, 0.45, 0.65, 0.85].map((o) => (
                  <div key={o} className="h-3 w-6 rounded-sm" style={{ backgroundColor: `rgba(79,70,229,${o})` }} />
                ))}
                <span className="text-[10px] text-muted-foreground">High</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Cost */}
      <ChartCard title="Maintenance Cost Breakdown" description="Monthly spend by category (hardware, software, labour)">
        <div className="h-[220px] mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={maintenanceCostData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-card)" }} formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="hardware" name="Hardware" stackId="a" fill="var(--color-primary)" />
              <Bar dataKey="software" name="Software" stackId="a" fill="var(--color-chart-4)" />
              <Bar dataKey="labour" name="Labour" stackId="a" fill="var(--color-chart-5)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Forecast + Asset Growth Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Asset Count Forecast" description="Historical data with 6-month AI-driven projection">
          <div className="h-[220px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalAndForecast} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-5)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-chart-5)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} domain={[2200, 3000]} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid var(--color-border)", backgroundColor: "var(--color-card)" }} />
                <Area type="monotone" dataKey="actual" name="Actual" stroke="var(--color-primary)" strokeWidth={2} fill="url(#actualGrad)" connectNulls={false} />
                <Area type="monotone" dataKey="forecast" name="Forecast" stroke="var(--color-chart-5)" strokeWidth={2} strokeDasharray="5 4" fill="url(#forecastGrad)" connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Forecast Cards */}
        <div className="grid grid-cols-2 gap-3 content-start">
          {forecastCards.map((f) => (
            <Card key={f.label} className="hover:shadow-sm transition-all">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs text-muted-foreground mb-1 leading-tight">{f.label}</p>
                <p className="text-xl font-bold mb-0.5">{f.value}</p>
                <p className={`text-xs flex items-center gap-1 ${f.trend === "up" ? "text-primary" : "text-muted-foreground"}`}>
                  {f.trend === "up" && <TrendingUp className="h-3 w-3" />}
                  {f.delta}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">{f.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
