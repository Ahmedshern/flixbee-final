"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./button";

export interface AnimatedButtonProps extends ButtonProps {
  children: React.ReactNode;
}

export function AnimatedButton({ className, children, ...props }: AnimatedButtonProps) {
  return (
    <Button
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        "after:absolute after:inset-0 after:z-[-1] after:opacity-0 after:transition-all",
        "after:bg-gradient-to-r after:from-white/10 after:to-white/5",
        "after:shadow-[inset_-7px_-7px_20px_0px_rgba(255,255,255,0.6),inset_-4px_-4px_5px_0px_rgba(255,255,255,0.6),inset_7px_7px_20px_0px_rgba(0,0,0,0.1),inset_4px_4px_5px_0px_rgba(0,0,0,0.05)]",
        "hover:after:opacity-100 hover:after:translate-x-full",
        "active:translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
} 