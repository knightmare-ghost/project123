"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "../auth/auth-context"
import { Bus, Users, Route, Calendar, Ticket, Package, TrendingUp, AlertTriangle } from "lucide-react"

export function DashboardOverview() {
  const { user } = useAuth()

  const getStatsForRole = () => {
    switch (user?.role) {
      case "hq_admin":
        return [
          { title: "Total Routes", value: "45", icon: Route, change: "+2 this month" },
          { title: "Active Buses", value: "128", icon: Bus, change: "95% operational" },
          { title: "Total Drivers", value: "156", icon: Users, change: "+5 this month" },
          { title: "Today's Trips", value: "89", icon: Calendar, change: "12 completed" },
          { title: "Bookings Today", value: "234", icon: Ticket, change: "+15% vs yesterday" },
          { title: "Parcels Pending", value: "67", icon: Package, change: "23 delivered today" },
        ]
      case "station_personnel" as import("../auth/auth-context").UserRole:
        return [
          { title: "Today's Departures", value: "24", icon: Calendar, change: "6 completed" },
          { title: "Bookings Today", value: "89", icon: Ticket, change: "+12% vs yesterday" },
          { title: "Parcels to Process", value: "23", icon: Package, change: "8 delivered" },
          { title: "Available Buses", value: "8", icon: Bus, change: "2 in maintenance" },
        ]
      case "driver" as import("../auth/auth-context").UserRole:
        return [
          { title: "Today's Trips", value: "3", icon: Calendar, change: "1 completed" },
          { title: "Passengers Today", value: "67", icon: Users, change: "89% capacity" },
          { title: "Next Departure", value: "2:30 PM", icon: TrendingUp, change: "Accra to Kumasi" },
          { title: "Bus Status", value: "Good", icon: Bus, change: "Last service: 5 days ago" },
        ]
      default:
        return []
    }
  }

  const stats = getStatsForRole()

  const getRecentActivities = () => {
    switch (user?.role) {
      case "hq_admin":
        return [
          { action: "New route added", details: "Accra to Takoradi via Cape Coast", time: "2 hours ago" },
          { action: "Bus maintenance completed", details: "GH-1234-20 - Engine service", time: "4 hours ago" },
          { action: "Driver assigned", details: "John Doe assigned to Route AC-KM-001", time: "6 hours ago" },
          { action: "High booking volume", details: "Accra-Kumasi route 95% booked for tomorrow", time: "8 hours ago" },
        ]
      case "station_personnel" as import("../auth/auth-context").UserRole:
        return [
          { action: "Booking confirmed", details: "Passenger: Mary Johnson - Seat 12A", time: "15 minutes ago" },
          { action: "Parcel received", details: "Package for Kumasi - Tracking: PKG001234", time: "30 minutes ago" },
          { action: "Bus departure", details: "GH-5678-21 departed to Tamale", time: "1 hour ago" },
          { action: "Seat blocked", details: "Seats 1A-1B blocked for maintenance", time: "2 hours ago" },
        ]
      case "driver" as import("../auth/auth-context").UserRole:
        return [
          { action: "Trip completed", details: "Accra to Kumasi - 45 passengers", time: "3 hours ago" },
          { action: "Pre-trip inspection", details: "All systems checked - Ready for departure", time: "5 hours ago" },
          { action: "Schedule updated", details: "Next trip: Kumasi to Accra at 6:00 PM", time: "6 hours ago" },
          { action: "Fuel refilled", details: "Tank filled to 95% capacity", time: "8 hours ago" },
        ]
      default:
        return []
    }
  }

  const activities = getRecentActivities()

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="bg-white rounded-xl shadow-lg border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[#B7FFD2] shadow">
                  <Icon className="h-5 w-5 text-[#008F37]" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="bg-white rounded-xl shadow-lg border-0">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Latest updates and actions in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.details}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-lg border-0">
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Important notifications and warnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Maintenance Due</p>
                  <p className="text-sm text-gray-600">Bus GH-9876-19 requires service in 2 days</p>
                  <p className="text-xs text-gray-400 mt-1">Priority: Medium</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">High Demand Route</p>
                  <p className="text-sm text-gray-600">Accra-Kumasi route is 98% booked for next 3 days</p>
                  <p className="text-xs text-gray-400 mt-1">Priority: High</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Driver License Expiry</p>
                  <p className="text-sm text-gray-600">3 drivers have licenses expiring this month</p>
                  <p className="text-xs text-gray-400 mt-1">Priority: Medium</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
