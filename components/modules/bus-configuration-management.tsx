"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Loader2, Copy, ArrowLeft, Settings, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { apiClient, BusConfiguration, CreateBusConfigurationData, UpdateBusConfigurationData } from "@/service/api";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Seat {
  id: string;
  row: number;
  column: number;
  type: string;
  available: boolean;
  label?: string;
  visual_row?: number;
  visual_column?: number;
  is_walkway?: boolean;
}

interface SeatLayoutConfig {
  rows: number;
  columns: number;
  arrangement_pattern?: string;
  seats: Seat[];
}

interface BusConfigurationManagementProps {
  onBack?: () => void;
  standalone?: boolean;
}

export default function BusConfigurationManagement({ onBack, standalone = true }: BusConfigurationManagementProps) {
  const [configurations, setConfigurations] = useState<BusConfiguration[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<BusConfiguration | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    bus_type: "",
    total_seats: 0,
    amenities: "",
  });
  const [seatLayout, setSeatLayout] = useState<SeatLayoutConfig>({
    rows: 10,
    columns: 4,
    arrangement_pattern: "2x2",
    seats: [],
  });
  const [loading, setLoading] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<BusConfiguration | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showSeatEditor, setShowSeatEditor] = useState(false);
  const [selectedSeatType, setSelectedSeatType] = useState("regular");
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [configToClone, setConfigToClone] = useState<BusConfiguration | null>(null);
  const [cloneName, setCloneName] = useState("");

  const busTypes = ["economy", "business", "executive", "luxury", "standard"];
  const seatTypes = [
    { value: "regular", label: "Regular", color: "bg-blue-500" },
    { value: "vip", label: "VIP", color: "bg-purple-500" },
    { value: "disabled", label: "Disabled", color: "bg-green-500" },
    { value: "walkway", label: "Walkway", color: "bg-gray-300" },
  ];

  useEffect(() => {
    fetchConfigurations();
  }, []);

  async function fetchConfigurations() {
    setLoading(true);
    try {
      const data = await apiClient.getBusConfigurations();
      console.log("Fetched configurations:", data);
      setConfigurations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching configurations:", e);
      toast.error("Failed to fetch bus configurations");
    } finally {
      setLoading(false);
    }
  }

  function generateDefaultSeats(rows: number, columns: number): Seat[] {
    const seats: Seat[] = [];
    let seatNumber = 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // Create walkway in the middle for 4+ column layouts
        const isWalkway = columns >= 4 && (col === Math.floor(columns / 2));
        
        seats.push({
          id: `seat-${row}-${col}`,
          row: row,
          column: col,
          visual_row: row,
          visual_column: col,
          type: isWalkway ? "walkway" : "regular",
          available: !isWalkway,
          is_walkway: isWalkway,
          label: isWalkway ? "" : `${seatNumber}`,
        });

        if (!isWalkway) {
          seatNumber++;
        }
      }
    }

    return seats;
  }

  function handleInputChange(field: keyof typeof formData, value: string | number) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSeatLayoutChange(field: keyof SeatLayoutConfig, value: any) {
    setSeatLayout((prev) => {
      const updated = { ...prev, [field]: value };
      
      // Regenerate seats when rows or columns change
      if (field === 'rows' || field === 'columns') {
        const newRows = field === 'rows' ? Number(value) : prev.rows;
        const newColumns = field === 'columns' ? Number(value) : prev.columns;
        updated.seats = generateDefaultSeats(newRows, newColumns);
      }
      
      return updated;
    });
  }

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      bus_type: "",
      total_seats: 0,
      amenities: "",
    });
    setSeatLayout({
      rows: 10,
      columns: 4,
      arrangement_pattern: "2x2",
      seats: generateDefaultSeats(10, 4),
    });
    setShowSeatEditor(false);
  }

  function handleAddConfiguration() {
    setEditingConfig(null);
    resetForm();
    setIsDialogOpen(true);
  }

  function handleEditConfiguration(config: BusConfiguration) {
    console.log("Editing configuration:", config);
    setEditingConfig(config);
    
    setFormData({
      name: config.name,
      description: config.description || "",
      bus_type: config.bus_type,
      total_seats: config.total_seats,
      amenities: Array.isArray(config.amenities) ? config.amenities.join(", ") : "",
    });

    // Properly restore the seat layout with all visual coordinates
    const restoredSeatLayout: SeatLayoutConfig = {
      rows: config.seat_layout?.rows || 10,
      columns: config.seat_layout?.columns || 4,
      arrangement_pattern: config.seat_layout?.arrangement_pattern || "2x2",
      seats: config.seat_layout?.seats ? config.seat_layout.seats.map(seat => ({
        id: seat.id,
        row: seat.row,
        column: seat.column,
        visual_row: seat.visual_row !== undefined ? seat.visual_row : seat.row,
        visual_column: seat.visual_column !== undefined ? seat.visual_column : seat.column,
        type: seat.type,
        available: seat.available,
        is_walkway: seat.is_walkway || false,
        label: seat.label || "",
      })) : generateDefaultSeats(config.seat_layout?.rows || 10, config.seat_layout?.columns || 4),
    };

    console.log("Restored seat layout:", restoredSeatLayout);
    setSeatLayout(restoredSeatLayout);
    setIsDialogOpen(true);
  }

  function handleDeleteConfiguration(config: BusConfiguration) {
    setConfigToDelete(config);
    setIsDeleteDialogOpen(true);
  }

  function handleCloneConfiguration(config: BusConfiguration) {
    setConfigToClone(config);
    setCloneName(`${config.name} (Copy)`);
    setCloneDialogOpen(true);
  }

  async function confirmClone() {
    if (!configToClone || !cloneName.trim()) return;
    
    setLoading(true);
    try {
      await apiClient.cloneBusConfiguration(configToClone.id, cloneName.trim());
      toast.success("Configuration cloned successfully");
      fetchConfigurations();
      setCloneDialogOpen(false);
      setConfigToClone(null);
      setCloneName("");
    } catch (e) {
      console.error("Error cloning configuration:", e);
      toast.error("Failed to clone configuration");
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!configToDelete) return;
    setLoading(true);
    try {
      await apiClient.deleteBusConfiguration(configToDelete.id);
      toast.success("Configuration deleted successfully");
      fetchConfigurations();
    } catch (e) {
      console.error("Error deleting configuration:", e);
      toast.error("Failed to delete configuration");
    } finally {
      setIsDeleteDialogOpen(false);
      setConfigToDelete(null);
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!formData.name || !formData.bus_type) {
      toast.error("Name and bus type are required");
      return;
    }

    // Calculate total seats excluding walkways
    const availableSeats = seatLayout.seats.filter(seat => seat.available && !seat.is_walkway).length;
    
    setLoading(true);
    
    // Ensure all seats have proper visual coordinates
    const completeSeats = seatLayout.seats.map(seat => ({
      id: seat.id,
      row: seat.row,
      column: seat.column,
      visual_row: seat.visual_row !== undefined ? seat.visual_row : seat.row,
      visual_column: seat.visual_column !== undefined ? seat.visual_column : seat.column,
      type: seat.type,
      available: seat.available,
      is_walkway: seat.is_walkway || false,
      label: seat.label || "",
    }));

    const submitData: CreateBusConfigurationData | UpdateBusConfigurationData = {
      name: formData.name,
      description: formData.description,
      bus_type: formData.bus_type,
      total_seats: availableSeats,
      seat_layout: {
        rows: seatLayout.rows,
        columns: seatLayout.columns,
        arrangement_pattern: seatLayout.arrangement_pattern,
        seats: completeSeats,
      },
      amenities: formData.amenities.split(",").map((a) => a.trim()).filter(Boolean),
    };

    console.log("Submitting configuration data:", submitData);

    try {
      if (editingConfig) {
        await apiClient.updateBusConfiguration(editingConfig.id, submitData);
        toast.success("Configuration updated successfully");
      } else {
        await apiClient.createBusConfiguration(submitData);
        toast.success("Configuration created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
      fetchConfigurations();
    } catch (e) {
      console.error("Error saving configuration:", e);
      toast.error("Failed to save configuration");
    } finally {
      setLoading(false);
    }
  }

  function handleSeatClick(seatIndex: number) {
    setSeatLayout(prev => {
      const updatedSeats = [...prev.seats];
      const seat = updatedSeats[seatIndex];
      
      if (selectedSeatType === "walkway") {
        // Toggle walkway
        seat.is_walkway = !seat.is_walkway;
        seat.type = seat.is_walkway ? "walkway" : "regular";
        seat.available = !seat.is_walkway;
        seat.label = seat.is_walkway ? "" : `${seatIndex + 1}`;
      } else {
        // Change seat type (only for non-walkway seats)
        if (!seat.is_walkway) {
          seat.type = selectedSeatType;
          seat.available = selectedSeatType !== "disabled";
        }
      }
      
      return { ...prev, seats: updatedSeats };
    });
  }

  function resetToDefaultLayout() {
    setSeatLayout(prev => ({
      ...prev,
      seats: generateDefaultSeats(prev.rows, prev.columns),
    }));
    toast.info("Seat layout reset to default");
  }

  function getSeatTypeColor(seat: Seat) {
    if (seat.is_walkway) return "bg-gray-300 border-gray-400";
    
    switch (seat.type) {
      case "regular": return "bg-blue-500 border-blue-600 text-white";
      case "vip": return "bg-purple-500 border-purple-600 text-white";
      case "disabled": return "bg-green-500 border-green-600 text-white";
      default: return "bg-gray-500 border-gray-600 text-white";
    }
  }

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(configurations.length / itemsPerPage);
  const paginatedConfigurations = configurations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold">
            {standalone ? (
              "Bus Configuration Management"
            ) : (
              <div className="flex items-center">
                {onBack && (
                  <Button 
                    variant="ghost" 
                    onClick={onBack}
                    className="mr-2 p-1"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
                Bus Configuration Management
              </div>
            )}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="border border-[#008F37] text-[#008F37] px-3 py-1"
          >
            {viewMode === 'list' ? 'Grid View' : 'List View'}
          </Button>
          <Button
            onClick={handleAddConfiguration}
            disabled={loading}
            className="bg-gradient-to-r from-[#1D976C] to-[#93F9B9] hover:from-[#008F37] hover:to-[#00662A] text-white shadow-lg rounded-lg px-4 py-2 font-semibold transition-all duration-300"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Add Configuration
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#008F37]" />
          <span className="ml-2 text-gray-600">Loading configurations...</span>
        </div>
      )}

      {/* Configurations Display */}
      {!loading && paginatedConfigurations.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedConfigurations.map((config) => (
              <Card key={config.id} className="bg-white rounded-xl shadow border p-4 flex flex-col justify-between min-h-[180px]">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold text-base truncate">{config.name}</div>
                  <Badge className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 font-semibold text-xs">
                    {config.bus_type}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 mb-1">
                  Total Seats: {config.total_seats} | Layout: {config.seat_layout?.rows}x{config.seat_layout?.columns}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {config.description || "No description"}
                </div>
                <div className="flex gap-2 mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditConfiguration(config)}
                    disabled={loading}
                    className="flex-1 border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white rounded-lg px-2 py-1 font-semibold transition-all duration-300"
                  >
                    <Edit className="mr-1 h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCloneConfiguration(config)}
                    disabled={loading}
                    className="border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white rounded-lg px-2 py-1 font-semibold transition-all duration-300"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteConfiguration(config)}
                    disabled={loading}
                    className="border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white rounded-lg px-2 py-1 font-semibold transition-all duration-300"
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
                  <th className="px-4 py-2 text-left">Bus Type</th>
                  <th className="px-4 py-2 text-left">Total Seats</th>
                  <th className="px-4 py-2 text-left">Layout</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedConfigurations.map(config => (
                  <tr key={config.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 font-medium">{config.name}</td>
                    <td className="px-4 py-2">
                      <Badge className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 font-semibold text-xs">
                        {config.bus_type}
                      </Badge>
                    </td>
                    <td className="px-4 py-2">{config.total_seats}</td>
                    <td className="px-4 py-2">{config.seat_layout?.rows}x{config.seat_layout?.columns}</td>
                    <td className="px-4 py-2 max-w-xs truncate">{config.description || "No description"}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => handleEditConfiguration(config)} className="border-gray-300">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => handleCloneConfiguration(config)} className="border-gray-300">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => handleDeleteConfiguration(config)} className="border-gray-300">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        !loading && (
          <Card className="bg-white rounded-xl shadow-lg border-0 p-6">
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No configurations found
              </h3>
              <p className="text-gray-500">
                No bus configurations have been created yet.
              </p>
            </div>
          </Card>
        )
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 mb-8">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button key={i + 1} variant={currentPage === i + 1 ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      )}

      {/* Add/Edit Configuration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingConfig ? "Edit Bus Configuration" : "Add New Bus Configuration"}</DialogTitle>
            <DialogDescription>
              {editingConfig ? "Update the bus configuration details and seat layout." : "Create a new bus configuration with custom seat layout."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Configuration Name <span className="text-red-500">*</span></Label>
                <Input 
                  value={formData.name} 
                  onChange={e => handleInputChange("name", e.target.value)} 
                  placeholder="e.g., Standard Coach 45-Seater"
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Bus Type <span className="text-red-500">*</span></Label>
                <Select value={formData.bus_type} onValueChange={v => handleInputChange("bus_type", v)} required>
                  <SelectTrigger><SelectValue placeholder="Select bus type" /></SelectTrigger>
                  <SelectContent>
                    {busTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={formData.description} 
                  onChange={e => handleInputChange("description", e.target.value)} 
                  placeholder="Optional description of this configuration"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Amenities (comma separated)</Label>
                <Textarea 
                  value={formData.amenities} 
                  onChange={e => handleInputChange("amenities", e.target.value)} 
                  placeholder="e.g., Air Conditioning, WiFi, USB Charging"
                  rows={3}
                />
              </div>
            </div>

            {/* Seat Layout Configuration */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Seat Layout Configuration</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetToDefaultLayout}
                    className="border border-[#008F37] text-[#008F37]"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset Layout
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSeatEditor(!showSeatEditor)}
                    className="border border-[#008F37] text-[#008F37]"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    {showSeatEditor ? "Hide" : "Show"} Seat Editor
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Rows</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    max="20" 
                    value={seatLayout.rows} 
                    onChange={e => handleSeatLayoutChange("rows", parseInt(e.target.value) || 1)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Columns</Label>
                  <Input 
                    type="number" 
                    min="1" 
                    max="6" 
                    value={seatLayout.columns} 
                    onChange={e => handleSeatLayoutChange("columns", parseInt(e.target.value) || 1)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Arrangement Pattern</Label>
                  <Input 
                    value={seatLayout.arrangement_pattern || ""} 
                    onChange={e => handleSeatLayoutChange("arrangement_pattern", e.target.value)} 
                    placeholder="e.g., 2x2, 3x2"
                  />
                </div>
              </div>

              {/* Seat Type Selector (only when editor is shown) */}
              {showSeatEditor && (
                <div className="mb-4">
                  <Label className="mb-2 block">Select Seat Type to Apply:</Label>
                  <div className="flex gap-2 flex-wrap">
                    {seatTypes.map((type) => (
                      <Button
                        key={type.value}
                        type="button"
                        variant={selectedSeatType === type.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSeatType(type.value)}
                        className={`${selectedSeatType === type.value ? "bg-[#008F37] text-white" : "border border-[#008F37] text-[#008F37]"}`}
                      >
                        <div className={`w-3 h-3 rounded mr-2 ${type.color}`}></div>
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Seat Layout Preview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium">Seat Layout Preview</h4>
                  <div className="text-sm text-gray-600">
                    Available Seats: {seatLayout.seats.filter(s => s.available && !s.is_walkway).length} / Total Positions: {seatLayout.seats.length}
                  </div>
                </div>
                
                <div 
                  className="grid gap-1 mx-auto max-w-md"
                  style={{ 
                    gridTemplateColumns: `repeat(${seatLayout.columns}, 1fr)`,
                    gridTemplateRows: `repeat(${seatLayout.rows}, 1fr)`
                  }}
                >
                  {seatLayout.seats.map((seat, index) => {
                    const displayRow = seat.visual_row !== undefined ? seat.visual_row : seat.row;
                    const displayCol = seat.visual_column !== undefined ? seat.visual_column : seat.column;
                    
                    return (
                      <div
                        key={seat.id}
                        className={`
                          w-8 h-8 border-2 rounded cursor-pointer flex items-center justify-center text-xs font-bold transition-all
                          ${getSeatTypeColor(seat)}
                          ${showSeatEditor ? 'hover:scale-110' : ''}
                        `}
                        style={{
                          gridRow: displayRow + 1,
                          gridColumn: displayCol + 1,
                        }}
                        onClick={() => showSeatEditor && handleSeatClick(index)}
                        title={`${seat.is_walkway ? 'Walkway' : `Seat ${seat.label}`} (${seat.type})`}
                      >
                        {seat.is_walkway ? "" : seat.label}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-4 mt-4 text-xs">
                  {seatTypes.map((type) => (
                    <div key={type.value} className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded ${type.color}`}></div>
                      <span>{type.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="bg-white border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white rounded-lg px-4 py-2 font-semibold transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#008F37] text-white font-semibold rounded-lg px-4 py-2 transition-all duration-300 hover:bg-[#00662A]"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {editingConfig ? "Update Configuration" : "Create Configuration"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Clone Configuration Dialog */}
      <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone Configuration</DialogTitle>
            <DialogDescription>
              Create a copy of "{configToClone?.name}" with a new name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Configuration Name</Label>
              <Input 
                value={cloneName} 
                onChange={e => setCloneName(e.target.value)} 
                placeholder="Enter name for the cloned configuration"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setCloneDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={confirmClone} 
              disabled={loading || !cloneName.trim()}
              className="bg-[#008F37] text-white"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}
              Clone Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this configuration?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the configuration
              <span className="font-bold"> "{configToDelete?.name}"</span> and all its seat layout data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}