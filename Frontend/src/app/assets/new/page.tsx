"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";

const steps = ["Basic Information", "Specifications", "Assignment"];

export default function AddAssetWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/assets");
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader
          title="Add New Asset"
          description="Register a new hardware or software asset into the system."
        />
      </div>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-300"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map((step, index) => (
          <div key={step} className="relative z-10 flex flex-col items-center gap-2">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-colors duration-300 ${
                index < currentStep ? "bg-primary border-primary text-primary-foreground" :
                index === currentStep ? "bg-background border-primary text-primary" :
                "bg-background border-muted text-muted-foreground"
              }`}
            >
              {index < currentStep ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
            </div>
            <span className={`text-xs font-medium ${index <= currentStep ? "text-foreground" : "text-muted-foreground"}`}>
              {step}
            </span>
          </div>
        ))}
      </div>

      <Card className="border-2 shadow-sm">
        <CardHeader>
          <CardTitle>{steps[currentStep]}</CardTitle>
          <CardDescription>
            {currentStep === 0 && "Provide the core details of the asset."}
            {currentStep === 1 && "Technical specifications and warranty information."}
            {currentStep === 2 && "Initial assignment and location details."}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px]">
          
          {/* Step 1: Basic Information */}
          {currentStep === 0 && (
            <div className="grid gap-6 animate-in fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="asset-name">Asset Name <span className="text-destructive">*</span></Label>
                  <Input id="asset-name" placeholder="e.g. MacBook Pro M3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-destructive">*</span></Label>
                  <select id="category" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="">Select Category</option>
                    <option value="laptop">Laptop</option>
                    <option value="monitor">Monitor</option>
                    <option value="mobile">Mobile Device</option>
                    <option value="furniture">Furniture</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input id="manufacturer" placeholder="e.g. Apple" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model Number</Label>
                  <Input id="model" placeholder="e.g. A2992" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial">Serial Number <span className="text-destructive">*</span></Label>
                <Input id="serial" placeholder="Enter unique serial number" />
              </div>

              <div className="space-y-2">
                <Label>Asset Images</Label>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer">
                  <UploadCloud className="h-8 w-8 mb-2 text-primary/60" />
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Specifications */}
          {currentStep === 1 && (
            <div className="grid gap-6 animate-in fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpu">Processor (CPU)</Label>
                  <Input id="cpu" placeholder="e.g. M3 Pro" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ram">Memory (RAM)</Label>
                  <Input id="ram" placeholder="e.g. 36GB Unified" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storage">Storage</Label>
                  <Input id="storage" placeholder="e.g. 1TB SSD" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="os">Operating System</Label>
                  <Input id="os" placeholder="e.g. macOS Sonoma" />
                </div>
              </div>

              <div className="border-t pt-6 mt-2 grid gap-6">
                <h4 className="text-sm font-medium leading-none">Purchase & Warranty</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchase-date">Purchase Date</Label>
                    <Input id="purchase-date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warranty">Warranty Expiry</Label>
                    <Input id="warranty" type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Purchase Cost ($)</Label>
                  <Input id="cost" type="number" placeholder="0.00" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Assignment */}
          {currentStep === 2 && (
            <div className="grid gap-6 animate-in fade-in">
              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <select id="status" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="available">Available (In Storage)</option>
                  <option value="in-use">In Use (Assigned)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Physical Location</Label>
                <select id="location" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select Location</option>
                  <option value="hq">Headquarters - NY</option>
                  <option value="branch-1">Branch - SF</option>
                  <option value="remote">Remote Worker</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <select id="department" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="">Select Department</option>
                  <option value="engineering">Engineering</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Sales</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assignee">Assign To (Optional)</Label>
                <Input id="assignee" placeholder="Search user by name or email..." />
                <p className="text-xs text-muted-foreground mt-1">Leave blank to keep asset in inventory.</p>
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-between border-t bg-muted/20 py-4">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={currentStep === 0 || isSubmitting}
          >
            Previous
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button onClick={nextStep}>
              Next Step <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-success hover:bg-success/90">
              {isSubmitting ? "Registering..." : (
                <>Complete Registration <CheckCircle2 className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
