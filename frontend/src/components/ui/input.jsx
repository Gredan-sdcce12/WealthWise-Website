import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-lg border bg-background text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 md:text-sm",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        emerald: "border-primary/30 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
        glass: "bg-card/80 backdrop-blur-xl border-border/50 focus-visible:border-primary/50 focus-visible:bg-card",
      },
      inputSize: {
        default: "h-10 px-3 py-2",
        sm: "h-9 px-3 py-1",
        lg: "h-12 px-4 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

const Input = React.forwardRef(({ className, type, variant, inputSize, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(inputVariants({ variant, inputSize, className }))}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input, inputVariants };
