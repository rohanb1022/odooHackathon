import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ElementType;
  action?: {
    label: string;
    onClick?: () => void;
  };
}

export function EmptyState({ title, description, icon: Icon = FolderOpen, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mb-4 mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}
