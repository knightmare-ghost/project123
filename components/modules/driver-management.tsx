// Driver Management module restored with full CRUD and latest schema
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient, Driver } from "@/service/api";
import { DatePicker } from "@/components/ui/date-picker";

export default function DriverManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    license_number: "",
    license_expiry_date: "",
    phone_number: "",
    address: "",
    status: "active",
    license_file: "",
    ghana_card_file: "",
    training_certificate_file: "",
  });
  const [loading, setLoading] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [driverDocuments, setDriverDocuments] = useState({
    license: null as File | null,
    ghana_card: null as File | null,
    training_certificate: null as File | null,
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  async function fetchDrivers() {
    setLoading(true);
    try {
      const data = await apiClient.getDrivers();
      setDrivers(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(field: keyof typeof formData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleDriverDocumentChange(field: 'license' | 'ghana_card' | 'training_certificate', file: File | null) {
    setDriverDocuments((prev) => ({ ...prev, [field]: file }));
  }

  function resetForm() {
    setFormData({
      firstname: "",
      lastname: "",
      email: "",
      license_number: "",
      license_expiry_date: "",
      phone_number: "",
      address: "",
      status: "active",
      license_file: "",
      ghana_card_file: "",
      training_certificate_file: "",
    });
    setDriverDocuments({ license: null, ghana_card: null, training_certificate: null });
  }

  function handleAddDriver() {
    setEditingDriver(null);
    resetForm();
    setIsDialogOpen(true);
  }

  function handleEditDriver(driver: Driver) {
    setEditingDriver(driver);
    setFormData({
      firstname: driver.firstname,
      lastname: driver.lastname,
      email: driver.email,
      license_number: driver.license_number,
      license_expiry_date: driver.license_expiry_date,
      phone_number: driver.phone_number,
      address: driver.address,
      status: driver.status,
      license_file: driver.license_file || "",
      ghana_card_file: driver.ghana_card_file || "",
      training_certificate_file: driver.training_certificate_file || "",
    });
    setIsDialogOpen(true);
  }

  function handleDeleteDriver(driver: Driver) {
    setDriverToDelete(driver);
    setIsDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!driverToDelete) return;
    setLoading(true);
    try {
      await apiClient.deleteDriver(driverToDelete.id);
      toast.success("Driver deleted successfully");
      fetchDrivers();
    } catch (e) {
      toast.error("Failed to delete driver");
    } finally {
      setIsDeleteDialogOpen(false);
      setDriverToDelete(null);
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const submitData = {
      ...formData,
      license_file: driverDocuments.license ? driverDocuments.license.name : '',
      ghana_card_file: driverDocuments.ghana_card ? driverDocuments.ghana_card.name : '',
      training_certificate_file: driverDocuments.training_certificate ? driverDocuments.training_certificate.name : '',
    };
    try {
      if (editingDriver) {
        await apiClient.updateDriver(editingDriver.id, submitData);
        toast.success("Driver updated successfully");
      } else {
        await apiClient.createDriver(submitData);
        toast.success("Driver created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
      fetchDrivers();
    } catch (e) {
      toast.error("Failed to save driver");
    } finally {
      setLoading(false);
    }
  }

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(drivers.length / itemsPerPage);
  const paginatedDrivers = drivers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header - Add Button and View Toggle */}
      <div className="flex justify-end items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          className="border border-[#008F37] text-[#008F37] px-3 py-1"
        >
          {viewMode === 'list' ? 'Grid View' : 'List View'}
        </Button>
        <Button
          onClick={handleAddDriver}
          disabled={loading}
          className="bg-gradient-to-r from-[#1D976C] to-[#93F9B9] hover:from-[#008F37] hover:to-[#00662A] text-white shadow-lg rounded-lg px-4 py-2 font-semibold transition-all duration-300"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Add Driver
        </Button>
      </div>
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#008F37]" />
          <span className="ml-2 text-gray-600">Loading drivers...</span>
        </div>
      )}
      {/* Drivers Display */}
      {!loading && paginatedDrivers.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedDrivers.map((driver) => (
              <Card key={driver.id} className="bg-white rounded-xl shadow border p-4 flex flex-col justify-between min-h-[140px]">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold text-base truncate">{driver.firstname} {driver.lastname}</div>
                  <span className="text-xs text-gray-500">{driver.status}</span>
                </div>
                <div className="text-xs text-gray-500 mb-1">License: {driver.license_number} | Expiry: {driver.license_expiry_date}</div>
                <div className="text-xs">Phone: {driver.phone_number} | Email: {driver.email}</div>
                <div className="flex gap-2 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditDriver(driver)}
                    disabled={loading}
                    className="flex-1 border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white rounded-lg px-2 py-1 font-semibold transition-all duration-300"
                  >
                    <Edit className="mr-1 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteDriver(driver)}
                    disabled={loading}
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
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">License</th>
                  <th className="px-4 py-2 text-left">Expiry</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDrivers.map(driver => (
                  <tr key={driver.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 font-medium">{driver.firstname} {driver.lastname}</td>
                    <td className="px-4 py-2">{driver.license_number}</td>
                    <td className="px-4 py-2">{driver.license_expiry_date}</td>
                    <td className="px-4 py-2">{driver.phone_number}</td>
                    <td className="px-4 py-2">{driver.email}</td>
                    <td className="px-4 py-2">{driver.status}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => handleEditDriver(driver)} className="border-gray-300"><Edit className="h-4 w-4" /></Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => handleDeleteDriver(driver)} className="border-gray-300"><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
            <span className="h-12 w-12 text-gray-400 mx-auto mb-4">🧑‍✈️</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No drivers found
            </h3>
            <p className="text-gray-500">
              {drivers.length === 0
                ? "No drivers have been added yet."
                : "No drivers match your search criteria."}
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>{editingDriver ? "Edit Driver" : "Add New Driver"}</DialogTitle>
            <DialogDescription>Fill in the driver details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={formData.firstname} onChange={e => handleInputChange("firstname", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={formData.lastname} onChange={e => handleInputChange("lastname", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={formData.email} onChange={e => handleInputChange("email", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>License Number</Label>
                <Input value={formData.license_number} onChange={e => handleInputChange("license_number", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>License Expiry Date</Label>
                <DatePicker
                  date={formData.license_expiry_date ? new Date(formData.license_expiry_date) : undefined}
                  onDateChange={(date: Date | undefined) => handleInputChange("license_expiry_date", date ? date.toISOString().slice(0, 10) : "")}
                  placeholder="Select date"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={formData.phone_number} onChange={e => handleInputChange("phone_number", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={formData.address} onChange={e => handleInputChange("address", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={v => handleInputChange("status", v)}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-4 border-t pt-4 mt-4">
                <Label>Driver Documents</Label>
                <div className="flex items-center gap-4 w-full">
                  <Label htmlFor="license" className="w-1/4 min-w-[120px]">License</Label>
                  <div className="flex-1 relative">
                    <input
                      id="license"
                      type="file"
                      onChange={e => handleDriverDocumentChange('license', e.target.files ? e.target.files[0] : null)}
                      className="w-full text-sm text-gray-700 file:bg-green-50 file:text-green-700 file:font-semibold file:rounded-full file:border-0 file:py-2 file:px-4 hover:file:bg-green-100 file:mr-4 pr-32 cursor-pointer appearance-none"
                      style={{ color: 'transparent' }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none select-none whitespace-nowrap">
                      {driverDocuments.license ? driverDocuments.license.name : 'No file chosen'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full">
                  <Label htmlFor="ghanaCard" className="w-1/4 min-w-[120px]">Ghana Card</Label>
                  <div className="flex-1 relative">
                    <input
                      id="ghanaCard"
                      type="file"
                      onChange={e => handleDriverDocumentChange('ghana_card', e.target.files ? e.target.files[0] : null)}
                      className="w-full text-sm text-gray-700 file:bg-green-50 file:text-green-700 file:font-semibold file:rounded-full file:border-0 file:py-2 file:px-4 hover:file:bg-green-100 file:mr-4 pr-32 cursor-pointer appearance-none"
                      style={{ color: 'transparent' }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none select-none whitespace-nowrap">
                      {driverDocuments.ghana_card ? driverDocuments.ghana_card.name : 'No file chosen'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full">
                  <Label htmlFor="trainingCertificate" className="w-1/4 min-w-[120px]">Training Certificate</Label>
                  <div className="flex-1 relative">
                    <input
                      id="trainingCertificate"
                      type="file"
                      onChange={e => handleDriverDocumentChange('training_certificate', e.target.files ? e.target.files[0] : null)}
                      className="w-full text-sm text-gray-700 file:bg-green-50 file:text-green-700 file:font-semibold file:rounded-full file:border-0 file:py-2 file:px-4 hover:file:bg-green-100 file:mr-4 pr-32 cursor-pointer appearance-none"
                      style={{ color: 'transparent' }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none select-none whitespace-nowrap">
                      {driverDocuments.training_certificate ? driverDocuments.training_certificate.name : 'No file chosen'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button
                type="submit"
                className="bg-[#008F37] text-white font-semibold rounded-lg px-4 py-2 transition-all duration-300 hover:bg-[#00662A]"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingDriver ? "Update Driver" : "Add Driver")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Driver</DialogTitle>
            <DialogDescription>Are you sure you want to delete this driver? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button type="button" className="bg-red-600 text-white" onClick={confirmDelete} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 