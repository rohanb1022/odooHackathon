import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ElementType;
  };
}

export function PageHeader({ title, description, breadcrumbs, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col space-y-4 md:flex-row md:items-start md:justify-between md:space-y-0">
      <div className="space-y-2">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <div key={crumb.label} className="flex items-center">
                  {crumb.href && !isLast ? (
                    <Link href={crumb.href} className="hover:text-foreground">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "text-foreground font-medium" : ""}>
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && <ChevronRight className="mx-2 h-4 w-4" />}
                </div>
              );
            })}
          </nav>
        )}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground max-w-3xl">{description}</p>}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action.href ? (
            <Link href={action.href}>
              <Button>
                {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                {action.label}
              </Button>
            </Link>
          ) : (
            <Button onClick={action.onClick}>
              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
