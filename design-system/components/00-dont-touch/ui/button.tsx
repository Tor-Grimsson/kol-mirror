import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[4px] text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-white/70",
        destructive: "bg-[#ce4646] text-white hover:bg-[#ce4646]/90",
        outline: "border border-white/10 bg-white/2 text-foreground hover:bg-white/5 disabled:opacity-100 disabled:cursor-not-allowed",
        secondary: "bg-[#ffe32e] text-black hover:bg-[#db8000]",
        ghost: "hover:bg-white/5 hover:text-foreground",
        link: "text-white underline-offset-4 hover:underline",
      },
      size: {
        default: "h-7 px-4 py-1",
        sm: "h-6 px-3 py-0.5",
        lg: "h-8 px-6 py-1.5",
        icon: "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
