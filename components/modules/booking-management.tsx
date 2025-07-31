"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Trash2,
  User,
  Calendar,
  CreditCard,
  MapPin,
  Armchair,
  Loader2,
  Edit,
} from "lucide-react";
import { Booking } from "@/types";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Mock data for demonstration for now
const mockBookings: Booking[] = [
  {
    id: "BK001",
    user_id: "1",
    trip_id: "TRIP001",
    route_id: "ROUTE001",
    passenger_name: "Alice Johnson",
    passenger_phone: "+233 24 777 8888",
    passenger_email: "alice.johnson@email.com",
    seat_number: "12A",
    fare_amount: "45.00",
    booking_time: "2024-03-15",
    booking_status: "confirmed",
    payment_status: "paid",
    created_at: "2024-03-10T10:00:00Z",
    updated_at: "2024-03-10T10:00:00Z",
  },
  {
    id: "BK002",
    user_id: "1",
    trip_id: "TRIP002",
    route_id: "ROUTE002",
    passenger_name: "Robert Kwame",
    passenger_phone: "+233 20 999 0000",
    passenger_email: "robert.kwame@email.com",
    seat_number: "8B",
    fare_amount: "35.00",
    booking_time: "2024-03-15",
    booking_status: "confirmed",
    payment_status: "pending",
    created_at: "2024-03-12T14:30:00Z",
    updated_at: "2024-03-12T14:30:00Z",
  },
  {
    id: "BK003",
    user_id: "1",
    trip_id: "TRIP003",
    route_id: "ROUTE003",
    passenger_name: "Sarah Mensah",
    passenger_phone: "+233 26 555 1234",
    passenger_email: "sarah.mensah@email.com",
    seat_number: "15C",
    fare_amount: "50.00",
    booking_time: "2024-03-16",
    booking_status: "completed",
    payment_status: "paid",
    created_at: "2024-03-11T09:15:00Z",
    updated_at: "2024-03-11T09:15:00Z",
  },
  {
    id: "BK004",
    user_id: "1",
    trip_id: "TRIP004",
    route_id: "ROUTE001",
    passenger_name: "Kwame Asante",
    passenger_phone: "+233 27 888 9999",
    passenger_email: "kwame.asante@email.com",
    seat_number: "3D",
    fare_amount: "45.00",
    booking_time: "2024-03-17",
    booking_status: "cancelled",
    payment_status: "failed",
    created_at: "2024-03-13T16:45:00Z",
    updated_at: "2024-03-13T16:45:00Z",
  },
  {
    id: "BK005",
    user_id: "1",
    trip_id: "TRIP005",
    route_id: "ROUTE002",
    passenger_name: "Grace Osei",
    passenger_phone: "+233 24 111 2222",
    passenger_email: "grace.osei@email.com",
    seat_number: "7A",
    fare_amount: "35.00",
    booking_time: "2024-03-18",
    booking_status: "confirmed",
    payment_status: "paid",
    created_at: "2024-03-14T11:20:00Z",
    updated_at: "2024-03-14T11:20:00Z",
  },
];

export function BookingManagement({
  searchTerm,
  onSearch,
}: {
  searchTerm: string;
  onSearch: (value: string) => void;
}) {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "confirmed" | "cancelled" | "completed"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 3x3 grid

  const filteredBookings = bookings.filter(
    (booking) =>
      (statusFilter === "all" || booking.booking_status === statusFilter) &&
      (booking.passenger_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        booking.passenger_phone.includes(searchTerm) ||
        booking.passenger_email
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchTerm]);

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewDialogOpen(true);
  };

  const handleSubmit = (booking: Booking) => {
    if (selectedBooking) {
      // This is an edit
      setBookings(bookings.map((b) => (b.id === booking.id ? booking : b)));
      toast.success(
        `Booking for "${booking.passenger_name}" updated successfully.`
      );
    }
    // No add functionality for now with mock data
    setIsViewDialogOpen(false);
  };

  const handleDeleteBooking = (booking: Booking) => {
    setBookingToDelete(booking);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (bookingToDelete) {
      setBookings(
        bookings.filter((booking) => booking.id !== bookingToDelete.id)
      );
      toast.success(
        `Booking for "${bookingToDelete.passenger_name}" deleted successfully`
      );
      setIsDeleteDialogOpen(false);
      setBookingToDelete(null);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {/* Status Filter Dropdown */}
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
        >
          <SelectTrigger className="w-48 rounded-lg border border-[#B7FFD2] shadow-sm bg-white text-sm font-medium">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              All Bookings ({bookings.length})
            </SelectItem>
            <SelectItem value="confirmed">
              Confirmed (
              {bookings.filter((b) => b.booking_status === "confirmed").length})
            </SelectItem>
            <SelectItem value="cancelled">
              Cancelled (
              {bookings.filter((b) => b.booking_status === "cancelled").length})
            </SelectItem>
            <SelectItem value="completed">
              Completed (
              {bookings.filter((b) => b.booking_status === "completed").length})
            </SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            className="border border-[#008F37] text-[#008F37] px-3 py-1"
          >
            {viewMode === "list" ? "Grid View" : "List View"}
          </Button>
        </div>
      </div>

      {/* Bookings Display */}
      {currentBookings.length === 0 ? (
        <div className="col-span-full text-center py-10">
          <p>No bookings found.</p>
          {searchTerm && <p>Try a different search term.</p>}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentBookings.map((booking) => (
            <Card
              key={booking.id}
              className="bg-white rounded-xl shadow border p-3 flex flex-col justify-between min-h-[100px]"
            >
              <div className="flex justify-between items-center mb-1">
                <div className="font-semibold text-base truncate">
                  {booking.passenger_name}
                </div>
                <Badge
                  className={`${getBookingStatusColor(
                    booking.booking_status
                  )} rounded-full px-3 py-1 font-semibold text-xs`}
                >
                  {booking.booking_status || "Unknown"}
                </Badge>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                <span>Seat: {booking.seat_number}</span>
                <span>Trip: {booking.trip_id}</span>
              </div>
              <div className="flex gap-2 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditBooking(booking)}
                  className="flex-1 border border-blue-500 text-blue-600 hover:bg-blue-50 rounded-lg px-2 py-1 font-semibold transition-all duration-300"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteBooking(booking)}
                  className="flex-1 border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white rounded-lg px-2 py-1 font-semibold transition-all duration-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Passenger</th>
                <th className="px-4 py-2 text-left">Trip ID</th>
                <th className="px-4 py-2 text-left">Seat</th>
                <th className="px-4 py-2 text-left">Booking Status</th>
                <th className="px-4 py-2 text-left">Payment Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2 font-medium">
                    {booking.passenger_name}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{booking.trip_id}</td>
                  <td className="px-4 py-2">{booking.seat_number}</td>
                  <td className="px-4 py-2">
                    <Badge
                      className={`${getBookingStatusColor(
                        booking.booking_status
                      )} rounded-full px-3 py-1 font-semibold text-xs`}
                    >
                      {booking.booking_status || "Unknown"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">
                    <Badge
                      className={`${getPaymentStatusColor(
                        booking.payment_status
                      )} rounded-full px-3 py-1 font-semibold text-xs`}
                    >
                      {booking.payment_status || "Unknown"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditBooking(booking)}
                      className="border-gray-300"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteBooking(booking)}
                      className="border-gray-300"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls - always visible */}
      <div className="flex justify-center items-center gap-2 mt-6 mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="border border-[#008F37] text-[#008F37] px-3 py-1"
        >
          Previous
        </Button>
        {Array.from({ length: totalPages || 1 }, (_, i) => (
          <Button
            key={i + 1}
            variant={currentPage === i + 1 ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(i + 1)}
            className={
              currentPage === i + 1
                ? "bg-[#008F37] text-white"
                : "border border-[#008F37] text-[#008F37]"
            }
          >
            {i + 1}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentPage((p) => Math.min(totalPages || 1, p + 1))
          }
          disabled={currentPage === (totalPages || 1)}
          className="border border-[#008F37] text-[#008F37] px-3 py-1"
        >
          Next
        </Button>
      </div>

      {/* View Booking Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected booking.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Booking ID</Label>
                <Input value={selectedBooking.id} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Passenger Name</Label>
                <Input
                  defaultValue={selectedBooking.passenger_name}
                  onChange={(e) =>
                    setSelectedBooking({
                      ...selectedBooking,
                      passenger_name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  defaultValue={selectedBooking.passenger_phone}
                  onChange={(e) =>
                    setSelectedBooking({
                      ...selectedBooking,
                      passenger_phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  defaultValue={selectedBooking.passenger_email}
                  onChange={(e) =>
                    setSelectedBooking({
                      ...selectedBooking,
                      passenger_email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Route</Label>
                <Input defaultValue={selectedBooking.route_id} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Schedule</Label>
                <Input defaultValue={selectedBooking.trip_id} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Seat Number</Label>
                <Input
                  defaultValue={selectedBooking.seat_number}
                  onChange={(e) =>
                    setSelectedBooking({
                      ...selectedBooking,
                      seat_number: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Fare (GH₵)</Label>
                <Input
                  defaultValue={parseFloat(selectedBooking.fare_amount).toFixed(
                    2
                  )}
                  onChange={(e) =>
                    setSelectedBooking({
                      ...selectedBooking,
                      fare_amount: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Booking Date</Label>
                <Input
                  defaultValue={formatDate(selectedBooking.booking_time)}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select
                  defaultValue={selectedBooking.payment_status}
                  onValueChange={(value) =>
                    setSelectedBooking({
                      ...selectedBooking,
                      payment_status: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Booking Status</Label>
                <Select
                  defaultValue={selectedBooking.booking_status}
                  onValueChange={(value) =>
                    setSelectedBooking({
                      ...selectedBooking,
                      booking_status: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
              <p className="mt-4 text-lg">Loading booking details...</p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
              className="bg-white border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white rounded-lg px-4 py-2 font-semibold transition hover:shadow-lg"
            >
              Close
            </Button>
            <Button
              onClick={() => selectedBooking && handleSubmit(selectedBooking)}
              className="bg-white border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white shadow-lg rounded-lg px-4 py-2 font-semibold transition-all duration-300"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to delete this booking?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              booking for
              <span className="font-bold">
                {" "}
                "{bookingToDelete?.passenger_name}"
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
