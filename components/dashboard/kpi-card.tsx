import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ACCENT: Record<string, string> = {
  "text-indigo-600": "border-l-indigo-500",
  "text-emerald-600": "border-l-emerald-500",
  "text-purple-600": "border-l-purple-500",
  "text-amber-600": "border-l-amber-500",
};

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconColor?: string;
}

export function KPICard({
  title,
  value,
  change,
  changeLabel = "vs last month",
  icon: Icon,
  iconBgColor = "bg-indigo-50",
  iconColor = "text-indigo-600",
}: KPICardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <Card className={cn("border-l-4 hover:border-slate-300", ACCENT[iconColor] ?? "border-l-indigo-500")}>
      <CardContent className="p-5 md:p-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            {title}
          </span>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBgColor)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          <span className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </span>
        </div>

        {change !== undefined && (
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold rounded-md px-1.5 py-0.5",
                isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
              )}
            >
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {isPositive ? `+${change}%` : `${change}%`}
            </span>
            <span className="text-slate-400">{changeLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
