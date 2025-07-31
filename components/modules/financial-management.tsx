import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, Ticket, Package, TrendingDown, FileText, ChartBar, TrendingUp, PieChart } from "lucide-react";
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Mock data (reuse from analytics, bookings, parcels)
const revenueSummary = {
  total: 125000,
  byRoute: [
    { route: "Accra - Kumasi", revenue: 54000 },
    { route: "Accra - Tamale", revenue: 64000 },
    { route: "Kumasi - Takoradi", revenue: 42000 },
    { route: "Accra - Cape Coast", revenue: 24000 },
  ],
  monthly: [
    { month: "Jan", revenue: 85000 },
    { month: "Feb", revenue: 92000 },
    { month: "Mar", revenue: 78000 },
    { month: "Apr", revenue: 105000 },
    { month: "May", revenue: 118000 },
    { month: "Jun", revenue: 125000 },
  ],
  distribution: [
    { label: "Bus Tickets", value: 105000, color: "#10b981" },
    { label: "Parcels", value: 15000, color: "#3b82f6" },
    { label: "Other", value: 5000, color: "#f59e0b" },
  ],
};

const bookings = [
  { id: "BK001", passenger: "Alice Johnson", route: "Accra - Kumasi", fare: 45, paymentStatus: "paid" },
  { id: "BK002", passenger: "Robert Kwame", route: "Accra - Takoradi", fare: 35, paymentStatus: "pending" },
];

const parcels = [
  { id: "PKG001", sender: "Alice Johnson", receiver: "Bob Wilson", route: "Accra - Kumasi", price: 25 },
  { id: "PKG002", sender: "Carol Davis", receiver: "David Miller", route: "Tamale - Accra", price: 15 },
];

const expenses = [
  { type: "Fuel", amount: 273, date: "2024-01-25" },
  { type: "Fuel", amount: 469, date: "2024-01-25" },
  { type: "Fuel", amount: 314, date: "2024-01-25" },
];

// Additional mock data for financial details
const averageTicketPrice = 100;
const highestEarningMonth = revenueSummary.monthly.reduce((max, m) => m.revenue > max.revenue ? m : max, revenueSummary.monthly[0]);
const revenueGrowthRate = (((revenueSummary.monthly[revenueSummary.monthly.length-1].revenue - revenueSummary.monthly[revenueSummary.monthly.length-2].revenue) / revenueSummary.monthly[revenueSummary.monthly.length-2].revenue) * 100).toFixed(1);

const totalBookingRevenue = bookings.reduce((sum, b) => sum + b.fare, 0);
const averageBookingValue = bookings.length ? (totalBookingRevenue / bookings.length).toFixed(2) : 0;
const refundedBookings = 0; // mock
const cancelledBookings = 0; // mock

const averageParcelValue = parcels.length ? (parcels.reduce((sum, p) => sum + p.price, 0) / parcels.length).toFixed(2) : 0;
const revenueByParcelRoute = Object.entries(parcels.reduce((acc: Record<string, number>, p) => {
  acc[p.route] = (acc[p.route] || 0) + p.price;
  return acc;
}, {} as Record<string, number>));

const averageExpense = expenses.length ? (expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length).toFixed(2) : 0;
const largestExpense = expenses.reduce((max, e) => e.amount > max.amount ? e : max, expenses[0]);
const expenseBreakdown = Object.entries(expenses.reduce((acc: Record<string, number>, e) => {
  acc[e.type] = (acc[e.type] || 0) + e.amount;
  return acc;
}, {} as Record<string, number>));
const expensePieData = {
  labels: expenseBreakdown.map(([type]) => type),
  datasets: [{
    data: expenseBreakdown.map(([_, value]) => value),
    backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444'],
    borderWidth: 2,
    borderColor: '#fff',
  }],
};
const expensePieOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'bottom' as const, labels: { color: '#374151', font: { weight: 'bold' as const } } },
    title: { display: false },
  },
};

const yearToDateNetProfit = revenueSummary.total - expenses.reduce((sum, e) => sum + e.amount, 0);

// Chart data for Bar and Pie
const barData = {
  labels: revenueSummary.monthly.map(m => m.month),
  datasets: [
    {
      label: 'Monthly Revenue',
      data: revenueSummary.monthly.map(m => m.revenue),
      backgroundColor: 'rgba(16, 185, 129, 0.7)',
      borderRadius: 8,
    },
  ],
};
const barOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { color: '#008F37', font: { weight: 'bold' as const } },
      grid: { color: '#E5E7EB' },
    },
    x: {
      ticks: { color: '#6B7280', font: { weight: 'bold' as const } },
      grid: { display: false },
    },
  },
};

const pieData = {
  labels: revenueSummary.distribution.map(d => d.label),
  datasets: [
    {
      data: revenueSummary.distribution.map(d => d.value),
      backgroundColor: revenueSummary.distribution.map(d => d.color),
      borderWidth: 2,
      borderColor: '#fff',
    },
  ],
};
const pieOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: '#374151', font: { weight: 'bold' as const } },
    },
    title: { display: false },
  },
};

interface FinancialManagementProps {
  activeModule: string;
  searchTerm: string;
  onSearch: (value: string) => void;
}

export function FinancialManagement({ activeModule, searchTerm, onSearch }: FinancialManagementProps) {
  return (
    <div className="space-y-8">
      {activeModule === "finance-dashboard" && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-[#1D976C]/90 to-[#93F9B9]/80 text-white shadow-xl border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold">Total Revenue</CardTitle>
                <DollarSign className="h-8 w-8 text-white/80" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold">GHS {revenueSummary.total.toLocaleString()}</div>
                <CardDescription className="text-white/80">All sources, this year</CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-xl border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-[#008F37]">Ticket Revenue</CardTitle>
                <Ticket className="h-8 w-8 text-[#10b981]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#008F37]">GHS 105,000</div>
                <CardDescription className="text-gray-500">Bus ticket sales</CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-xl border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-[#008F37]">Parcel Revenue</CardTitle>
                <Package className="h-8 w-8 text-[#3b82f6]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#008F37]">GHS 15,000</div>
                <CardDescription className="text-gray-500">Parcel delivery</CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-xl border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold text-[#008F37]">Expenses</CardTitle>
                <TrendingDown className="h-8 w-8 text-[#f59e0b]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#f59e0b]">GHS 1,056</div>
                <CardDescription className="text-gray-500">Fuel & operations</CardDescription>
              </CardContent>
            </Card>
          </div>
          {/* Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <Card className="bg-white shadow-xl border-0 col-span-1 flex flex-col justify-center items-center">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#008F37]">
                  <PieChart className="h-6 w-6 text-[#10b981]" /> Revenue Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* TODO: Connect to live data */}
                <Pie data={pieData} options={pieOptions} />
                <div className="flex flex-col gap-2 mt-4">
                  {revenueSummary.distribution.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ background: d.color }}></span>
                      <span className="font-medium text-gray-700">{d.label}</span>
                      <span className="ml-auto font-bold text-gray-900">GHS {d.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-xl border-0 col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#008F37]">
                  <TrendingUp className="h-6 w-6 text-[#10b981]" /> Monthly Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* TODO: Connect to live data */}
                <Bar data={barData} options={barOptions} height={180} />
              </CardContent>
            </Card>
          </div>
          {/* Revenue by Route */}
          <Card className="bg-white shadow-xl border-0 mt-8">
            <CardHeader>
              <CardTitle className="text-[#008F37]">Revenue by Route</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-gray-100">
                {revenueSummary.byRoute.map((r) => (
                  <li key={r.route} className="flex justify-between py-3">
                    <span className="font-medium text-gray-700">{r.route}</span>
                    <span className="font-bold text-[#10b981]">GHS {r.revenue.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
      {activeModule === "finance-revenue" && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="h-7 w-7 text-[#10b981]" />
            <h2 className="text-2xl font-bold text-[#008F37]">Revenue Overview</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-[#1D976C]/90 to-[#93F9B9]/80 text-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold">GHS {revenueSummary.total.toLocaleString()}</div>
                <CardDescription className="text-white/80">All sources, this year</CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#008F37]">Avg. Ticket Price</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#008F37]">GHS {averageTicketPrice}</div>
                <CardDescription className="text-gray-500">Per ticket</CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#008F37]">Highest Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#008F37]">{highestEarningMonth.month}</div>
                <CardDescription className="text-gray-500">GHS {highestEarningMonth.revenue.toLocaleString()}</CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#008F37]">Growth Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#10b981]">{revenueGrowthRate}%</div>
                <CardDescription className="text-gray-500">vs last month</CardDescription>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <Card className="flex-1 bg-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#008F37]">Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <Bar data={barData} options={barOptions} height={180} />
              </CardContent>
            </Card>
            <Card className="flex-1 bg-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-[#008F37]">Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="w-48 h-48">
                    <Pie
                      data={pieData}
                      options={{
                        ...pieOptions,
                        cutout: '70%',
                        plugins: {
                          ...pieOptions.plugins,
                          legend: {
                            ...pieOptions.plugins.legend,
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return `${label}: GHS ${value.toLocaleString()}`;
                              }
                            }
                          }
                        },
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-2 mt-4 w-full">
                    {revenueSummary.distribution.map((d, i) => {
                      const percent = ((d.value / revenueSummary.total) * 100).toFixed(1);
                      return (
                        <div key={i} className="flex items-center gap-2 text-sm justify-center">
                          <span className="inline-block w-3 h-3 rounded-full" style={{ background: d.color }}></span>
                          <span className="font-medium text-gray-700">{d.label}</span>
                          <span className="ml-auto font-bold text-gray-500">{percent}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {activeModule === "finance-bookings" && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Ticket className="h-7 w-7 text-[#10b981]" />
            <h2 className="text-2xl font-bold text-[#008F37]">Bookings & Payments</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-[#1D976C]/90 to-[#93F9B9]/80 text-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Total Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold">{bookings.length}</div>
                <CardDescription className="text-white/80">Bookings in system</CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#008F37]">Total Booking Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#008F37]">GHS {totalBookingRevenue}</div>
                <CardDescription className="text-gray-500">All bookings</CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#008F37]">Avg. Booking Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#008F37]">GHS {averageBookingValue}</div>
                <CardDescription className="text-gray-500">Per booking</CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#f59e0b]">Refunded/Cancelled</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#f59e0b]">{refundedBookings + cancelledBookings}</div>
                <CardDescription className="text-gray-500">Bookings</CardDescription>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-white rounded-xl shadow-lg border-0">
            <CardHeader>
              <CardTitle>Bookings Table</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Booking ID</th>
                    <th className="px-4 py-2 text-left">Passenger</th>
                    <th className="px-4 py-2 text-left">Route</th>
                    <th className="px-4 py-2 text-left">Fare</th>
                    <th className="px-4 py-2 text-left">Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b last:border-0">
                      <td className="px-4 py-2">{b.id}</td>
                      <td className="px-4 py-2">{b.passenger}</td>
                      <td className="px-4 py-2">{b.route}</td>
                      <td className="px-4 py-2">GHS {b.fare}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${b.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : b.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{b.paymentStatus}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
      {activeModule === "finance-parcels" && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-7 w-7 text-[#3b82f6]" />
            <h2 className="text-2xl font-bold text-[#008F37]">Parcel Transactions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-[#1D976C]/90 to-[#93F9B9]/80 text-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Total Parcels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold">{parcels.length}</div>
                <CardDescription className="text-white/80">Parcels in system</CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#008F37]">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#008F37]">GHS {parcels.reduce((sum, p) => sum + p.price, 0)}</div>
                <CardDescription className="text-gray-500">From parcels</CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#008F37]">Avg. Parcel Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#008F37]">GHS {averageParcelValue}</div>
                <CardDescription className="text-gray-500">Per parcel</CardDescription>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-white rounded-xl shadow-lg border-0 mb-8">
            <CardHeader>
              <CardTitle>Revenue by Route</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Route</th>
                    <th className="px-4 py-2 text-left">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueByParcelRoute.map(([route, value]) => (
                    <tr key={route} className="border-b last:border-0">
                      <td className="px-4 py-2">{route}</td>
                      <td className="px-4 py-2">GHS {value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl shadow-lg border-0">
            <CardHeader>
              <CardTitle>Parcel Table</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Parcel ID</th>
                    <th className="px-4 py-2 text-left">Sender</th>
                    <th className="px-4 py-2 text-left">Receiver</th>
                    <th className="px-4 py-2 text-left">Route</th>
                    <th className="px-4 py-2 text-left">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {parcels.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="px-4 py-2">{p.id}</td>
                      <td className="px-4 py-2">{p.sender}</td>
                      <td className="px-4 py-2">{p.receiver}</td>
                      <td className="px-4 py-2">{p.route}</td>
                      <td className="px-4 py-2">GHS {p.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
      {activeModule === "finance-expenses" && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <TrendingDown className="h-7 w-7 text-[#f59e0b]" />
            <h2 className="text-2xl font-bold text-[#008F37]">Expenses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-[#1D976C]/90 to-[#93F9B9]/80 text-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold">GHS {expenses.reduce((sum, e) => sum + e.amount, 0)}</div>
                <CardDescription className="text-white/80">All expenses</CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#008F37]">Avg. Expense</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#008F37]">GHS {averageExpense}</div>
                <CardDescription className="text-gray-500">Per entry</CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#ef4444]">Largest Expense</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#ef4444]">GHS {largestExpense.amount}</div>
                <CardDescription className="text-gray-500">{largestExpense.type} ({largestExpense.date})</CardDescription>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <Card className="flex-1 bg-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#008F37]">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-48 h-48 mx-auto flex items-center justify-center">
                  <Pie data={expensePieData} options={expensePieOptions} />
                </div>
              </CardContent>
            </Card>
            <Card className="flex-1 bg-white rounded-xl shadow-lg border-0">
              <CardHeader>
                <CardTitle>Expense Table</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Type</th>
                      <th className="px-4 py-2 text-left">Amount</th>
                      <th className="px-4 py-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((e, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="px-4 py-2">{e.type}</td>
                        <td className="px-4 py-2">GHS {e.amount}</td>
                        <td className="px-4 py-2">{e.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {activeModule === "finance-reports" && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <FileText className="h-7 w-7 text-[#008F37]" />
            <h2 className="text-2xl font-bold text-[#008F37]">Financial Reports</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-[#1D976C]/90 to-[#93F9B9]/80 text-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Year-to-Date Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">GHS {revenueSummary.total.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#ef4444]">Year-to-Date Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#ef4444]">GHS {expenses.reduce((sum, e) => sum + e.amount, 0)}</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#10b981]">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#10b981]">GHS {yearToDateNetProfit}</div>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-gradient-to-br from-[#1D976C]/90 to-[#93F9B9]/80 text-white shadow-xl border-0 mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Download Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <button className="bg-white text-[#008F37] font-bold px-6 py-3 rounded-lg shadow hover:bg-[#B7FFD2] transition">Download PDF</button>
                <button className="bg-white text-[#008F37] font-bold px-6 py-3 rounded-lg shadow hover:bg-[#B7FFD2] transition">Download Excel</button>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl shadow-lg border-0">
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-gray-600">Download and view detailed financial reports here. (Coming soon)</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 