"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Box,
  Share2,
  CalendarDays,
  Wrench,
  ArrowRightLeft,
  ShieldCheck,
  Users,
  Building2,
  FileBarChart,
  LineChart,
  Bell,
  Settings,
  Hexagon
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Assets", href: "/assets", icon: Box },
  { name: "Allocations", href: "/allocations", icon: Share2 },
  { name: "Bookings", href: "/bookings", icon: CalendarDays },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Transfers", href: "/transfers", icon: ArrowRightLeft },
  { name: "Audit", href: "/audit", icon: ShieldCheck },
  { name: "Departments", href: "/departments", icon: Building2 },
  { name: "Users", href: "/users", icon: Users },
  { name: "Reports", href: "/reports", icon: FileBarChart },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card px-4 py-6">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Hexagon className="h-6 w-6" fill="currentColor" strokeWidth={1} />
        </div>
        <span className="text-xl font-bold tracking-tight">AssetFlow</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
