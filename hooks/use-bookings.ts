import { useState, useEffect, useCallback } from "react";
import {
  apiClient,
  Booking,
  BookingSearchParams,
  PaginatedResponse,
} from "@/lib/api";
import { toast } from "sonner";

// Mock data
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

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] =
    useState<PaginatedResponse<Booking> | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  const fetchBookings = useCallback(async (params?: BookingSearchParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getBookings(params);

      // Check if API returned empty data, use mock data as fallback
      if (response.data.data.length === 0 && !params) {
        setBookings(mockBookings);
        setUsingMockData(true);
        toast.info("Using sample booking data for demonstration");
      } else {
        setBookings(response.data.data);
        setPagination(response.data);
        setUsingMockData(false);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch bookings";
      setError(errorMessage);
      toast.error(errorMessage);

      // Fallback to mock data on error
      setBookings(mockBookings);
      setUsingMockData(true);
      toast.info("Using sample booking data due to connection issue");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBooking = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        await apiClient.deleteBooking(id);
        toast.success("Booking deleted successfully");

        // Refresh the bookings list
        await fetchBookings();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete booking";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchBookings]
  );

  const getBooking = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getBooking(id);
      return response.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch booking";
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load bookings on mount
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    pagination,
    usingMockData,
    fetchBookings,
    deleteBooking,
    getBooking,
    clearError,
  };
}
