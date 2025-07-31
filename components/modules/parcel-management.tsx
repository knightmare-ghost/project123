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
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  MapPin,
  Weight,
  Truck,
  Loader2,
} from "lucide-react";
import { Parcel, CreateParcelData } from "@/types";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function ParcelManagement({
  searchTerm,
  onSearch,
}: {
  searchTerm: string;
  onSearch: (value: string) => void;
}) {
  const { user } = useAuth();
  const mockParcels: Parcel[] = [
    {
        id: "1",
        user_id: "u1",
        trip_id: "TRIP-001",
        origin: "Accra Central",
        destination: "Kumasi Central",
        sender_name: "John Mensah",
        sender_phone: "+233241234567",
        receiver_name: "Mary Asante",
        receiver_phone: "+233209876543",
        parcel_description: "Books and documents",
        parcel_weight: "2.5",
        dimension: "30x20x10 cm",
        parcel_fees: "25.00",
        status: "pending",
        created_at: "2024-06-01T10:00:00Z",
        updated_at: "2024-06-01T10:00:00Z",
      },
      {
        id: "2",
        user_id: "u2",
        trip_id: "TRIP-002",
        origin: "Kumasi Central",
        destination: "Takoradi",
        sender_name: "Kwame Boateng",
        sender_phone: "+233201234567",
        receiver_name: "Ama Serwaa",
        receiver_phone: "+233501234567",
        parcel_description: "Clothing",
        parcel_weight: "1.2",
        dimension: "25x15x8 cm",
        parcel_fees: "18.00",
      status: "in_transit",
        created_at: "2024-06-02T09:00:00Z",
        updated_at: "2024-06-02T09:00:00Z",
      },
      {
        id: "3",
        user_id: "u3",
        trip_id: "TRIP-003",
        origin: "Tamale",
        destination: "Accra Central",
        sender_name: "Abena Korkor",
        sender_phone: "+233301234567",
        receiver_name: "Yaw Osei",
        receiver_phone: "+233401234567",
        parcel_description: "Electronics",
        parcel_weight: "3.0",
        dimension: "40x25x15 cm",
        parcel_fees: "40.00",
        status: "delivered",
        created_at: "2024-06-03T08:00:00Z",
        updated_at: "2024-06-03T08:00:00Z",
      },
    ];

  // Use local mockParcels for all operations
  const [localParcels, setLocalParcels] = useState<Parcel[]>(mockParcels);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "in_transit" | "delivered" | "cancelled"
  >("all");
  const filteredParcels = (localParcels || []).filter((parcel) => {
    const searchMatch =
      (parcel.sender_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (parcel.receiver_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (parcel.origin || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (parcel.destination || '').toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch =
      statusFilter === "all" ? true : parcel.status === statusFilter;

    return searchMatch && statusMatch;
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredParcels.length / itemsPerPage);
  const paginatedParcels = filteredParcels.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingParcel, setEditingParcel] = useState<Parcel | null>(null);
  const [formData, setFormData] = useState<CreateParcelData>({
    user_id: "",
    trip_id: "",
    origin: "",
    destination: "",
    sender_name: "",
    sender_phone: "",
    receiver_name: "",
    receiver_phone: "",
    parcel_description: "",
    parcel_weight: "",
    dimension: "",
    parcel_fees: "",
    status: "pending",
  });

  const [viewingParcel, setViewingParcel] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [parcelToDelete, setParcelToDelete] = useState<Parcel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleInputChange = (
    field: keyof CreateParcelData,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      user_id: "",
      trip_id: "",
      origin: "",
      destination: "",
      sender_name: "",
      sender_phone: "",
      receiver_name: "",
      receiver_phone: "",
      parcel_description: "",
      parcel_weight: "",
      dimension: "",
      parcel_fees: "",
      status: "pending",
    });
  };

  const handleAddParcel = () => {
    setEditingParcel(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditParcel = (parcel: Parcel) => {
    setEditingParcel(parcel);
    setFormData({
      user_id: parcel.user_id,
      trip_id: parcel.trip_id,
      origin: parcel.origin,
      destination: parcel.destination,
      sender_name: parcel.sender_name,
      sender_phone: parcel.sender_phone,
      receiver_name: parcel.receiver_name,
      receiver_phone: parcel.receiver_phone,
      parcel_description: parcel.parcel_description,
      parcel_weight: parcel.parcel_weight,
      dimension: parcel.dimension,
      parcel_fees: parcel.parcel_fees,
      status: parcel.status,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteParcel = (parcel: Parcel) => {
    setParcelToDelete(parcel);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (parcelToDelete) {
      setLocalParcels((prev) => prev.filter((p) => p.id !== parcelToDelete.id));
      toast.success(`Parcel "${parcelToDelete.parcel_description}" deleted successfully`);
      setIsDeleteDialogOpen(false);
      setParcelToDelete(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("User authentication required");
      return;
    }
    const submitData = {
      ...formData,
      user_id: user.id,
      id: editingParcel ? editingParcel.id : (Math.random().toString(36).substr(2, 9)),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (editingParcel) {
      setLocalParcels((prev) => prev.map((p) => p.id === editingParcel.id ? { ...p, ...submitData } : p));
      toast.success(`Parcel "${submitData.parcel_description}" updated successfully.`);
    } else {
      setLocalParcels((prev) => [...prev, submitData]);
      toast.success(`Parcel "${submitData.parcel_description}" created successfully.`);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Add Button and Filter */}
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className="border border-[#008F37] text-[#008F37] px-3 py-1"
            >
                {viewMode === 'list' ? 'Grid View' : 'List View'}
            </Button>

            {/* Action Buttons */}
            <Button
                onClick={handleAddParcel}
                disabled={false}
                className="bg-gradient-to-r from-[#1D976C] to-[#93F9B9] hover:from-[#008F37] hover:to-[#00662A] text-white shadow-lg rounded-lg px-4 py-2 font-semibold transition-all duration-300"
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Parcel
            </Button>
        </div>
      </div>

      {/* Loading State */}
      {/* (No loading state for mock data) */}

      {/* Parcels Display */}
      {paginatedParcels.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedParcels.map((parcel) => (
              <Card
                key={parcel.id}
                className="bg-white rounded-xl shadow border p-4 flex flex-col justify-between min-h-[140px]"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold text-base truncate">{parcel.parcel_description}</div>
                  <Badge className={`${getStatusColor(parcel.status)} rounded-full px-3 py-1 font-semibold text-xs`}>{parcel.status || 'Unknown'}</Badge>
                </div>
                <div className="text-xs text-gray-500 mb-1">Sender: {parcel.sender_name}</div>
                <div className="flex items-center gap-2 text-sm mb-2">
                  <span>Receiver: {parcel.receiver_name}</span>
                </div>
                <div className="flex gap-2 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditParcel(parcel)}
                    disabled={false}
                    className="flex-1 border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white rounded-lg px-2 py-1 font-semibold transition-all duration-300"
                  >
                    <Edit className="mr-1 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteParcel(parcel)}
                    disabled={false}
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
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Sender</th>
                  <th className="px-4 py-2 text-left">Receiver</th>
                  <th className="px-4 py-2 text-left">Origin</th>
                  <th className="px-4 py-2 text-left">Destination</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedParcels.map(parcel => (
                  <tr key={parcel.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 font-medium">{parcel.parcel_description}</td>
                    <td className="px-4 py-2">{parcel.sender_name}</td>
                    <td className="px-4 py-2">{parcel.receiver_name}</td>
                    <td className="px-4 py-2">{parcel.origin}</td>
                    <td className="px-4 py-2">{parcel.destination}</td>
                    <td className="px-4 py-2">
                      <Badge className={`${getStatusColor(parcel.status)} rounded-full px-3 py-1 font-semibold text-xs`}>{parcel.status || 'Unknown'}</Badge>
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => handleEditParcel(parcel)} className="border-gray-300"><Edit className="h-4 w-4" /></Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => handleDeleteParcel(parcel)} className="border-gray-300"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <Card className="bg-white rounded-xl shadow-lg border-0 p-6">
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No parcels found
            </h3>
            <p className="text-gray-500">
              {(mockParcels || []).length === 0
                ? "No parcels have been added yet."
                : "No parcels match your search criteria."}
            </p>
          </div>
        </Card>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 mb-8">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button key={i + 1} variant={currentPage === i + 1 ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(i + 1)}>{i + 1}</Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
        </div>
      )}

      {/* Add/Edit Parcel Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingParcel ? "Edit Parcel" : "Add New Parcel"}
            </DialogTitle>
            <DialogDescription>
              {editingParcel
                ? "Update parcel information below."
                : "Fill in the parcel information below."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senderName">Sender Name</Label>
                <Input
                  id="senderName"
                  placeholder="e.g., John Mensah"
                  value={formData.sender_name}
                  onChange={(e) =>
                    handleInputChange("sender_name", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="senderPhone">Sender Phone</Label>
                <Input
                  id="senderPhone"
                  placeholder="+233 24 123 4567"
                  value={formData.sender_phone}
                  onChange={(e) =>
                    handleInputChange("sender_phone", e.target.value)
                  }
                  required
                />
            </div>

              <div className="space-y-2">
                <Label htmlFor="receiverName">Receiver Name</Label>
                <Input
                  id="receiverName"
                  placeholder="e.g., Mary Asante"
                  value={formData.receiver_name}
                  onChange={(e) =>
                    handleInputChange("receiver_name", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiverPhone">Receiver Phone</Label>
                <Input
                  id="receiverPhone"
                  placeholder="+233 20 987 6543"
                  value={formData.receiver_phone}
                  onChange={(e) =>
                    handleInputChange("receiver_phone", e.target.value)
                  }
                  required
                />
            </div>

                <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  placeholder="e.g., Accra Central"
                  value={formData.origin}
                  onChange={(e) => handleInputChange("origin", e.target.value)}
                  required
                  />
                </div>

                  <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                    <Input
                  id="destination"
                  placeholder="e.g., Kumasi Central"
                  value={formData.destination}
                  onChange={(e) =>
                    handleInputChange("destination", e.target.value)
                  }
                  required
                />
                </div>

                <div className="space-y-2">
                <Label htmlFor="tripId">Trip ID</Label>
                <Input
                  id="tripId"
                  placeholder="e.g., TRIP-001"
                  value={formData.trip_id}
                  onChange={(e) => handleInputChange("trip_id", e.target.value)}
                  required
                />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  placeholder="0.5"
                  value={formData.parcel_weight}
                  onChange={(e) =>
                    handleInputChange("parcel_weight", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fees">Fees (₵)</Label>
                <Input
                  id="fees"
                  type="number"
                  step="0.01"
                  placeholder="25.00"
                  value={formData.parcel_fees}
                  onChange={(e) =>
                    handleInputChange("parcel_fees", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimension">Dimensions</Label>
              <Input
                id="dimension"
                placeholder="e.g., 15x10x5 cm"
                value={formData.dimension}
                onChange={(e) => handleInputChange("dimension", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the parcel contents..."
                value={formData.parcel_description}
                onChange={(e) =>
                  handleInputChange("parcel_description", e.target.value)
                }
                required
              />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
              Cancel
            </Button>
              <Button
                type="submit"
                className="bg-[#008F37] text-white font-semibold rounded-lg px-4 py-2 transition-all duration-300 hover:bg-[#00662A]"
                disabled={false}
              >
                {editingParcel ? "Update Parcel" : "Add Parcel"}
              </Button>
          </div>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this parcel?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the parcel:
              <span className="font-bold"> "{parcelToDelete?.parcel_description}"</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
