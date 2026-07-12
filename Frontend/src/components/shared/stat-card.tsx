import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: {
    value: number;
    label: string;
  };
  trendUpIsGood?: boolean;
}

export function StatCard({ title, value, icon: Icon, description, trend, trendUpIsGood = true }: StatCardProps) {
  const isPositive = trend ? trend.value > 0 : false;
  const isNegative = trend ? trend.value < 0 : false;
  
  const trendGood = trendUpIsGood ? isPositive : isNegative;
  const trendBad = trendUpIsGood ? isNegative : isPositive;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend && (
              <span
                className={cn(
                  "font-medium",
                  trendGood ? "text-success" : trendBad ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>
            )}
            <span>{trend ? trend.label : description}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
