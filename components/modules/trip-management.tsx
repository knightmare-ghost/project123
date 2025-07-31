"use client";

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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Calendar,
  Clock,
  Bus,
  User,
  Edit,
  Trash2,
  Plus,
  Loader2,
  CalendarDays,
} from "lucide-react";
import { useState, useEffect } from "react";
import { format, parseISO, startOfDay } from "date-fns";
import { useTrips } from "@/hooks/use-trips";
import { useRoutes } from "@/hooks/use-routes";
import { useBuses } from "@/hooks/use-buses";
import { useDrivers } from "@/hooks/use-drivers";
import { useAuth } from "@/components/auth/auth-context";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiClient, Terminal } from "@/service/api";
import type { Driver as DriverType } from "@/service/api";

export function TripManagement({
  searchTerm,
  onSearch,
}: {
  searchTerm: string;
  onSearch: (value: string) => void;
}) {
  const { user } = useAuth();
  const {
    trips,
    loading,
    error,
    createTrip,
    updateTrip,
    deleteTrip,
    clearError,
    fetchTrips,
  } = useTrips();
  const { routes, fetchRoutes } = useRoutes();
  const { buses, fetchBuses } = useBuses();
  const { drivers, fetchDrivers } = useDrivers();

  useEffect(() => {
    fetchRoutes();
    fetchDrivers();
    fetchBuses();
  }, []);

  // After fetching trips, log the fare for each trip
  useEffect(() => {
    if (trips && trips.length > 0) {
      console.log('Trip fares:', trips.map(t => ({ id: t._id || t.id, fare: t.fare })));
    }
  }, [trips]);

  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [terminalsMap, setTerminalsMap] = useState<{ [id: string]: string }>(
    {}
  );

  useEffect(() => {
    async function fetchTerminals() {
      const data = await apiClient.getTerminals();
      setTerminals(data);
      const map: { [id: string]: string } = {};
      data.forEach((t: Terminal) => {
        map[t.id] = t.name;
      });
      setTerminalsMap(map);
    }
    fetchTerminals();
  }, []);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive" | "completed" | "cancelled"
  >("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState("trips");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Date and time state for the form
  const [tripDate, setTripDate] = useState<Date>();
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");

  // Add service type options
  const serviceTypeOptions = [
    { value: "DOMESTIC", label: "Domestic" },
    { value: "INTERNATIONAL", label: "International" },
  ];

  // Update formData initial state and remove driver_id/date
  const [formData, setFormData] = useState<any>({
    route_id: "",
    bus_id: "",
    trip_number: "",
    escort_name: "",
    escort_phone: "",
    service_type: "DOMESTIC",
    departure_date: format(new Date(), "yyyy-MM-dd"),
    departure_time: "",
    arrival_date: "",
    arrival_time: "18:00:00",
    status: "active",
    base_price: "0",
    available_seats: 0,
    notes: "",
    drivers: [],
  });

  // (24-hour format)
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  // Set default times when date is selected
  useEffect(() => {
    if (tripDate && !departureTime) {
      setDepartureTime("08:00");
    }
    if (tripDate && !arrivalTime) {
      setArrivalTime("18:00");
    }
  }, [tripDate, departureTime, arrivalTime]);

  // Reset pagination to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Add debugging for trips data
  console.log("Raw trips data:", trips);
  console.log("Routes data:", routes);
  console.log("Buses data:", buses);
  console.log("Drivers data:", drivers);
  
  // Restore enrichment logic for both string and object forms
  const enrichedTrips = trips.map((trip: any) => {
    // Debug each trip
    console.log("Processing trip:", trip);
    
    const enriched = {
      ...trip,
      route: routes.find((r: any) => r.id === (trip.route_id?.id || trip.route_id)) || null,
      bus: buses.find((b: any) => b.id === (trip.bus_id?.id || trip.bus_id)) || null,
      drivers: trip.driver_id
        ? [drivers.find((d: any) => d.id === (trip.driver_id?.id || trip.driver_id))].filter(Boolean)
        : [],
    };
    
    console.log("Enriched trip:", enriched);
    return enriched;
  });

  // Use enrichedTrips for filtering and rendering
  const filteredTrips = enrichedTrips.filter((trip: any) => {
    const statusMatch =
      statusFilter === "all" ? true : trip.status === statusFilter;
    const searchMatch =
      trip.route?.route_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      trip.bus?.registration_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      trip.drivers?.some((d: any) =>
        d.driver_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return statusMatch && searchMatch;
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  // Change the default number of trips per page from 6 to 10
  const tripsPerPage = 10;
  const paginatedTrips = filteredTrips.slice(
    (currentPage - 1) * tripsPerPage,
    currentPage * tripsPerPage
  );
  const totalPages = Math.ceil(filteredTrips.length / tripsPerPage);

  const handleAddTrip = () => {
    setEditingTrip(null);
    setFormData({
      route_id: "",
      bus_id: "",
      trip_number: "",
      escort_name: "",
      escort_phone: "",
      service_type: "DOMESTIC",
      departure_date: format(new Date(), "yyyy-MM-dd"),
      departure_time: "08:00:00",
      arrival_date: "",
      arrival_time: "18:00:00",
      status: "active",
      base_price: "0",
      available_seats: 0,
      notes: "",
      drivers: [],
    });
    setTripDate(new Date());
    setDepartureTime("08:00");
    setArrivalTime("18:00");
    setIsDialogOpen(true);
  };

  const handleEditTrip = (trip: any) => {
    setEditingTrip(trip);
    setFormData({
      route_id: trip.route_id?._id || trip.route_id?.id || trip.route_id || "",
      bus_id: trip.bus_id?._id || trip.bus_id?.id || trip.bus_id || "",
      trip_number: trip.trip_number || "",
      escort_name: trip.escort_name || "",
      escort_phone: trip.escort_phone || "",
      service_type: trip.service_type || "DOMESTIC",
      departure_date: trip.departure_date || "",
      departure_time: trip.departure_time || "",
      arrival_date: trip.arrival_date || "",
      arrival_time: trip.arrival_time || "",
      status: trip.status || "active",
      base_price: trip.base_price || "0",
      available_seats:
        typeof trip.available_seats === "number" ? trip.available_seats : 0,
      notes: trip.notes || "",
      drivers: [
        {
          driver_id: trip.driver_id?._id || trip.driver_id?.id || trip.driver_id || "",
          driver_name: trip.driver_id?.firstname && trip.driver_id?.lastname
            ? `${trip.driver_id.firstname} ${trip.driver_id.lastname}`
            : "",
          is_primary: 1,
        },
      ],
      fare: trip.fare || "0",
    });
    setTripDate(
      trip.departure_date ? new Date(trip.departure_date) : undefined
    );
    setDepartureTime(
      trip.departure_time ? trip.departure_time.substring(0, 5) : ""
    );
    setArrivalTime(trip.arrival_time ? trip.arrival_time.substring(0, 5) : "");
    setIsDialogOpen(true);
  };

  const handleDeleteTrip = (trip: any) => {
    setTripToDelete(trip);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (tripToDelete) {
      const success = await deleteTrip(tripToDelete.id);
      if (success) {
        setDeleteDialogOpen(false);
        setTripToDelete(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    // Validate required fields
    if (
      !formData.route_id ||
      !formData.bus_id ||
      !formData.fare ||
      !formData.drivers?.length ||
      !formData.drivers[0].driver_id
    ) {
      toast.error("Please fill in all required fields: route, bus, fare, and driver");
      return;
    }

    // Note: Arrival time can come before departure time for overnight trips or special scheduling

    const formattedDate = tripDate ? format(tripDate, "yyyy-MM-dd") : "";
    // In handleSubmit, build cleanedData to only include non-empty/non-null fields when editing
    const cleanedData: any = {
      route_id: formData.route_id,
      bus_id: formData.bus_id,
      fare: formData.fare,
      driver_id: formData.drivers[0].driver_id,
    };
    if (formData.departure_date) cleanedData.departure_date = formData.departure_date;
    if (formData.departure_time) cleanedData.departure_time = formData.departure_time;
    if (formData.arrival_date) cleanedData.arrival_date = formData.arrival_date;
    if (formData.arrival_time) cleanedData.arrival_time = formData.arrival_time;
    if (formData.trip_number) cleanedData.trip_number = formData.trip_number;
    if (formData.escort_name) cleanedData.escort_name = formData.escort_name;
    if (formData.escort_phone) cleanedData.escort_phone = formData.escort_phone;
    if (formData.service_type) cleanedData.service_type = formData.service_type;
    if (formData.status) cleanedData.status = formData.status;
    if (formData.base_price) cleanedData.base_price = formData.base_price;
    if (formData.available_seats) cleanedData.available_seats = formData.available_seats;
    if (formData.notes) cleanedData.notes = formData.notes;
    if (formData.drivers) cleanedData.drivers = formData.drivers;

    // Add user_id for new trips
    if (!editingTrip) {
      cleanedData.user_id = user.id;
    }

    try {
      if (editingTrip) {
        console.log('Updating trip with data:', cleanedData);
        const success = await updateTrip(editingTrip.id, cleanedData);
        if (success) {
          setIsDialogOpen(false);
          setEditingTrip(null);
          toast.success("Trip updated successfully");
          fetchTrips();
          fetchRoutes();
          fetchBuses();
          fetchDrivers();
        }
      } else {
        const success = await createTrip(cleanedData);
        if (success) {
          setIsDialogOpen(false);
          toast.success("Trip created successfully");
          fetchTrips();
          fetchRoutes();
          fetchBuses();
          fetchDrivers();
        }
      }
    } catch (error) {
      console.error("Error submitting trip:", error);
      toast.error("Failed to save trip");
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOccupancyColor = (trip: any) => {
    const totalSeats = trip.bus?.capacity || 0;
    const bookedSeats = totalSeats - trip.available_seats;
    const percentage = totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;

    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  const formatTime = (dateTimeString: string) => {
    try {
      const date = parseISO(dateTimeString);
      return format(date, "HH:mm");
    } catch {
      return dateTimeString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  // Add debug log before rendering
  console.log("routes", routes, "drivers", drivers);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {/* Status Filter Dropdown */}
        <Select
          value={statusFilter === "all" ? undefined : statusFilter}
          onValueChange={(v) =>
            setStatusFilter((v as typeof statusFilter) || "all")
          }
        >
          <SelectTrigger className="w-48 rounded-lg border border-[#B7FFD2] shadow-sm bg-white text-sm font-medium">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
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
          {/* Refresh Button */}
          <Button
            onClick={() => {
              fetchTrips();
            }}
            variant="outline"
            className="bg-white border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white shadow-lg rounded-lg px-4 py-2 font-semibold transition-all duration-300"
          >
            <Loader2 className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          {/* Add Button */}
          <Button
            onClick={handleAddTrip}
            className="bg-white border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white shadow-lg rounded-lg px-4 py-2 font-semibold transition-all duration-300"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Trip
          </Button>
        </div>
      </div>

      {/* All Trips View */}
      <div className="space-y-4">
        <Card className="bg-white rounded-xl shadow-lg border-0 p-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#008F37]" />
              All Trips ({filteredTrips.length})
            </CardTitle>
            <CardDescription>
              View and manage all trips in the system
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="flex flex-col min-h-screen">
          <div className="flex-1">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-[#008F37]" />
                <p className="text-gray-600 mt-2">Loading trips...</p>
              </div>
            ) : paginatedTrips.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-600">
                No trips found
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedTrips.map((trip) => (
                  <Card
                    key={trip.id}
                    className="bg-white rounded-xl shadow border p-4 flex flex-col justify-between min-h-[180px]"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-semibold text-base truncate">
                        {trip.route?.route_name
                          || (trip.route_id && typeof trip.route_id === 'object'
                            ? `${trip.route_id.origin?.name || 'Unknown'} → ${trip.route_id.destination?.name || 'Unknown'}`
                            : 'Unknown')}
                      </div>
                      <Badge
                        className={`${getStatusColor(
                          trip.status
                        )} rounded-full px-3 py-1 font-semibold text-xs`}
                      >
                        {trip.status
                          ? trip.status.replace("_", " ")
                          : "Unknown"}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      Trip ID: {trip.id}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      Fare: {typeof trip.fare === 'number' || typeof trip.fare === 'string' ? trip.fare : 'N/A'}
                    </div>
                    <div className="flex flex-col gap-1 text-sm mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#008F37]" />
                        <span>{formatDate(trip.departure_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#008F37]" />
                        <span>
                          {trip.departure_time?.substring(0, 5)} -{" "}
                          {trip.arrival_time?.substring(0, 5) || "--:--"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bus className="h-4 w-4 text-[#008F37]" />
                        <span>
                          Bus: {trip.bus?.registration_number
                            || (trip.bus_id && typeof trip.bus_id === 'object'
                              ? trip.bus_id.registration_number
                              : 'Unknown')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[#008F37]" />
                        <span>
                          Driver: {trip.drivers?.find((d: any) => d.is_primary === 1)?.driver_name
                            || (trip.driver_id && typeof trip.driver_id === 'object'
                              ? `${trip.driver_id.firstname || ''} ${trip.driver_id.lastname || ''}`
                              : 'Unknown')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTrip(trip)}
                        className="flex-1 border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white rounded-lg px-2 py-1 font-semibold transition-all duration-300"
                      >
                        <Edit className="mr-1 h-4 w-4" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTrip(trip)}
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
                      <th className="px-4 py-2 text-left">Route</th>
                      <th className="px-4 py-2 text-left">Bus</th>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Departure</th>
                      <th className="px-4 py-2 text-left">Fare</th>
                      <th className="px-4 py-2 text-left">Driver</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTrips.map((trip) => (
                      <tr
                        key={trip.id}
                        className="border-t hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-2 font-medium">
                          {trip.route?.route_name
                            || (trip.route_id && typeof trip.route_id === 'object'
                              ? `${trip.route_id.origin?.name || 'Unknown'} → ${trip.route_id.destination?.name || 'Unknown'}`
                              : 'Unknown')}
                        </td>
                        <td className="px-4 py-2 text-gray-600">
                          {trip.bus?.registration_number
                            || (trip.bus_id && typeof trip.bus_id === 'object'
                              ? trip.bus_id.registration_number
                              : 'N/A')}
                        </td>
                        <td className="px-4 py-2">
                          {formatDate(trip.departure_date)}
                        </td>
                        <td className="px-4 py-2">
                          {trip.departure_time?.substring(0, 5) || "N/A"}
                        </td>
                        <td className="px-4 py-2">
                          {typeof trip.fare === 'number' || typeof trip.fare === 'string' ? trip.fare : 'N/A'}
                        </td>
                        <td className="px-4 py-2">
                          {trip.drivers?.find((d: any) => d.is_primary === 1)?.driver_name
                            || (trip.driver_id && typeof trip.driver_id === 'object'
                              ? `${trip.driver_id.firstname || ''} ${trip.driver_id.lastname || ''}`
                              : 'N/A')}
                        </td>
                        <td className="px-4 py-2">
                          <Badge
                            className={`${getStatusColor(
                              trip.status
                            )} rounded-full px-3 py-1 font-semibold text-xs`}
                          >
                            {trip.status || "Unknown"}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTrip(trip)}
                            className="border-gray-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTrip(trip)}
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
          </div>
          {/* Pagination Controls - always at the bottom */}
          {totalPages > 1 && (
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
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 ${
                    currentPage === i + 1
                      ? "bg-[#008F37] text-white"
                      : "border border-[#008F37] text-[#008F37]"
                  }`}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="border border-[#008F37] text-[#008F37] px-3 py-1"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTrip ? "Edit Trip" : "Add New Trip"}
            </DialogTitle>
            <DialogDescription>
              {editingTrip ? "Update trip information" : "Create a new trip"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="route">Route *</Label>
                {editingTrip ? (
                  <Input
                    id="route"
                    value={(() => {
                      if (editingTrip.route) {
                        let originName = "";
                        let destinationName = "";
                        if (
                          editingTrip.route.origin &&
                          typeof editingTrip.route.origin === "object"
                        ) {
                          originName =
                            (editingTrip.route.origin as any).name ||
                            (editingTrip.route.origin as any)._id ||
                            "";
                        } else {
                          originName = editingTrip.route.origin || "";
                        }
                        if (
                          editingTrip.route.destination &&
                          typeof editingTrip.route.destination === "object"
                        ) {
                          destinationName =
                            (editingTrip.route.destination as any).name ||
                            (editingTrip.route.destination as any)._id ||
                            "";
                        } else {
                          destinationName = editingTrip.route.destination || "";
                        }
                        return `${originName} - ${destinationName}`;
                      }
                      const r = routes.find(
                        (r: any) => r.id === formData.route_id
                      );
                      if (r) {
                        let originName = "";
                        let destinationName = "";
                        if (r.origin && typeof r.origin === "object") {
                          originName =
                            (r.origin as any).name ||
                            (r.origin as any)._id ||
                            "";
                        } else {
                          originName = r.origin || "";
                        }
                        if (
                          r.destination &&
                          typeof r.destination === "object"
                        ) {
                          destinationName =
                            (r.destination as any).name ||
                            (r.destination as any)._id ||
                            "";
                        } else {
                          destinationName = r.destination || "";
                        }
                        return `${originName} - ${destinationName}`;
                      }
                      if (formData.route_id) return "Loading...";
                      return "Unknown";
                    })()}
                    readOnly
                    className="w-full bg-gray-100"
                  />
                ) : (
                  <Select
                    value={formData.route_id}
                    onValueChange={(value) =>
                      handleInputChange("route_id", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((route: any) => {
                        let originName = "";
                        let destinationName = "";
                        if (
                          route.origin &&
                          typeof route.origin === "object" &&
                          "name" in route.origin
                        ) {
                          originName = route.origin.name;
                        } else {
                          originName = route.origin || "";
                        }
                        if (
                          route.destination &&
                          typeof route.destination === "object" &&
                          "name" in route.destination
                        ) {
                          destinationName = route.destination.name;
                        } else {
                          destinationName = route.destination || "";
                        }
                        return (
                          <SelectItem
                            key={route.id || route._id}
                            value={route.id || route._id}
                          >
                            {originName + " - " + destinationName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {/* Bus Field */}
              <div className="space-y-2">
                <Label htmlFor="bus">Bus *</Label>
                {editingTrip ? (
                  <Input
                    id="bus"
                    value={(() => {
                      if (editingTrip.bus) {
                        return `${editingTrip.bus.registration_number} (${editingTrip.bus.manufacturer} ${editingTrip.bus.model})`;
                      }
                      const b = buses.find((b) => b.id === formData.bus_id);
                      if (b)
                        return `${b.registration_number} (${b.manufacturer} ${b.model})`;
                      if (formData.bus_id) return "Loading...";
                      return "Unknown";
                    })()}
                    readOnly
                    className="w-full bg-gray-100"
                  />
                ) : (
                  <Select
                    value={formData.bus_id}
                    onValueChange={(value) =>
                      handleInputChange("bus_id", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bus" />
                    </SelectTrigger>
                    <SelectContent>
                      {buses.map((bus) => (
                        <SelectItem key={bus.id} value={bus.id}>
                          {bus.registration_number} ({bus.manufacturer}{" "}
                          {bus.model})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !tripDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {tripDate ? (
                        format(tripDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={tripDate}
                      onSelect={setTripDate}
                      initialFocus
                      disabled={(date) => date < startOfDay(new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrivalTime">Arrival Time *</Label>
                <Select
                  value={arrivalTime}
                  onValueChange={(value) => setArrivalTime(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departureTime">Departure Time *</Label>
                <Select
                  value={departureTime}
                  onValueChange={(value) => setDepartureTime(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fare">Fare *</Label>
                <Input
                  id="fare"
                  type="number"
                  min="0"
                  value={formData.fare || ""}
                  onChange={e => handleInputChange("fare", e.target.value)}
                  placeholder="Enter fare amount"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.base_price}
                  onChange={(e) =>
                    handleInputChange("base_price", e.target.value)
                  }
                  className="w-full"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableSeats">Available Seats *</Label>
                <Input
                  id="availableSeats"
                  type="number"
                  min="0"
                  value={formData.available_seats}
                  onChange={(e) =>
                    handleInputChange(
                      "available_seats",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full"
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    handleInputChange(
                      "status",
                      value as "active" | "inactive" | "completed" | "cancelled"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  type="text"
                  value={formData.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="w-full"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tripNumber">Trip Number</Label>
                <Input
                  id="tripNumber"
                  type="text"
                  value={formData.trip_number || ""}
                  readOnly
                  className="w-full bg-gray-100"
                  placeholder="Auto-generated or set by system"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="escortName">Escort Name</Label>
                <Input
                  id="escortName"
                  type="text"
                  value={formData.escort_name || ""}
                  onChange={(e) =>
                    handleInputChange("escort_name", e.target.value)
                  }
                  className="w-full"
                  placeholder="Escort name (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="escortPhone">Escort Phone</Label>
                <Input
                  id="escortPhone"
                  type="text"
                  value={formData.escort_phone || ""}
                  onChange={(e) =>
                    handleInputChange("escort_phone", e.target.value)
                  }
                  className="w-full"
                  placeholder="Escort phone (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <Select
                  value={formData.service_type}
                  onValueChange={(value) =>
                    handleInputChange("service_type", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrivalDate">Arrival Date</Label>
                <Input
                  id="arrivalDate"
                  type="date"
                  value={formData.arrival_date || ""}
                  onChange={(e) =>
                    handleInputChange("arrival_date", e.target.value)
                  }
                  className="w-full"
                  placeholder="Arrival date (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="drivers">Primary Driver *</Label>
                <Select
                  value={
                    formData.drivers?.find((d: any) => d.is_primary === 1)
                      ?.driver_id || ""
                  }
                  onValueChange={(value) => {
                    const selectedDriver = drivers.find((d) => d.id === value);
                    if (selectedDriver) {
                      setFormData((prev: typeof formData) => ({
                        ...prev,
                        drivers: [
                          {
                            driver_id: selectedDriver.id,
                            driver_name: `${selectedDriver.firstname} ${selectedDriver.lastname}`,
                            is_primary: 1,
                          },
                        ],
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver: any) => (
                      <SelectItem
                        key={driver.id || driver._id}
                        value={driver.id || driver._id}
                      >
                        {(driver.firstname || "") +
                          " " +
                          (driver.lastname || "") +
                          (driver.license_number
                            ? ` (${driver.license_number})`
                            : "")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {tripDate && departureTime && arrivalTime && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Selected Schedule:</span>
                  <span>
                    {tripDate ? format(tripDate, "MMM dd, yyyy") : ""} •{" "}
                    {arrivalTime} - {departureTime}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="bg-white border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white rounded-lg px-4 py-2 font-semibold transition hover:shadow-lg"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-[#008F37] text-white font-semibold rounded-lg px-4 py-2 transition-all duration-300 hover:bg-[#00662A]"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {editingTrip ? "Update Trip" : "Add Trip"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              schedule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setDeleteDialogOpen(false)}
              className="bg-white border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white rounded-lg px-4 py-2 font-semibold transition hover:shadow-lg"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 font-semibold transition hover:shadow-lg"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
