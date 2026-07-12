"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Edit, 
  QrCode, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  ShieldCheck,
  Laptop
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AssetDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data based on ID
  const asset = {
    id: id || "AST-1042",
    name: "MacBook Pro M3 Max",
    category: "Laptop",
    status: "In Use",
    assignee: "Sarah Jenkins",
    department: "Engineering",
    location: "HQ - San Francisco",
    health: 98,
    serial: "C02XR5M4J9",
    purchaseDate: "2023-11-01",
    warrantyExpiry: "2026-11-01",
    cost: "$3,499.00",
    specs: {
      cpu: "Apple M3 Max (16-core)",
      ram: "64GB Unified Memory",
      storage: "2TB SSD",
      os: "macOS Sonoma 14.2",
      display: "16.2-inch Liquid Retina XDR"
    }
  };

  const timeline = [
    { id: 1, date: "2024-03-15", action: "Assigned to Sarah Jenkins", user: "Admin", type: "assignment" },
    { id: 2, date: "2024-01-20", action: "Routine maintenance completed", user: "System", type: "maintenance" },
    { id: 3, date: "2023-11-10", action: "Added to inventory", user: "Admin", type: "creation" },
    { id: 4, date: "2023-11-01", action: "Purchased", user: "Procurement", type: "purchase" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{asset.name}</h1>
            <Badge 
              variant="outline"
              className={
                asset.status === "Available" ? "border-success text-success bg-success/10" :
                asset.status === "In Use" ? "border-primary text-primary bg-primary/10" :
                asset.status === "Maintenance" ? "border-warning text-warning bg-warning/10" : ""
              }
            >
              {asset.status}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{asset.id} • {asset.category}</p>
        </div>
        <Link href={`/assets/${id}/edit`} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
          <Edit className="h-4 w-4 mr-2" />
          Edit Asset
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Main Details */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Custom Tabs */}
          <div className="flex space-x-1 border-b">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "overview" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Overview & Specs
            </button>
            <button 
              onClick={() => setActiveTab("timeline")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "timeline" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              History Timeline
            </button>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" /> Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    {Object.entries(asset.specs).map(([key, value]) => (
                      <div key={key} className="flex flex-col space-y-1 pb-4 border-b last:border-0 sm:[&:nth-last-child(1)]:border-0 sm:[&:nth-last-child(2)]:border-0">
                        <span className="text-sm text-muted-foreground uppercase tracking-wider">{key}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" /> Warranty & Purchase
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Purchase Date</p>
                      <p className="font-medium">{asset.purchaseDate}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Warranty Expiry</p>
                      <p className="font-medium">{asset.warrantyExpiry}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Purchase Cost</p>
                      <p className="font-medium">{asset.cost}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "timeline" && (
            <Card className="animate-in fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Asset Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative border-l-2 border-muted ml-4 space-y-8 mt-4">
                  {timeline.map((event, index) => (
                    <div key={event.id} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-background ${
                        event.type === 'assignment' ? 'bg-primary' : 
                        event.type === 'maintenance' ? 'bg-warning' : 
                        event.type === 'purchase' ? 'bg-success' : 'bg-muted-foreground'
                      }`} />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                        <h4 className="font-semibold text-base">{event.action}</h4>
                        <span className="text-sm text-muted-foreground">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px]">{event.user.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-muted-foreground">by {event.user}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Column: Sidebar */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Asset Image */}
          <Card className="overflow-hidden border-2">
            <div className="h-48 bg-muted flex items-center justify-center relative">
              <Laptop className="h-24 w-24 text-primary/20" />
              <div className="absolute bottom-2 right-2">
                <Badge variant="secondary" className="bg-background/80 backdrop-blur border shadow-sm">
                  <QrCode className="h-3 w-3 mr-1" /> View QR
                </Badge>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-muted-foreground">Serial Number</span>
                <span className="font-mono text-sm font-medium">{asset.serial}</span>
              </div>
              <div className="flex justify-center border-t pt-4">
                {/* Simulated QR Code */}
                <div className="w-32 h-32 bg-white p-2 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                  <QrCode className="h-24 w-24 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Score */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" /> Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold">{asset.health}%</span>
                <span className="text-sm text-success font-medium mb-1">Excellent</span>
              </div>
              <Progress value={asset.health} className="h-2 mb-4 bg-muted" />
              <p className="text-xs text-muted-foreground text-center">
                Last health check: 30 days ago
              </p>
            </CardContent>
          </Card>

          {/* Current Assignment */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Current Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/5 text-primary font-semibold">{asset.assignee.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{asset.assignee}</p>
                  <p className="text-sm text-muted-foreground">{asset.department}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium text-right">{asset.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned On</span>
                  <span className="font-medium">Mar 15, 2024</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
