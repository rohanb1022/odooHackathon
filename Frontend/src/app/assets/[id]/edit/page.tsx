"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for initial values
  const asset = {
    id: id || "AST-1042",
    name: "MacBook Pro M3 Max",
    category: "laptop",
    status: "in-use",
    serial: "C02XR5M4J9",
    cpu: "Apple M3 Max (16-core)",
    ram: "64GB Unified Memory",
    storage: "2TB SSD",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      router.push(`/assets/${asset.id}`);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title={`Edit Asset: ${asset.id}`}
          description="Update details for the selected asset."
        />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Core details that identify this asset.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="asset-name">Asset Name <span className="text-destructive">*</span></Label>
                  <Input id="asset-name" defaultValue={asset.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                  <select id="category" defaultValue={asset.category} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="laptop">Laptop</option>
                    <option value="monitor">Monitor</option>
                    <option value="mobile">Mobile Device</option>
                    <option value="furniture">Furniture</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial">Serial Number <span className="text-destructive">*</span></Label>
                <Input id="serial" defaultValue={asset.serial} required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
              <CardDescription>Technical details for hardware assets.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpu">Processor (CPU)</Label>
                  <Input id="cpu" defaultValue={asset.cpu} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ram">Memory (RAM)</Label>
                  <Input id="ram" defaultValue={asset.ram} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storage">Storage</Label>
                  <Input id="storage" defaultValue={asset.storage} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select id="status" defaultValue={asset.status} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="available">Available</option>
                    <option value="in-use">In Use</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary">
              {isSubmitting ? "Saving..." : (
                <>Save Changes <Save className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
