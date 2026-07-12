"use client";

import { Search, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex w-full max-w-sm items-center space-x-2">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search assets, users, or departments..."
            className="w-full bg-muted pl-9 rounded-lg border-transparent focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        </Button>
        <ThemeToggle />
        <div className="h-8 w-px bg-border mx-2" />
        <Avatar className="h-9 w-9 cursor-pointer border border-border">
          <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="@user" />
          <AvatarFallback>AK</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
