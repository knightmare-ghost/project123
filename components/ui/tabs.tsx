"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // Modern, branded tab bar styles
      "flex items-center w-full gap-2 bg-white rounded-xl shadow-md p-2 overflow-x-auto",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Unified, modern tab styles
      "px-6 py-2 rounded-xl font-semibold transition-all duration-200 min-w-[120px] text-center select-none focus:outline-none focus:ring-2 focus:ring-[#008F37] focus-visible:ring-2 focus-visible:ring-[#008F37] focus:border-[#008F37] focus-visible:border-[#008F37] focus:z-10",
      // Active tab: white bg, green border, black text, subtle shadow
      "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:border data-[state=active]:border-[#008F37] data-[state=active]:shadow-md data-[state=active]:scale-105",
      // Inactive tab: white bg, green text, border on hover/focus
      "data-[state=inactive]:bg-white data-[state=inactive]:text-[#008F37] data-[state=inactive]:border-0 hover:border-[#008F37] hover:border hover:text-[#008F37] hover:bg-white",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
