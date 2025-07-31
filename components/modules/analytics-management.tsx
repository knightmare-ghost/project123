"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  BusIcon,
  Users,
  Calendar,
  Package,
  MapPin,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle,
  Clock,
  Star,
  Activity,
} from "lucide-react"

interface AnalyticsData {
  totalRevenue: number
  totalBookings: number
  activeBuses: number
  totalDrivers: number
  completedTrips: number
  pendingBookings: number
  revenueChange: number
  bookingsChange: number
  averageRating: number
  onTimePerformance: number
}

interface ChartData {
  month: string
  revenue: number
  bookings: number
}

interface RoutePerformance {
  route: string
  bookings: number
  revenue: number
  occupancyRate: number
}

interface DriverPerformance {
  name: string
  trips: number
  rating: number
  onTimeRate: number
}


interface FuelUsage {
  busId: string
  plateNumber: string
  route: string
  fuelConsumed: number
  distance: number
  efficiency: number
  cost: number
  date: string
}

interface BookingTracking {
  id: string
  passengerName: string
  route: string
  bookingTime: string
  status: "confirmed" | "checked-in" | "boarded" | "completed" | "cancelled"
  seatNumber: string
  amount: number
  paymentStatus: "paid" | "pending" | "refunded"
}

interface TripTracking {
  id: string
  route: string
  busId: string
  driverName: string
  departureTime: string
  arrivalTime: string
  currentLocation: string
  status: "scheduled" | "departed" | "in-transit" | "arrived" | "delayed"
  passengers: number
  capacity: number
  progress: number
}

interface BusTracking {
  id: string
  plateNumber: string
  currentLocation: string
  route: string
  speed: number
  fuelLevel: number
  status: "active" | "idle" | "maintenance" | "offline"
  lastUpdate: string
  nextMaintenance: string
}

interface ParcelTracking {
  id: string
  trackingNumber: string
  senderName: string
  recipientName: string
  route: string
  status: "collected" | "in-transit" | "at-destination" | "delivered" | "failed-delivery"
  currentLocation: string
  estimatedDelivery: string
  weight: string
  amount: number
}

const analyticsData: AnalyticsData = {
  totalRevenue: 125000,
  totalBookings: 1250,
  activeBuses: 45,
  totalDrivers: 78,
  completedTrips: 1156,
  pendingBookings: 23,
  revenueChange: 12.5,
  bookingsChange: -3.2,
  averageRating: 4.7,
  onTimePerformance: 94.2,
}

const monthlyData: ChartData[] = [
  { month: "Jan", revenue: 85000, bookings: 850 },
  { month: "Feb", revenue: 92000, bookings: 920 },
  { month: "Mar", revenue: 78000, bookings: 780 },
  { month: "Apr", revenue: 105000, bookings: 1050 },
  { month: "May", revenue: 118000, bookings: 1180 },
  { month: "Jun", revenue: 125000, bookings: 1250 },
]

const routePerformance: RoutePerformance[] = [
  { route: "Accra - Kumasi", bookings: 450, revenue: 54000, occupancyRate: 89 },
  { route: "Accra - Tamale", bookings: 320, revenue: 64000, occupancyRate: 76 },
  { route: "Kumasi - Takoradi", bookings: 280, revenue: 42000, occupancyRate: 82 },
  { route: "Accra - Cape Coast", bookings: 200, revenue: 24000, occupancyRate: 71 },
]

const topDrivers: DriverPerformance[] = [
  { name: "Kwame Asante", trips: 245, rating: 4.9, onTimeRate: 98 },
  { name: "Ama Serwaa", trips: 189, rating: 4.8, onTimeRate: 96 },
  { name: "Kofi Mensah", trips: 312, rating: 4.7, onTimeRate: 94 },
  { name: "Akosua Boateng", trips: 156, rating: 4.9, onTimeRate: 97 },
]


const fuelUsageData: FuelUsage[] = [
  {
    busId: "1",
    plateNumber: "GH-1234-20",
    route: "Accra - Kumasi",
    fuelConsumed: 45.5,
    distance: 250,
    efficiency: 5.5,
    cost: 273,
    date: "2024-01-25",
  },
  {
    busId: "2",
    plateNumber: "GH-5678-20",
    route: "Accra - Tamale",
    fuelConsumed: 78.2,
    distance: 600,
    efficiency: 7.7,
    cost: 469,
    date: "2024-01-25",
  },
  {
    busId: "3",
    plateNumber: "GH-9012-20",
    route: "Kumasi - Takoradi",
    fuelConsumed: 52.3,
    distance: 300,
    efficiency: 5.7,
    cost: 314,
    date: "2024-01-25",
  },
]

const bookingTrackingData: BookingTracking[] = [
  {
    id: "BK001",
    passengerName: "John Doe",
    route: "Accra - Kumasi",
    bookingTime: "2024-01-25 08:30",
    status: "boarded",
    seatNumber: "A12",
    amount: 120,
    paymentStatus: "paid",
  },
  {
    id: "BK002",
    passengerName: "Jane Smith",
    route: "Accra - Tamale",
    bookingTime: "2024-01-25 09:15",
    status: "checked-in",
    seatNumber: "B08",
    amount: 200,
    paymentStatus: "paid",
  },
  {
    id: "BK003",
    passengerName: "Michael Brown",
    route: "Kumasi - Takoradi",
    bookingTime: "2024-01-24 16:45",
    status: "completed",
    seatNumber: "C15",
    amount: 150,
    paymentStatus: "paid",
  },
]

const tripTrackingData: TripTracking[] = [
  {
    id: "TR001",
    route: "Accra - Kumasi",
    busId: "GH-1234-20",
    driverName: "Kwame Asante",
    departureTime: "08:00",
    arrivalTime: "12:30",
    currentLocation: "Nsawam",
    status: "in-transit",
    passengers: 42,
    capacity: 45,
    progress: 35,
  },
  {
    id: "TR002",
    route: "Accra - Tamale",
    busId: "GH-9012-20",
    driverName: "Ama Serwaa",
    departureTime: "14:00",
    arrivalTime: "22:45",
    currentLocation: "Accra Terminal",
    status: "scheduled",
    passengers: 38,
    capacity: 55,
    progress: 0,
  },
  {
    id: "TR003",
    route: "Kumasi - Accra",
    busId: "GH-1234-20",
    driverName: "Kofi Mensah",
    departureTime: "16:30",
    arrivalTime: "21:00",
    currentLocation: "Accra Terminal",
    status: "arrived",
    passengers: 45,
    capacity: 45,
    progress: 100,
  },
]

const busTrackingData: BusTracking[] = [
  {
    id: "1",
    plateNumber: "GH-1234-20",
    currentLocation: "Nsawam (Accra-Kumasi Highway)",
    route: "Accra - Kumasi",
    speed: 85,
    fuelLevel: 65,
    status: "active",
    lastUpdate: "2 mins ago",
    nextMaintenance: "2024-02-15",
  },
  {
    id: "2",
    plateNumber: "GH-5678-20",
    currentLocation: "STC Workshop, Accra",
    route: "-",
    speed: 0,
    fuelLevel: 20,
    status: "maintenance",
    lastUpdate: "1 hour ago",
    nextMaintenance: "2024-01-30",
  },
  {
    id: "3",
    plateNumber: "GH-9012-20",
    currentLocation: "Accra Terminal",
    route: "Accra - Tamale",
    speed: 0,
    fuelLevel: 95,
    status: "idle",
    lastUpdate: "5 mins ago",
    nextMaintenance: "2024-03-01",
  },
]

const parcelTrackingData: ParcelTracking[] = [
  {
    id: "1",
    trackingNumber: "TRK001234",
    senderName: "Alice Johnson",
    recipientName: "Bob Wilson",
    route: "Accra - Kumasi",
    status: "in-transit",
    currentLocation: "Nsawam",
    estimatedDelivery: "2024-01-25 15:00",
    weight: "5kg",
    amount: 25,
  },
  {
    id: "2",
    trackingNumber: "TRK005678",
    senderName: "Carol Davis",
    recipientName: "David Miller",
    route: "Tamale - Accra",
    status: "delivered",
    currentLocation: "Accra Terminal",
    estimatedDelivery: "2024-01-24 18:00",
    weight: "2kg",
    amount: 15,
  },
  {
    id: "3",
    trackingNumber: "TRK009012",
    senderName: "Eve Taylor",
    recipientName: "Frank Anderson",
    route: "Kumasi - Takoradi",
    status: "at-destination",
    currentLocation: "Takoradi Terminal",
    estimatedDelivery: "2024-01-25 14:00",
    weight: "8kg",
    amount: 35,
  },
]

// Bar Chart Component
const BarChart = ({ data, height = 200 }: { data: ChartData[]; height?: number }) => {
  const maxRevenue = Math.max(...data.map((d) => d.revenue))
  const maxBookings = Math.max(...data.map((d) => d.bookings))

  return (
    <div className="w-full">
      <div className="flex items-end justify-between h-48 px-4 py-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 mx-1">
            <div className="flex items-end space-x-1 h-40">
              {/* Revenue Bar */}
              <div
                className="bg-green-500 rounded-t w-4 transition-all duration-300 hover:bg-green-600"
                style={{
                  height: `${(item.revenue / maxRevenue) * 160}px`,
                }}
                title={`Revenue: GHS ${item.revenue.toLocaleString()}`}
              />
              {/* Bookings Bar */}
              <div
                className="bg-blue-500 rounded-t w-4 transition-all duration-300 hover:bg-blue-600"
                style={{
                  height: `${(item.bookings / maxBookings) * 160}px`,
                }}
                title={`Bookings: ${item.bookings}`}
              />
            </div>
            <span className="text-xs text-gray-600 mt-2">{item.month}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center space-x-4 mt-2">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-xs text-gray-600">Revenue</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-xs text-gray-600">Bookings</span>
        </div>
      </div>
    </div>
  )
}

//Line Chart Component
const LineChart = ({ data }: { data: ChartData[] }) => {
  const maxRevenue = Math.max(...data.map((d) => d.revenue))
  const width = 300
  const height = 150

  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * (width - 40) + 20
      const y = height - 20 - (item.revenue / maxRevenue) * (height - 40)
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className="w-full">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="20"
            y1={20 + (i * (height - 40)) / 4}
            x2={width - 20}
            y2={20 + (i * (height - 40)) / 4}
            stroke="#f3f4f6"
            strokeWidth="1"
          />
        ))}

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * (width - 40) + 20
          const y = height - 20 - (item.revenue / maxRevenue) * (height - 40)
          return (
            <circle key={index} cx={x} cy={y} r="4" fill="#10b981" className="hover:r-6 transition-all">
              <title>{`${item.month}: GHS ${item.revenue.toLocaleString()}`}</title>
            </circle>
          )
        })}

        {/* X-axis labels */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * (width - 40) + 20
          return (
            <text key={index} x={x} y={height - 5} textAnchor="middle" className="text-xs fill-gray-600">
              {item.month}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

// Donut Chart Component
const DonutChart = ({ data, total }: { data: { label: string; value: number; color: string }[]; total: number }) => {
  const radius = 60
  const strokeWidth = 20
  const normalizedRadius = radius - strokeWidth * 0.5
  const circumference = normalizedRadius * 2 * Math.PI

  let cumulativePercentage = 0

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="#f3f4f6"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {data.map((segment, index) => {
            const percentage = (segment.value / total) * 100
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
            const strokeDashoffset = -((cumulativePercentage / 100) * circumference)
            cumulativePercentage += percentage

            return (
              <circle
                key={index}
                stroke={segment.color}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-300"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AnalyticsDashboard({ searchTerm, onSearch }: { searchTerm: string; onSearch: (value: string) => void }) {
  const [activeTab, setActiveTab] = useState("overview")

  const StatCard = ({ title, value, change, icon: Icon, prefix = "", suffix = "" }: any) => (
    <Card className="hover:shadow-lg transition-shadow bg-white rounded-xl border-0">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {prefix}
              {typeof value === "number" ? value.toLocaleString() : value}
              {suffix}
            </p>
            {change !== undefined && (
              <div className="flex items-center mt-1">
                {change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-[#008F37] mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${change >= 0 ? "text-[#008F37]" : "text-red-600"}`}>
                  {Math.abs(change)}%
                </span>
              </div>
            )}
          </div>
          <div className="p-3 bg-[#B7FFD2] rounded-full">
            <Icon className="h-6 w-6 text-[#008F37]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "completed":
      case "active":
      case "delivered":
      case "arrived":
      case "confirmed":
        return "bg-[#B7FFD2] text-[#008F37]"
      case "pending":
      case "scheduled":
      case "in-transit":
      case "at-destination":
      case "checked-in":
        return "bg-blue-100 text-blue-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      case "delayed":
      case "cancelled":
      case "failed-delivery":
      case "offline":
      case "refunded":
        return "bg-red-100 text-red-800"
      case "boarded":
        return "bg-purple-100 text-purple-800"
      case "idle":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-9">
            <TabsTrigger value="overview">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="revenue">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Revenue</span>
            </TabsTrigger>
            <TabsTrigger value="performance">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="operations">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Operations</span>
            </TabsTrigger>
            <TabsTrigger value="bookings-track">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="trips-track">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Trips</span>
            </TabsTrigger>
            <TabsTrigger value="buses-track">
              <BusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Buses</span>
            </TabsTrigger>
            <TabsTrigger value="fuel-track">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Fuel</span>
            </TabsTrigger>
            <TabsTrigger value="parcels-track">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Parcels</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Revenue"
                value={analyticsData.totalRevenue}
                change={analyticsData.revenueChange}
                icon={DollarSign}
                prefix="GHS "
              />
              <StatCard
                title="Total Bookings"
                value={analyticsData.totalBookings}
                change={analyticsData.bookingsChange}
                icon={CheckCircle}
              />
              <StatCard title="Active Buses" value={analyticsData.activeBuses} icon={BusIcon} />
              <StatCard title="Total Drivers" value={analyticsData.totalDrivers} icon={Users} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white rounded-xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Monthly Revenue & Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart data={monthlyData} />
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart data={monthlyData} />
                </CardContent>
              </Card>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Completed Trips" value={analyticsData.completedTrips} icon={CheckCircle} change={8.5} />
              <StatCard title="Pending Bookings" value={analyticsData.pendingBookings} icon={Clock} />
              <StatCard
                title="Average Rating"
                value={analyticsData.averageRating}
                icon={Star}
                suffix="/5"
                change={2.1}
              />
              <StatCard
                title="On-Time Performance"
                value={analyticsData.onTimePerformance}
                icon={Activity}
                suffix="%"
                change={1.8}
              />
            </div>
          </TabsContent>

          {/* Revenue Analytics */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-white rounded-xl shadow-lg border-0 p-6">
                <CardHeader>
                  <CardTitle>Revenue Breakdown by Route</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {routePerformance.map((route, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{route.route}</div>
                          <div className="text-sm text-gray-600">{route.bookings} bookings</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">GHS {route.revenue.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">{route.occupancyRate}% occupancy</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-lg border-0 p-6">
                <CardHeader>
                  <CardTitle>Revenue Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <DonutChart
                    data={[
                      { label: "Bus Tickets", value: 105000, color: "#10b981" },
                      { label: "Parcels", value: 15000, color: "#3b82f6" },
                      { label: "Other", value: 5000, color: "#f59e0b" },
                    ]}
                    total={125000}
                  />
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span>Bus Tickets</span>
                      </div>
                      <span className="font-medium">84%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span>Parcels</span>
                      </div>
                      <span className="font-medium">12%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                        <span>Other</span>
                      </div>
                      <span className="font-medium">4%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white rounded-xl shadow-lg border-0 p-6">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">GHS 2,083</div>
                    <div className="text-sm text-gray-600">Average Daily Revenue</div>
                    <div className="flex items-center justify-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+15.3%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-lg border-0 p-6">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">GHS 100</div>
                    <div className="text-sm text-gray-600">Average Ticket Price</div>
                    <div className="flex items-center justify-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">+2.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-lg border-0 p-6">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">21</div>
                    <div className="text-sm text-gray-600">Daily Bookings</div>
                    <div className="flex items-center justify-center mt-2">
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-sm text-red-600">-3.2%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Analytics */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white rounded-xl shadow-lg border-0 p-6">
                <CardHeader>
                  <CardTitle>Top Performing Routes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {routePerformance.map((route, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{route.route}</div>
                          <div className="text-sm text-gray-600">{route.bookings} bookings</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{route.occupancyRate}%</div>
                          <div className="text-sm text-gray-600">occupancy</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-lg border-0 p-6">
                <CardHeader>
                  <CardTitle>Top Drivers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topDrivers.map((driver, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{driver.name}</div>
                          <div className="text-sm text-gray-600">{driver.trips} trips</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">{driver.rating}</span>
                          </div>
                          <div className="text-sm text-gray-600">{driver.onTimeRate}% on-time</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-white rounded-xl shadow-lg border-0 p-6 text-center">
                <div className="text-2xl font-bold text-green-600">89%</div>
                <div className="text-sm text-gray-600">Average Occupancy</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-6 text-center">
                <div className="text-2xl font-bold text-blue-600">4.7</div>
                <div className="text-sm text-gray-600">Customer Rating</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-6 text-center">
                <div className="text-2xl font-bold text-purple-600">94%</div>
                <div className="text-sm text-gray-600">On-Time Rate</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-6 text-center">
                <div className="text-2xl font-bold text-orange-600">2.3%</div>
                <div className="text-sm text-gray-600">Cancellation Rate</div>
              </Card>
            </div>
          </TabsContent>

          {/* Operations Analytics */}
          <TabsContent value="operations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white rounded-xl shadow-lg border-0 p-6">
                <CardHeader>
                  <CardTitle>Fleet Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Active Buses</span>
                      <span className="font-semibold">45/50 (90%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "90%" }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">In Maintenance</span>
                      <span className="font-semibold">3/50 (6%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "6%" }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Out of Service</span>
                      <span className="font-semibold">2/50 (4%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: "4%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl shadow-lg border-0 p-6">
                <CardHeader>
                  <CardTitle>Driver Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">On Trip</span>
                      <span className="font-semibold">32/78 (41%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "41%" }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Available</span>
                      <span className="font-semibold">38/78 (49%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "49%" }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Off Duty</span>
                      <span className="font-semibold">8/78 (10%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-500 h-2 rounded-full" style={{ width: "10%" }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white rounded-xl shadow-lg border-0 p-6 text-center">
                <BusIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">156</div>
                <div className="text-sm text-gray-600">Trips Today</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-6 text-center">
                <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">89</div>
                <div className="text-sm text-gray-600">Parcels in Transit</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-6 text-center">
                <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">12</div>
                <div className="text-sm text-gray-600">Active Routes</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-6 text-center">
                <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">23</div>
                <div className="text-sm text-gray-600">Scheduled Trips</div>
              </Card>
            </div>
          </TabsContent>
          {/* Booking Tracking */}
          <TabsContent value="bookings-track" className="space-y-6">
            <div className="flex justify-between items-center">
            
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white rounded-xl shadow-lg border-0 p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">23</div>
                <div className="text-sm text-gray-600">Active Bookings</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">156</div>
                <div className="text-sm text-gray-600">Completed Today</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">8</div>
                <div className="text-sm text-gray-600">Checked In</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">12</div>
                <div className="text-sm text-gray-600">Boarded</div>
              </Card>
            </div>

            <Card className="bg-white rounded-xl shadow-lg border-0 p-0">
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Passenger</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Seat</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bookingTrackingData.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{booking.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{booking.passengerName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{booking.route}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{booking.seatNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(booking.paymentStatus)}>{booking.paymentStatus}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">GHS {booking.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Trip Tracking */}
          <TabsContent value="trips-track" className="space-y-6">
            <div className="flex justify-between items-center">
            
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white rounded-xl shadow-lg border-0 p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">8</div>
                <div className="text-sm text-gray-600">In Transit</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-gray-600">Completed</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">5</div>
                <div className="text-sm text-gray-600">Scheduled</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-4 text-center">
                <div className="text-2xl font-bold text-red-600">1</div>
                <div className="text-sm text-gray-600">Delayed</div>
              </Card>
            </div>

            <Card className="bg-white rounded-xl shadow-lg border-0 p-0">
              <CardHeader>
                <CardTitle>Active Trips</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trip ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bus</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Current Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tripTrackingData.map((trip) => (
                        <tr key={trip.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{trip.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{trip.route}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{trip.busId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{trip.driverName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{trip.currentLocation}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${trip.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{trip.progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(trip.status)}>{trip.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bus Tracking */}
          <TabsContent value="buses-track" className="space-y-6">
            <div className="flex justify-between items-center">
             
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white rounded-xl shadow-lg border-0 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">32</div>
                <div className="text-sm text-gray-600">Active Buses</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">8</div>
                <div className="text-sm text-gray-600">Idle</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">3</div>
                <div className="text-sm text-gray-600">Maintenance</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-4 text-center">
                <div className="text-2xl font-bold text-red-600">2</div>
                <div className="text-sm text-gray-600">Offline</div>
              </Card>
            </div>

            <Card className="bg-white rounded-xl shadow-lg border-0 p-0">
              <CardHeader>
                <CardTitle>Fleet Status</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Plate Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Current Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Speed</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fuel Level</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Update</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {busTrackingData.map((bus) => (
                        <tr key={bus.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{bus.plateNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{bus.currentLocation}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{bus.route}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{bus.speed} km/h</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className={`h-2 rounded-full ${bus.fuelLevel > 50 ? "bg-green-500" : bus.fuelLevel > 25 ? "bg-yellow-500" : "bg-red-500"}`}
                                  style={{ width: `${bus.fuelLevel}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600">{bus.fuelLevel}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(bus.status)}>{bus.status}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{bus.lastUpdate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fuel Usage Tracking */}
          <TabsContent value="fuel-track" className="space-y-6">
            <div className="flex justify-between items-center">
             
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white rounded-xl shadow-lg border-0 p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">175.8L</div>
                <div className="text-sm text-gray-600">Total Consumed Today</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">6.2L</div>
                <div className="text-sm text-gray-600">Average per 100km</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">GHS 1,056</div>
                <div className="text-sm text-gray-600">Daily Fuel Cost</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">92%</div>
                <div className="text-sm text-gray-600">Efficiency Rate</div>
              </Card>
            </div>

            <Card className="bg-white rounded-xl shadow-lg border-0 p-0">
              <CardHeader>
                <CardTitle>Fuel Consumption by Bus</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Plate Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Fuel Consumed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficiency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {fuelUsageData.map((fuel, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{fuel.plateNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{fuel.route}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{fuel.distance}km</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{fuel.fuelConsumed}L</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${fuel.efficiency < 6 ? "bg-green-100 text-green-800" : fuel.efficiency < 8 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                            >
                              {fuel.efficiency}L/100km
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">GHS {fuel.cost}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{fuel.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parcel Tracking */}
          <TabsContent value="parcels-track" className="space-y-6">
            <div className="flex justify-between items-center">
               
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
              <Card className="bg-white rounded-xl shadow-lg border-0 p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">45</div>
                <div className="text-sm text-gray-600">In Transit</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">128</div>
                <div className="text-sm text-gray-600">Delivered Today</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">12</div>
                <div className="text-sm text-gray-600">At Destination</div>
              </Card>
              <Card className="bg-white rounded-xl shadow-lg border-0 p-4 text-center">
                <div className="text-2xl font-bold text-red-600">3</div>
                <div className="text-sm text-gray-600">Failed Delivery</div>
              </Card>
            </div>

            <Card className="bg-white rounded-xl shadow-lg border-0 p-0">
              <CardHeader>
                <CardTitle>Active Parcel Deliveries</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Tracking Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sender</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Current Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ETA</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parcelTrackingData.map((parcel) => (
                        <tr key={parcel.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                            {parcel.trackingNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{parcel.senderName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{parcel.recipientName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{parcel.route}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{parcel.currentLocation}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(parcel.status)}>{parcel.status}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-900">{parcel.estimatedDelivery}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
