import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-indigo-200 bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
        secondary: "border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200",
        destructive: "border-rose-200 bg-rose-100 text-rose-800 hover:bg-rose-200",
        outline: "text-slate-950 border-slate-300",
        success: "border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
        warning: "border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200",
        purple: "border-purple-200 bg-purple-100 text-purple-800 hover:bg-purple-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
