// Bus Management module with consistent grid/list view and button styling
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Loader2, Bus, Settings, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ConfirmCloseDialog, handleDialogClose } from "@/components/utils/modal-helpers";
import { apiClient, Bus as BusType, Company, BusConfiguration } from "@/service/api";
import BusConfigurationManagement from "@/components/modules/bus-configuration-management";

// Define an interface for the form data
interface BusFormData {
  bus_number: string; // Changed from registration_number
  model: string;
  capacity: number;
  year: number;
  status: string;
  fleet_number: string;
  manufacturer: string;
  station_name: string; // New required field
  fuel_type: string; // New required field
  body_type: string; // New field
  chassis_number: string; // New field
  engine_number: string; // New field
  tracking_device_number: string; // New field
  purchase_date: string; // New field
  next_maintenance: string;
  mileage: string;
  owner: string;
  amenities: string;
  company_id: string;
  insurance_file: string | File;
  roadworthy_file: string | File;
  ecowas_file: string | File;
  configuration_id: string;
}

export default function BusManagement() {
  const [buses, setBuses] = useState<BusType[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [configurations, setConfigurations] = useState<BusConfiguration[]>([]);
  const [terminals, setTerminals] = useState<any[]>([]);
  
  // Predefined lists for dropdowns
  const manufacturers = [
    "Daewoo", "Scania", "Volvo", "Mercedes-Benz", "MAN", "Yutong", 
    "Ashok Leyland", "Tata Motors", "Iveco", "VDL", "Zhongtong", "Other"
  ];
  
  const busModels = [
    "Marcopolo Paradiso", "Irizar i6", "Neoplan Skyliner", "Volvo 9700", 
    "Mercedes-Benz Tourismo", "MAN Lion's Coach", "Scania Touring", 
    "Yutong ZK6122H9", "King Long XMQ6130Y", "VDL Futura", "Other"
  ];
  
  const bodyTypes = [
    "Coach", "Double-decker", "Minibus", "Articulated", "Midi", "Shuttle", "Other"
  ];
  
  const fuelTypes = [
    "Diesel", "Petrol", "CNG", "Electric", "Hybrid", "Biodiesel", "Other"
  ];
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmCloseDialogOpen, setIsConfirmCloseDialogOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<BusType | null>(null);
  const [formData, setFormData] = useState<BusFormData>({
    bus_number: "",
    model: "",
    capacity: 0,
    year: 0,
    status: "active",
    fleet_number: "",
    manufacturer: "",
    station_name: "",
    fuel_type: "",
    body_type: "",
    chassis_number: "",
    engine_number: "",
    tracking_device_number: "",
    purchase_date: "",
    next_maintenance: "",
    mileage: "",
    owner: "",
    amenities: "",
    company_id: "",
    insurance_file: "",
    roadworthy_file: "",
    ecowas_file: "",
    configuration_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [busToDelete, setBusToDelete] = useState<BusType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showConfigurations, setShowConfigurations] = useState(false);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(buses.length / itemsPerPage);
  const paginatedBuses = buses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const [busDocuments, setBusDocuments] = useState({
    insurance: null as File | null,
    roadworthy: null as File | null,
    ecowas: null as File | null,
  });

  useEffect(() => {
    fetchBuses();
    fetchCompanies();
    fetchConfigurations();
    fetchTerminals();
  }, []);

  async function fetchBuses() {
    setLoading(true);
    try {
      const data = await apiClient.getBuses();
      setBuses(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to fetch buses");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCompanies() {
    try {
      const data = await apiClient.getCompanies();
      setCompanies(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to fetch companies");
    }
  }

  async function fetchConfigurations() {
    try {
      const data = await apiClient.getBusConfigurations();
      setConfigurations(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to fetch bus configurations");
    }
  }
  
  async function fetchTerminals() {
    try {
      const data = await apiClient.getTerminals();
      // Filter to only include stations
      const stations = data.filter(terminal => terminal.is_station);
      setTerminals(stations);
    } catch (e) {
      toast.error("Failed to fetch stations");
    }
  }

  function handleInputChange(field: keyof BusFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleBusDocumentChange(field: 'insurance' | 'roadworthy' | 'ecowas', file: File | null) {
    setBusDocuments((prev) => ({ ...prev, [field]: file }));
  }

  function resetForm() {
    setFormData({
      bus_number: "",
      model: "",
      capacity: 0,
      year: 0,
      status: "active",
      fleet_number: "",
      manufacturer: "",
      station_name: "",
      fuel_type: "",
      body_type: "",
      chassis_number: "",
      engine_number: "",
      tracking_device_number: "",
      purchase_date: "",
      next_maintenance: "",
      mileage: "",
      owner: "",
      amenities: "",
      company_id: "",
      insurance_file: "",
      roadworthy_file: "",
      ecowas_file: "",
      configuration_id: "",
    });
    setBusDocuments({ insurance: null, roadworthy: null, ecowas: null });
  }

  function handleAddBus() {
    setEditingBus(null);
    resetForm();
    setIsDialogOpen(true);
  }

  function handleEditBus(bus: BusType) {
    setEditingBus(bus);
    
    // Map registration_number to bus_number if needed
    const busNumber = (bus as any).bus_number || bus.registration_number || "";
    
    setFormData({
      ...bus,
      bus_number: busNumber,
      // Set default values for new fields if they don't exist
      station_name: (bus as any).station_name || "",
      fuel_type: (bus as any).fuel_type || "",
      body_type: (bus as any).body_type || "",
      chassis_number: (bus as any).chassis_number || "",
      engine_number: (bus as any).engine_number || "",
      tracking_device_number: (bus as any).tracking_device_number || "",
      purchase_date: (bus as any).purchase_date || "",
      // Convert arrays to strings
      amenities: Array.isArray(bus.amenities) ? bus.amenities.join(", ") : "",
      // Handle file fields
      insurance_file: bus.insurance_file || "",
      roadworthy_file: bus.roadworthy_file || "",
      ecowas_file: bus.ecowas_file || "",
      configuration_id: bus.configuration_id || "",
    });
    setIsDialogOpen(true);
  }

  function handleDeleteBus(bus: BusType) {
    setBusToDelete(bus);
    setIsDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!busToDelete) return;
    setLoading(true);
    try {
      await apiClient.deleteBus(busToDelete.id);
      toast.success("Bus deleted successfully");
      fetchBuses();
    } catch (e) {
      toast.error("Failed to delete bus");
    } finally {
      setIsDeleteDialogOpen(false);
      setBusToDelete(null);
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.bus_number) {
      toast.error("Bus number is required");
      return;
    }
    
    if (!formData.manufacturer) {
      toast.error("Manufacturer is required");
      return;
    }
    
    if (!formData.configuration_id) {
      toast.error("Please select a bus configuration");
      return;
    }
    
    if (!formData.station_name) {
      toast.error("Station name is required");
      return;
    }
    
    if (!formData.fuel_type) {
      toast.error("Fuel type is required");
      return;
    }
    
    setLoading(true);
    const submitData = {
      ...formData,
      capacity: Number(formData.capacity),
      year: Number(formData.year),
      amenities: formData.amenities.split(",").map((a) => a.trim()).filter(Boolean),
      insurance_file: busDocuments.insurance ? busDocuments.insurance.name : formData.insurance_file,
      roadworthy_file: busDocuments.roadworthy ? busDocuments.roadworthy.name : formData.roadworthy_file,
      ecowas_file: busDocuments.ecowas ? busDocuments.ecowas.name : formData.ecowas_file,
    };
    try {
      if (editingBus) {
        await apiClient.updateBus(editingBus.id, submitData);
        toast.success("Bus updated successfully");
      } else {
        await apiClient.createBus(submitData);
        toast.success("Bus created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
      fetchBuses();
    } catch (e) {
      toast.error("Failed to save bus");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header - Add Button and View Toggle */}
      <div className="flex justify-between items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold">
            {showConfigurations ? (
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowConfigurations(false)}
                  className="mr-2 p-1"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                Bus Configuration Management
              </div>
            ) : (
              "Bus Management"
            )}
          </h1>
        </div>
        <div className="flex gap-2">
          {!showConfigurations && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className="border border-[#008F37] text-[#008F37] px-3 py-1"
              >
                {viewMode === 'list' ? 'Grid View' : 'List View'}
              </Button>
              <Button
                onClick={() => setShowConfigurations(true)}
                className="bg-gradient-to-r from-[#1D976C] to-[#93F9B9] hover:from-[#008F37] hover:to-[#00662A] text-white shadow-lg rounded-lg px-4 py-2 font-semibold transition-all duration-300"
              >
                <Settings className="mr-2 h-4 w-4" />
                Bus Configuration
              </Button>
              <Button
                onClick={handleAddBus}
                disabled={loading}
                className="bg-gradient-to-r from-[#1D976C] to-[#93F9B9] hover:from-[#008F37] hover:to-[#00662A] text-white shadow-lg rounded-lg px-4 py-2 font-semibold transition-all duration-300"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Add Bus
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Show Bus Configuration Management or Bus Management */}
      {showConfigurations ? (
        <BusConfigurationManagement onBack={() => setShowConfigurations(false)} standalone={false} />
      ) : (
        <>
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#008F37]" />
              <span className="ml-2 text-gray-600">Loading buses...</span>
            </div>
          )}

          {/* Buses Display */}
          {!loading && paginatedBuses.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedBuses.map((bus) => (
              <Card key={bus.id} className="bg-white rounded-xl shadow border p-4 flex flex-col justify-between min-h-[140px]">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold text-base truncate">{(bus as any).bus_number || bus.registration_number} ({bus.model})</div>
                  <span className="text-xs text-gray-500">{bus.status}</span>
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  Manufacturer: {bus.manufacturer} | Station: {(bus as any).station_name || "N/A"}
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  Fleet: {bus.fleet_number} | Company: {companies.find(c => c._id === bus.company_id)?.name || bus.company_id}
                </div>
                <div className="text-xs">Capacity: {bus.capacity} | Year: {bus.year}</div>
                <div className="text-xs">Fuel: {(bus as any).fuel_type || "N/A"}</div>
                <div className="flex gap-2 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditBus(bus)}
                    disabled={loading}
                    className="flex-1 border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white rounded-lg px-2 py-1 font-semibold transition-all duration-300"
                  >
                    <Edit className="mr-1 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteBus(bus)}
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
                  <th className="px-4 py-2 text-left">Bus Number</th>
                  <th className="px-4 py-2 text-left">Model</th>
                  <th className="px-4 py-2 text-left">Manufacturer</th>
                  <th className="px-4 py-2 text-left">Station</th>
                  <th className="px-4 py-2 text-left">Fleet</th>
                  <th className="px-4 py-2 text-left">Configuration</th>
                  <th className="px-4 py-2 text-left">Capacity</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBuses.map(bus => (
                  <tr key={bus.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 font-medium">{(bus as any).bus_number || bus.registration_number}</td>
                    <td className="px-4 py-2">{bus.model}</td>
                    <td className="px-4 py-2">{bus.manufacturer}</td>
                    <td className="px-4 py-2">{(bus as any).station_name || "N/A"}</td>
                    <td className="px-4 py-2">{bus.fleet_number}</td>
                    <td className="px-4 py-2">
                      {bus.configuration_id ? 
                        (configurations.find(c => c.id === bus.configuration_id)?.name || 'Config ID: ' + bus.configuration_id) : 
                        <span className="text-red-500">Not configured</span>}
                    </td>
                    <td className="px-4 py-2">{bus.capacity}</td>
                    <td className="px-4 py-2">{bus.status}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => handleEditBus(bus)} className="border-gray-300"><Edit className="h-4 w-4" /></Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => handleDeleteBus(bus)} className="border-gray-300"><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
            <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No buses found
            </h3>
            <p className="text-gray-500">
              {buses.length === 0
                ? "No buses have been added yet."
                : "No buses match your search criteria."}
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
      </>
      )}

      {/* Add/Edit Bus Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={handleDialogClose(
          () => formData.bus_number !== "" || formData.model !== "",
          setIsDialogOpen,
          setIsConfirmCloseDialogOpen
        )}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBus ? "Edit Bus" : "Add New Bus"}</DialogTitle>
            <DialogDescription>Fill in the bus details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="space-y-2">
                <Label>Bus Number <span className="text-red-500">*</span></Label>
                <Input value={formData.bus_number} onChange={e => handleInputChange("bus_number", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Fleet Number</Label>
                <Input value={formData.fleet_number} onChange={e => handleInputChange("fleet_number", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Manufacturer <span className="text-red-500">*</span></Label>
                <Select value={formData.manufacturer} onValueChange={v => handleInputChange("manufacturer", v)} required>
                  <SelectTrigger><SelectValue placeholder="Select manufacturer" /></SelectTrigger>
                  <SelectContent>
                    {manufacturers.map((manufacturer) => (
                      <SelectItem key={manufacturer} value={manufacturer}>{manufacturer}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Model <span className="text-red-500">*</span></Label>
                <Select value={formData.model} onValueChange={v => handleInputChange("model", v)} required>
                  <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
                  <SelectContent>
                    {busModels.map((model) => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Body Type</Label>
                <Select value={formData.body_type} onValueChange={v => handleInputChange("body_type", v)}>
                  <SelectTrigger><SelectValue placeholder="Select body type" /></SelectTrigger>
                  <SelectContent>
                    {bodyTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fuel Type <span className="text-red-500">*</span></Label>
                <Select value={formData.fuel_type} onValueChange={v => handleInputChange("fuel_type", v)} required>
                  <SelectTrigger><SelectValue placeholder="Select fuel type" /></SelectTrigger>
                  <SelectContent>
                    {fuelTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year <span className="text-red-500">*</span></Label>
                <Input type="number" value={formData.year} onChange={e => handleInputChange("year", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Purchase Date</Label>
                <Input type="date" value={formData.purchase_date} onChange={e => handleInputChange("purchase_date", e.target.value)} />
              </div>
              
              {/* Technical Information */}
              <div className="space-y-2">
                <Label>Capacity <span className="text-red-500">*</span></Label>
                <Input type="number" value={formData.capacity} onChange={e => handleInputChange("capacity", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Chassis Number</Label>
                <Input value={formData.chassis_number} onChange={e => handleInputChange("chassis_number", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Engine Number</Label>
                <Input value={formData.engine_number} onChange={e => handleInputChange("engine_number", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tracking Device Number</Label>
                <Input value={formData.tracking_device_number} onChange={e => handleInputChange("tracking_device_number", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Mileage</Label>
                <Input value={formData.mileage} onChange={e => handleInputChange("mileage", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Next Maintenance</Label>
                <Input type="date" value={formData.next_maintenance} onChange={e => handleInputChange("next_maintenance", e.target.value)} />
              </div>
              
              {/* Status and Assignment */}
              <div className="space-y-2">
                <Label>Status <span className="text-red-500">*</span></Label>
                <Select value={formData.status} onValueChange={v => handleInputChange("status", v)}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Station <span className="text-red-500">*</span></Label>
                <Select value={formData.station_name} onValueChange={v => handleInputChange("station_name", v)} required>
                  <SelectTrigger><SelectValue placeholder="Select station" /></SelectTrigger>
                  <SelectContent>
                    {terminals.length > 0 ? (
                      terminals.map((terminal) => (
                        <SelectItem key={terminal.id} value={terminal.name}>{terminal.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No stations available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Select value={formData.company_id} onValueChange={v => handleInputChange("company_id", v)}>
                  <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company._id} value={company._id}>{company.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Owner</Label>
                <Input value={formData.owner} onChange={e => handleInputChange("owner", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Amenities (comma separated)</Label>
                <Input value={formData.amenities} onChange={e => handleInputChange("amenities", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Bus Configuration <span className="text-red-500">*</span></Label>
                <Select value={formData.configuration_id} onValueChange={v => handleInputChange("configuration_id", v)} required>
                  <SelectTrigger><SelectValue placeholder="Select configuration" /></SelectTrigger>
                  <SelectContent>
                    {configurations.length > 0 ? (
                      configurations.map((config) => (
                        <SelectItem key={config.id} value={config.id}>{config.name} ({config.bus_type}, {config.total_seats} seats)</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No configurations available. Please create one first.</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {configurations.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    No bus configurations found. Please create a configuration first.
                  </p>
                )}
              </div>
            </div>
            <div className="md:col-span-2 space-y-4 border-t pt-4 mt-4">
              <Label>Bus Documents</Label>
              <div className="flex items-center gap-4 w-full">
                <Label htmlFor="insurance" className="w-1/4 min-w-[120px]">Insurance</Label>
                <div className="flex-1 relative">
                  <input
                    id="insurance"
                    type="file"
                    onChange={e => handleBusDocumentChange('insurance', e.target.files ? e.target.files[0] : null)}
                    className="w-full text-sm text-gray-700 file:bg-green-50 file:text-green-700 file:font-semibold file:rounded-full file:border-0 file:py-2 file:px-4 hover:file:bg-green-100 file:mr-4 pr-32 cursor-pointer appearance-none"
                    style={{ color: 'transparent' }}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none select-none whitespace-nowrap">
                    {busDocuments.insurance ? busDocuments.insurance.name : 'No file chosen'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full">
                <Label htmlFor="roadworthy" className="w-1/4 min-w-[120px]">Roadworthy Certificate</Label>
                <div className="flex-1 relative">
                  <input
                    id="roadworthy"
                    type="file"
                    onChange={e => handleBusDocumentChange('roadworthy', e.target.files ? e.target.files[0] : null)}
                    className="w-full text-sm text-gray-700 file:bg-green-50 file:text-green-700 file:font-semibold file:rounded-full file:border-0 file:py-2 file:px-4 hover:file:bg-green-100 file:mr-4 pr-32 cursor-pointer appearance-none"
                    style={{ color: 'transparent' }}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none select-none whitespace-nowrap">
                    {busDocuments.roadworthy ? busDocuments.roadworthy.name : 'No file chosen'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full">
                <Label htmlFor="ecowas" className="w-1/4 min-w-[120px]">ECOWAS Brown Card</Label>
                <div className="flex-1 relative">
                  <input
                    id="ecowas"
                    type="file"
                    onChange={e => handleBusDocumentChange('ecowas', e.target.files ? e.target.files[0] : null)}
                    className="w-full text-sm text-gray-700 file:bg-green-50 file:text-green-700 file:font-semibold file:rounded-full file:border-0 file:py-2 file:px-4 hover:file:bg-green-100 file:mr-4 pr-32 cursor-pointer appearance-none"
                    style={{ color: 'transparent' }}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm pointer-events-none select-none whitespace-nowrap">
                    {busDocuments.ecowas ? busDocuments.ecowas.name : 'No file chosen'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  if (formData.bus_number !== "" || formData.model !== "") {
                    setIsConfirmCloseDialogOpen(true);
                  } else {
                    setIsDialogOpen(false);
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#008F37] text-white font-semibold rounded-lg px-4 py-2 transition-all duration-300 hover:bg-[#00662A]"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingBus ? "Update Bus" : "Add Bus"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm Close Dialog */}
      <ConfirmCloseDialog
        open={isConfirmCloseDialogOpen}
        onOpenChange={setIsConfirmCloseDialogOpen}
        onConfirm={() => {
          setIsConfirmCloseDialogOpen(false);
          setIsDialogOpen(false);
          resetForm();
        }}
      />
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bus</DialogTitle>
            <DialogDescription>Are you sure you want to delete this bus? This action cannot be undone.</DialogDescription>
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