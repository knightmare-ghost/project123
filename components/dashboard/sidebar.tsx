"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "../auth/auth-context";
import type { ActiveModule } from "./dashboard";
import {
  LayoutDashboard,
  Route,
  Bus,
  Users,
  UserCheck,
  Calendar,
  Ticket,
  Package,
  LogOut,
  ChartBar,
  Menu,
  X,
  DollarSign,
  TrendingDown,
  FileText,
  Clock,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";

interface SidebarProps {
  activeModule: ActiveModule;
  setActiveModule: (module: ActiveModule) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({
  activeModule,
  setActiveModule,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      id: "dashboard" as ActiveModule,
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: [
        "hq_admin",
        "regional_manager",
        "operations_officer",
        "maintenance_officer",
      ],
    },
    {
      id: "bookings" as ActiveModule,
      label: "Bookings",
      icon: Ticket,
      roles: ["hq_admin", "operations_officer"],
    },
    {
      id: "trips" as ActiveModule,
      label: "Trips",
      icon: Calendar,
      roles: [
        "hq_admin",
        "regional_manager",
        "operations_officer",
        "maintenance_officer",
      ],
    },
    {
      id: "routes" as ActiveModule,
      label: "Routes",
      icon: Route,
      roles: ["hq_admin", "regional_manager"],
    },
    {
      id: "buses" as ActiveModule,
      label: "Buses",
      icon: Bus,
      roles: [
        "hq_admin",
        "regional_manager",
        "operations_officer",
        "maintenance_officer",
      ],
    },
    {
      id: "terminals" as ActiveModule,
      label: "Terminals",
      icon: Bus, // Using Bus icon for now, can be changed
      roles: ["hq_admin", "regional_manager"],
    },
    {
      id: "drivers" as ActiveModule,
      label: "Drivers",
      icon: UserCheck,
      roles: ["hq_admin"],
    },
    {
      id: "staff" as ActiveModule,
      label: "Staff",
      icon: Users,
      roles: ["hq_admin"],
    },
    {
      id: "parcels" as ActiveModule,
      label: "Parcels",
      icon: Package,
      roles: ["hq_admin"],
    },
    {
      id: "analytics" as ActiveModule,
      label: "Analytics",
      icon: ChartBar,
      roles: ["hq_admin", "regional_manager"],
    },
    {
      id: "finance-dashboard" as ActiveModule,
      label: "Dashboard",
      icon: ChartBar,
      roles: ["finance"],
    },
    {
      id: "finance-revenue" as ActiveModule,
      label: "Revenue",
      icon: DollarSign,
      roles: ["finance"],
    },
    {
      id: "finance-bookings" as ActiveModule,
      label: "Bookings",
      icon: Ticket,
      roles: ["finance"],
    },
    {
      id: "finance-parcels" as ActiveModule,
      label: "Parcels",
      icon: Package,
      roles: ["finance"],
    },
    {
      id: "finance-expenses" as ActiveModule,
      label: "Expenses",
      icon: TrendingDown,
      roles: ["finance"],
    },
    {
      id: "finance-reports" as ActiveModule,
      label: "Reports",
      icon: FileText,
      roles: ["finance"],
    },
  ];
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  // Sidebar content as a function for reuse
  const sidebarContent = (
    <>
      <div
        className="p-4 sm:p-6 border-b flex items-center justify-between"
        style={{
          background:
            "linear-gradient(262.17deg, #00662A 0%, #008F37 60%, #93F9B9 100%)",
        }}
      >
        <div className="flex items-center space-x-2">
          <img
            src="/stc-logo.png"
            alt="STC Ghana"
            className="h-8 w-auto sm:h-10 drop-shadow-lg"
          />
        </div>
        {/* Mobile close button */}
        <button
          className="sm:hidden p-1 rounded-full hover:bg-[#B7FFD2] text-white"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 p-2 sm:p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start text-base md:text-sm lg:text-base py-2 sm:py-2.5 px-2 sm:px-3 flex items-center gap-2 font-medium transition-all",
                isActive
                  ? "bg-white text-[#008F37] font-bold shadow rounded-lg"
                  : "bg-transparent text-white hover:bg-[#B7FFD2]/30 hover:text-[#008F37]",
                "group"
              )}
              style={
                isActive ? { boxShadow: "0 2px 8px 0 rgba(0,143,55,0.08)" } : {}
              }
              onClick={() => {
                setActiveModule(item.id);
                setMobileOpen(false);
              }}
            >
              <Icon
                className={cn(
                  "mr-3 h-5 w-5 md:h-4 md:w-4 lg:h-5 lg:w-5 transition-all",
                  isActive
                    ? "text-[#008F37]"
                    : "text-white group-hover:text-[#008F37]"
                )}
              />
              {item.label}
            </Button>
          );
        })}
      </nav>
      <div className="p-2 sm:p-4 border-t">
        <div className="mb-2 sm:mb-4 bg-white rounded-lg shadow border-l-4 border-[#008F37] p-3 flex flex-col items-start">
          <p className="text-sm font-semibold text-[#008F37]">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
          <p className="text-xs text-[#008F37] capitalize">
            {user?.role?.replace("_", " ")}
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start py-2 px-2 border-[#008F37] text-[#008F37] font-semibold hover:bg-[#B7FFD2] hover:text-[#008F37]"
          onClick={logout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </>
  );

  // Main sidebar (hidden on mobile)
  return (
    <>
      <div
        className="hidden sm:flex flex-col h-full w-64 md:w-56 lg:w-64 transition-all duration-200 shadow-xl"
        style={{
          background:
            "linear-gradient(97.83deg, #00662A 0%, #008F37 60%, #93F9B9 100%)",
          borderTopRightRadius: "2rem",
          borderBottomRightRadius: "2rem",
        }}
      >
        {sidebarContent}
      </div>
      {/* Mobile Slide-in Drawer */}
      <div
        className={`sm:hidden fixed inset-0 z-50 ${mobileOpen ? "" : "pointer-events-none"
          }`}
        aria-hidden={!mobileOpen}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${mobileOpen ? "opacity-100" : "opacity-0"
            }`}
          onClick={() => setMobileOpen(false)}
        />
        {/* Drawer */}
        <div
          className={`fixed top-0 left-0 h-full w-56 bg-white shadow-lg transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          style={{
            background:
              "linear-gradient(97.83deg, #00662A 0%, #008F37 60%, #93F9B9 100%)",
            borderTopRightRadius: "2rem",
            borderBottomRightRadius: "2rem",
          }}
        >
          {sidebarContent}
        </div>
      </div>
      {/* Prevent background scroll when drawer is open */}
      {mobileOpen && <style>{`body { overflow: hidden !important; }`}</style>}
    </>
  );
}

export function SidebarDrawer({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-xs w-64 h-screen left-0 top-0 rounded-none border-none">
        <div className="h-full flex flex-col bg-white">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
