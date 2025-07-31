"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { DashboardOverview } from "./dashboard-overview";
import RouteManagement from "../modules/route-management";
import BusManagement from "../modules/bus-management";
import { BusAvailability } from "../modules/bus-availability";
import DriverManagement from "../modules/driver-management";
import { StaffManagement } from "../modules/staff-management";
import { TripManagement } from "../modules/trip-management";
import { BookingManagement } from "../modules/booking-management";
import { ParcelManagement } from "../modules/parcel-management";
import { useAuth } from "../auth/auth-context";
import { AnalyticsDashboard } from "../modules/analytics-management";
import { FinancialManagement } from "../modules/financial-management";
import TerminalManagement from "../modules/terminal-management";

export type ActiveModule =
  | "dashboard"
  | "routes"
  | "buses"
  | "drivers"
  | "staff"
  | "trips"
  | "bookings"
  | "parcels"
  | "analytics"
  | "finance-dashboard"
  | "finance-revenue"
  | "finance-bookings"
  | "finance-parcels"
  | "finance-expenses"
  | "finance-reports"
  | "terminals";

export function Dashboard() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Set default active module based on user role
  const getDefaultModule = (): ActiveModule => {
    if (user?.role === "finance") {
      return "finance-dashboard";
    }
    return "dashboard";
  };

  const [activeModule, setActiveModule] = useState<ActiveModule>(getDefaultModule());

  const renderActiveModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <DashboardOverview />;
      case "routes":
        return <RouteManagement />;
      case "buses":
        return <BusManagement />;
      case "drivers":
        return <DriverManagement />;
      case "staff":
        return <StaffManagement searchTerm={searchTerm} onSearch={setSearchTerm} />;
      case "trips":
        return <TripManagement searchTerm={searchTerm} onSearch={setSearchTerm} />;
      case "terminals":
        return <TerminalManagement />;
      case "bookings":
        return <BookingManagement searchTerm={searchTerm} onSearch={setSearchTerm} />;
      case "parcels":
        return <ParcelManagement searchTerm={searchTerm} onSearch={setSearchTerm} />;
      case "analytics":
        return <AnalyticsDashboard searchTerm={searchTerm} onSearch={setSearchTerm} />;
      case "finance-dashboard":
      case "finance-revenue":
      case "finance-bookings":
      case "finance-parcels":
      case "finance-expenses":
      case "finance-reports":
        return <FinancialManagement activeModule={activeModule} searchTerm={searchTerm} onSearch={setSearchTerm} />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        mobileOpen={sidebarOpen}
        setMobileOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          isDashboard={activeModule === "dashboard"}
          onOpenSidebar={() => setSidebarOpen(true)}
          activeModule={activeModule}
          onSearch={setSearchTerm}
          user={user}
        />
        <main className="flex-1 overflow-auto p-3 sm:p-6">{renderActiveModule()}</main>
      </div>
    </div>
  );
} 