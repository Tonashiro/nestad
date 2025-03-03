import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React from "react";
import { GrCircleQuestion } from "react-icons/gr";

interface ITooltip {
  children: React.ReactNode;
}

export function Tooltip({ children }: ITooltip) {
  return (
    <TooltipProvider delayDuration={1}>
      <ShadcnTooltip>
        <TooltipTrigger type="button">
          <GrCircleQuestion className="w-5 h-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
        </TooltipTrigger>
        <TooltipContent>{children}</TooltipContent>
      </ShadcnTooltip>
    </TooltipProvider>
  );
}
