"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User, Palette, Shield, Bell, Settings2, Building2,
  Check, ChevronRight, Moon, Sun, Monitor, Camera,
  Key, Smartphone, Trash2, LogOut, Save, Lock,
  Mail, Globe, Eye, EyeOff, ToggleLeft, ToggleRight,
  AlertTriangle, Info, Wrench, ArrowRightLeft, ShieldCheck, Box,
} from "lucide-react";

type SettingsTab = "profile" | "appearance" | "security" | "notifications" | "application";

const tabs: { id: SettingsTab; label: string; icon: React.ElementType; description: string }[] = [
  { id: "profile",       label: "Profile",         icon: User,      description: "Personal info and contact details" },
  { id: "appearance",    label: "Appearance",      icon: Palette,   description: "Theme, density, and language" },
  { id: "security",      label: "Security",        icon: Shield,    description: "Password, 2FA, and sessions" },
  { id: "notifications", label: "Notifications",   icon: Bell,      description: "Alerts, emails, and preferences" },
  { id: "application",   label: "Application",     icon: Settings2, description: "System behaviour and defaults" },
];

/* ---------- tiny reusable primitives ---------- */
function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 mt-6 first:mt-0">{children}</h3>;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  /* profile */
  const [profileName, setProfileName] = useState("Alex Kumar");
  const [profileEmail, setProfileEmail] = useState("alex.kumar@assetflow.io");
  const [profilePhone, setProfilePhone] = useState("+1 (555) 0192");
  const [profileTitle, setProfileTitle] = useState("Head of Engineering");
  const [profileLocation, setProfileLocation] = useState("Floor 2, Desk 14");
  const [profileSaved, setProfileSaved] = useState(false);

  /* appearance */
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [density, setDensity] = useState<"comfortable" | "compact" | "spacious">("comfortable");
  const [language, setLanguage] = useState("English (US)");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  /* security */
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(true);

  /* notifications */
  const [notifToggles, setNotifToggles] = useState({
    transferApprovals: true, maintenanceAlerts: true, auditReminders: true,
    assetChanges: false, systemUpdates: true, weeklyDigest: true,
    emailNotifs: true, browserPush: false, mobileApp: true,
    criticalSMS: true,
  });

  /* application */
  const [appToggles, setAppToggles] = useState({
    autoLogout: true, auditTrail: true, compactTables: false,
    exportWatermark: true, requireApproval: true, maintenanceWindow: false,
  });
  const [defaultView, setDefaultView] = useState("table");
  const [timezone, setTimezone] = useState("UTC-5 (Eastern Time)");
  const [dateFormat, setDateFormat] = useState("MMM D, YYYY");

  const saveProfile = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2200);
  };

  const toggleNotif = (key: keyof typeof notifToggles) =>
    setNotifToggles((p) => ({ ...p, [key]: !p[key] }));
  const toggleApp = (key: keyof typeof appToggles) =>
    setAppToggles((p) => ({ ...p, [key]: !p[key] }));

  const sessions = [
    { device: "MacBook Pro — Chrome", location: "New York, US", time: "Active now", current: true },
    { device: "iPhone 15 Pro — Safari", location: "New York, US", time: "2 hours ago", current: false },
    { device: "Windows PC — Edge", location: "Chicago, US", time: "3 days ago", current: false },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Settings"
        description="Manage your profile, appearance, security, and application preferences."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Settings" }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                      activeTab === t.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <t.icon className="h-4 w-4 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="text-[10px] text-muted-foreground truncate hidden lg:block">{t.description}</p>
                    </div>
                    {activeTab === t.id && <ChevronRight className="h-3.5 w-3.5 ml-auto shrink-0" />}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="space-y-4"
            >

              {/* ── PROFILE ── */}
              {activeTab === "profile" && (
                <>
                  <Card>
                    <CardHeader><CardTitle>Profile Information</CardTitle><CardDescription>Update your personal details and contact information.</CardDescription></CardHeader>
                    <CardContent>
                      {/* Avatar */}
                      <div className="flex items-center gap-5 mb-6 pb-6 border-b">
                        <div className="relative">
                          <Avatar className="h-20 w-20 border-4 border-background shadow">
                            <AvatarFallback className="text-2xl bg-primary/10 text-primary font-bold">AK</AvatarFallback>
                          </Avatar>
                          <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center shadow">
                            <Camera className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div>
                          <p className="font-semibold">{profileName}</p>
                          <p className="text-sm text-muted-foreground">{profileTitle}</p>
                          <Button variant="outline" size="sm" className="mt-2 h-7 text-xs">Change Photo</Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { id: "name",     label: "Full Name",     value: profileName,     set: setProfileName },
                          { id: "title",    label: "Job Title",     value: profileTitle,    set: setProfileTitle },
                          { id: "email",    label: "Email Address", value: profileEmail,    set: setProfileEmail },
                          { id: "phone",    label: "Phone",         value: profilePhone,    set: setProfilePhone },
                          { id: "location", label: "Office Location", value: profileLocation, set: setProfileLocation },
                        ].map((f) => (
                          <div key={f.id} className="space-y-1.5">
                            <Label htmlFor={f.id}>{f.label}</Label>
                            <Input id={f.id} value={f.value} onChange={(e) => f.set(e.target.value)} />
                          </div>
                        ))}
                        <div className="space-y-1.5">
                          <Label>Department</Label>
                          <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                            <option>Engineering</option><option>Design</option><option>Sales</option><option>Finance</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-6 pt-4 border-t">
                        <Button onClick={saveProfile}>
                          {profileSaved ? <><Check className="h-4 w-4 mr-1.5" />Saved!</> : <><Save className="h-4 w-4 mr-1.5" />Save Changes</>}
                        </Button>
                        <Button variant="outline">Discard</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-destructive/30 bg-destructive/5">
                    <CardHeader><CardTitle className="text-destructive text-base">Danger Zone</CardTitle><CardDescription>Irreversible actions for your account.</CardDescription></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-background">
                        <div>
                          <p className="text-sm font-medium">Sign out of all devices</p>
                          <p className="text-xs text-muted-foreground">Terminate all active sessions except this one.</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-destructive/40 text-destructive hover:bg-destructive/5"><LogOut className="h-4 w-4 mr-1.5" />Sign Out All</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-background">
                        <div>
                          <p className="text-sm font-medium">Delete account</p>
                          <p className="text-xs text-muted-foreground">Permanently remove your account and all associated data.</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-destructive/40 text-destructive hover:bg-destructive/5"><Trash2 className="h-4 w-4 mr-1.5" />Delete</Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* ── APPEARANCE ── */}
              {activeTab === "appearance" && (
                <Card>
                  <CardHeader><CardTitle>Appearance</CardTitle><CardDescription>Customize how AssetFlow looks and feels for you.</CardDescription></CardHeader>
                  <CardContent>
                    <SectionTitle>Theme</SectionTitle>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {([
                        { value: "light",  icon: Sun,     label: "Light"  },
                        { value: "dark",   icon: Moon,    label: "Dark"   },
                        { value: "system", icon: Monitor, label: "System" },
                      ] as const).map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setTheme(t.value)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                            theme === t.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                          }`}
                        >
                          <t.icon className={`h-5 w-5 ${theme === t.value ? "text-primary" : "text-muted-foreground"}`} />
                          <span className={`text-sm font-medium ${theme === t.value ? "text-primary" : "text-muted-foreground"}`}>{t.label}</span>
                          {theme === t.value && <Check className="h-3.5 w-3.5 text-primary" />}
                        </button>
                      ))}
                    </div>

                    <SectionTitle>Content Density</SectionTitle>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      {(["compact", "comfortable", "spacious"] as const).map((d) => (
                        <button
                          key={d}
                          onClick={() => setDensity(d)}
                          className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all ${
                            density === d ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                          }`}
                        >
                          <div className={`space-y-1 w-10 ${d === "compact" ? "space-y-0.5" : d === "spacious" ? "space-y-2" : ""}`}>
                            {[1,2,3].map((i) => <div key={i} className={`rounded-full bg-muted-foreground/30 w-full ${d === "compact" ? "h-0.5" : "h-1"}`} />)}
                          </div>
                          <span className={`text-xs font-medium capitalize ${density === d ? "text-primary" : "text-muted-foreground"}`}>{d}</span>
                        </button>
                      ))}
                    </div>

                    <SectionTitle>Preferences</SectionTitle>
                    <div className="divide-y">
                      <SettingRow label="Language" description="Display language for the interface">
                        <select className="h-8 text-sm rounded-md border border-input bg-transparent px-3 focus:outline-none" value={language} onChange={(e) => setLanguage(e.target.value)}>
                          <option>English (US)</option><option>English (UK)</option><option>French</option><option>German</option><option>Spanish</option>
                        </select>
                      </SettingRow>
                      <SettingRow label="Collapse sidebar by default" description="Start with a minimal icon-only sidebar">
                        <Toggle enabled={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
                      </SettingRow>
                      <SettingRow label="Enable animations" description="Smooth transitions and motion effects">
                        <Toggle enabled={animationsEnabled} onToggle={() => setAnimationsEnabled(!animationsEnabled)} />
                      </SettingRow>
                    </div>
                    <Button className="mt-5"><Save className="h-4 w-4 mr-1.5" />Save Preferences</Button>
                  </CardContent>
                </Card>
              )}

              {/* ── SECURITY ── */}
              {activeTab === "security" && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle>Change Password</CardTitle><CardDescription>Use a strong, unique password you don't use elsewhere.</CardDescription></CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-w-md">
                        <div className="space-y-1.5">
                          <Label>Current Password</Label>
                          <div className="relative">
                            <Input type={showPw ? "text" : "password"} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" />
                            <button className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground" onClick={() => setShowPw(!showPw)}>
                              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label>New Password</Label>
                          <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min 12 characters" />
                          {newPw.length > 0 && (
                            <div className="flex gap-1 mt-1.5">
                              {[1,2,3,4].map((i) => (
                                <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
                                  newPw.length >= i * 3 ? (newPw.length >= 12 ? "bg-success" : newPw.length >= 8 ? "bg-warning" : "bg-destructive") : "bg-muted"
                                }`} />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label>Confirm New Password</Label>
                          <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="Re-enter new password" />
                          {confirmPw.length > 0 && (
                            <p className={`text-xs flex items-center gap-1 mt-1 ${confirmPw === newPw ? "text-success" : "text-destructive"}`}>
                              {confirmPw === newPw ? <><Check className="h-3 w-3" />Passwords match</> : <><AlertTriangle className="h-3 w-3" />Passwords do not match</>}
                            </p>
                          )}
                        </div>
                        <Button className="mt-1"><Key className="h-4 w-4 mr-1.5" />Update Password</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Two-Factor Authentication</CardTitle><CardDescription>Add an extra layer of security to your account.</CardDescription></CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/20 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${twoFAEnabled ? "bg-success/10" : "bg-muted"}`}>
                            <Smartphone className={`h-5 w-5 ${twoFAEnabled ? "text-success" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <p className="font-medium text-sm">Authenticator App</p>
                            <p className="text-xs text-muted-foreground">Google Authenticator or Authy</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={twoFAEnabled ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}>
                            {twoFAEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                          <Toggle enabled={twoFAEnabled} onToggle={() => setTwoFAEnabled(!twoFAEnabled)} />
                        </div>
                      </div>
                      {!twoFAEnabled && (
                        <div className="flex gap-2 p-3 bg-warning/5 border border-warning/20 rounded-lg text-xs text-warning">
                          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                          Two-factor authentication is disabled. Your account is less secure.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Active Sessions</CardTitle><CardDescription>Devices currently signed into your account.</CardDescription></CardHeader>
                    <CardContent className="space-y-3">
                      {sessions.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                          <div className="flex items-center gap-3">
                            <div className={`h-2.5 w-2.5 rounded-full ${s.current ? "bg-success" : "bg-muted-foreground"}`} />
                            <div>
                              <p className="text-sm font-medium">{s.device}</p>
                              <p className="text-xs text-muted-foreground">{s.location} · {s.time}</p>
                            </div>
                          </div>
                          {s.current
                            ? <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">Current</Badge>
                            : <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive h-7 text-xs">Revoke</Button>
                          }
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeTab === "notifications" && (
                <Card>
                  <CardHeader><CardTitle>Notification Preferences</CardTitle><CardDescription>Choose which events trigger alerts and how you receive them.</CardDescription></CardHeader>
                  <CardContent>
                    <SectionTitle>Delivery Channels</SectionTitle>
                    <div className="divide-y mb-6">
                      {([
                        { key: "emailNotifs",   icon: Mail,       label: "Email Notifications",     desc: "Receive alerts to alex.kumar@assetflow.io" },
                        { key: "browserPush",   icon: Globe,      label: "Browser Push",            desc: "Desktop push notifications in supported browsers" },
                        { key: "mobileApp",     icon: Smartphone, label: "Mobile App",              desc: "Push via the AssetFlow mobile app" },
                        { key: "criticalSMS",   icon: AlertTriangle, label: "Critical SMS Alerts",  desc: "SMS for critical-priority events only" },
                      ] as const).map((row) => (
                        <SettingRow key={row.key} label={row.label} description={row.desc}>
                          <Toggle enabled={notifToggles[row.key]} onToggle={() => toggleNotif(row.key)} />
                        </SettingRow>
                      ))}
                    </div>

                    <SectionTitle>Event Types</SectionTitle>
                    <div className="divide-y mb-6">
                      {([
                        { key: "transferApprovals", icon: ArrowRightLeft, label: "Transfer Approvals",     desc: "When your transfers are approved or rejected" },
                        { key: "maintenanceAlerts",  icon: Wrench,         label: "Maintenance Alerts",    desc: "New requests, SLA warnings, and resolutions" },
                        { key: "auditReminders",     icon: ShieldCheck,    label: "Audit Reminders",       desc: "Upcoming audit cycles and pending verifications" },
                        { key: "assetChanges",       icon: Box,            label: "Asset Status Changes",  desc: "When assets you manage change status" },
                        { key: "systemUpdates",      icon: Info,           label: "System Updates",        desc: "Platform announcements and changelog notices" },
                      ] as const).map((row) => (
                        <SettingRow key={row.key} label={row.label} description={row.desc}>
                          <Toggle enabled={notifToggles[row.key]} onToggle={() => toggleNotif(row.key)} />
                        </SettingRow>
                      ))}
                    </div>

                    <SectionTitle>Digest</SectionTitle>
                    <div className="divide-y">
                      <SettingRow label="Weekly Activity Digest" description="Receive a Sunday summary of all asset activity">
                        <Toggle enabled={notifToggles.weeklyDigest} onToggle={() => toggleNotif("weeklyDigest")} />
                      </SettingRow>
                    </div>
                    <Button className="mt-5"><Save className="h-4 w-4 mr-1.5" />Save Preferences</Button>
                  </CardContent>
                </Card>
              )}

              {/* ── APPLICATION ── */}
              {activeTab === "application" && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader><CardTitle>System Behaviour</CardTitle><CardDescription>Configure how the platform operates for your organization.</CardDescription></CardHeader>
                    <CardContent>
                      <SectionTitle>General</SectionTitle>
                      <div className="divide-y mb-6">
                        {([
                          { key: "autoLogout",       label: "Auto logout after inactivity",   desc: "Sign out automatically after 30 minutes of inactivity" },
                          { key: "auditTrail",        label: "Full audit trail logging",       desc: "Log all user actions for compliance and traceability" },
                          { key: "compactTables",     label: "Compact table rows",             desc: "Display more data per page with reduced row height" },
                          { key: "exportWatermark",   label: "Add watermark to exports",       desc: "Include AssetFlow branding on all PDF/CSV exports" },
                          { key: "requireApproval",   label: "Require approval for transfers", desc: "All transfer requests must be approved by a manager" },
                          { key: "maintenanceWindow", label: "Scheduled maintenance mode",     desc: "Enable a maintenance window banner for users" },
                        ] as const).map((row) => (
                          <SettingRow key={row.key} label={row.label} description={row.desc}>
                            <Toggle enabled={appToggles[row.key]} onToggle={() => toggleApp(row.key)} />
                          </SettingRow>
                        ))}
                      </div>

                      <SectionTitle>Defaults</SectionTitle>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label>Default Asset View</Label>
                          <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={defaultView} onChange={(e) => setDefaultView(e.target.value)}>
                            <option value="table">Table</option>
                            <option value="grid">Grid</option>
                            <option value="kanban">Kanban</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Timezone</Label>
                          <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                            <option>UTC-5 (Eastern Time)</option>
                            <option>UTC-8 (Pacific Time)</option>
                            <option>UTC+0 (GMT)</option>
                            <option>UTC+1 (CET)</option>
                            <option>UTC+5:30 (IST)</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Date Format</Label>
                          <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                            <option>MMM D, YYYY</option>
                            <option>DD/MM/YYYY</option>
                            <option>MM/DD/YYYY</option>
                            <option>YYYY-MM-DD</option>
                          </select>
                        </div>
                      </div>
                      <Button className="mt-5"><Save className="h-4 w-4 mr-1.5" />Save Settings</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>About AssetFlow</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {[
                          { label: "Version",        value: "2.4.1" },
                          { label: "Environment",    value: "Production" },
                          { label: "Last Updated",   value: "Jul 12, 2026" },
                          { label: "License",        value: "Enterprise" },
                          { label: "Organization",   value: "AssetFlow Corp" },
                          { label: "Support Plan",   value: "Premium 24/7" },
                        ].map((i) => (
                          <div key={i.label} className="flex items-center justify-between p-2.5 bg-muted/40 rounded-lg border">
                            <span className="text-muted-foreground text-xs">{i.label}</span>
                            <span className="font-medium text-xs">{i.value}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
