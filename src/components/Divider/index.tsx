import { cn } from "@/utils";
import { cva, VariantProps } from "class-variance-authority";
import React from "react";

const dividerVariants = cva("border border-gray-100", {
  variants: {
    variant: {
      vertical: "w-[2px] h-full mx-2",
      horizontal: "h-[2px] w-full my-2",
    },
  },
});

export interface IDivider
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> {}

export const Divider = React.forwardRef<HTMLDivElement, IDivider>(
  ({ className, variant, ...props }, ref) => (
    <div
      className={cn(dividerVariants({ variant, className }))}
      ref={ref}
      {...props}
    />
  )
);
Divider.displayName = "Divider";
