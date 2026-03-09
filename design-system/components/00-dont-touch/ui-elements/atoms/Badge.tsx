import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center border px-2 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-[4px]",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "border-white/10 text-foreground bg-transparent",
        success: "border-transparent bg-green-500/20 text-green-500 border-green-500/30",
        warning: "border-transparent bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
        critical: "border-transparent bg-red-500/20 text-red-500 border-red-500/30",
        info: "border-transparent bg-blue-500/20 text-blue-500 border-blue-500/30",
      },
      size: {
        sm: "h-5 px-1.5 text-[10px]",
        default: "h-6 px-2",
        md: "h-6 px-2",
        lg: "h-7 px-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
