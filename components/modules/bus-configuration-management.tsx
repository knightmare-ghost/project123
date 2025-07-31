// Bus Configuration Management module
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Loader2, Settings } from "lucide-react";
import { toast } from "sonner";
import { ConfirmCloseDialog, handleDialogClose } from "@/components/utils/modal-helpers";
import { apiClient, BusConfiguration } from "@/service/api";

// Common amenities for buses
const COMMON_AMENITIES = [
  "Air Conditioning",
  "WiFi",
  "USB Charging",
  "Power Outlets",
  "Reclining Seats",
  "Reading Lights",
  "Footrests",
  "Tray Tables",
  "TV Screens",
  "Entertainment System",
  "Restroom",
  "Water Dispenser",
  "Blankets",
  "Pillows",
  "Refreshments",
  "Snacks",
  "Luggage Racks",
];

// Bus types
const BUS_TYPES = [
  "Economy",
  "Standard",
  "Business",
  "Executive",
  "VIP",
  "Luxury",
  "Sleeper",
];

// Common bus seating arrangements
const ARRANGEMENT_PATTERNS = [
  { value: "1x1", label: "1x1 (Single row)" },
  { value: "2x1", label: "2x1 (Two left, one right)" },
  { value: "1x2", label: "1x2 (One left, two right)" },
  { value: "2x2", label: "2x2 (Two on each side)" },
  { value: "3x2", label: "3x2 (Three left, two right)" },
  { value: "custom", label: "Custom (Manual layout)" },
];

// Function to apply seating arrangement pattern
function applySeatingArrangement(rows: number, columns: number, pattern: string) {
  // Calculate actual columns with walkway
  // For all patterns, we'll add 1 column in the middle for the walkway
  const actualColumns = columns + 1;
  
  const newLayout: Array<Array<{
    id: string;
    row: number;
    column: number;
    type: string;
    available: boolean;
    label?: string;
    isWalkway?: boolean;
    visual_row?: number;
    visual_column?: number;
    is_walkway?: boolean;
  }>> = [];
  
  for (let r = 0; r < rows; r++) {
    const row: Array<{
      id: string;
      row: number;
      column: number;
      type: string;
      available: boolean;
      label?: string;
      isWalkway?: boolean;
      visual_row?: number;
      visual_column?: number;
      is_walkway?: boolean;
    }> = [];
    
    // Determine if this is the last row (back of bus)
    const isLastRow = r === rows - 1;
    
    // Track the actual column index for the API
    let apiColumnIndex = 0;
    
    for (let c = 0; c < actualColumns; c++) {
      const middlePoint = Math.floor(actualColumns / 2);
      const isMiddleColumn = (c === middlePoint);
      
      // Generate label based on position, but handle walkway specially
      let defaultLabel;
      if (isMiddleColumn) {
        // For walkway seats, use a special format
        defaultLabel = `W${r+1}`;
      } else {
              // For regular seats, calculate label index properly
      let labelIndex;
      if (c < middlePoint) {
        // Left side of walkway
        labelIndex = c;
      } else if (c > middlePoint) {
        // Right side of walkway
        labelIndex = c - middlePoint - 1;
      } else {
        // Middle column (walkway)
        labelIndex = 0;
      }
      
      // Create unique label based on position
      // Use A, B for left side and C, D for right side to ensure uniqueness
      let letter;
      if (c < middlePoint) {
        letter = String.fromCharCode(65 + labelIndex); // A, B, etc.
      } else if (c > middlePoint) {
        letter = String.fromCharCode(67 + labelIndex); // C, D, etc.
      } else {
        letter = 'W'; // For walkway
      }
      
      defaultLabel = `${r+1}${letter}`;
      }
      
      // Determine if seat should be available based on pattern and position
      let available = true;
      let isWalkway = false;
      
      // Middle column is walkway (unavailable) except in the last row
      if (isMiddleColumn) {
        if (isLastRow) {
          // In the last row, the middle seat is a REGULAR seat, not a walkway
          isWalkway = false;
          available = true; // Always available by default
        } else {
          isWalkway = true;
          available = false; // Not available in other rows
        }
      }
      
      // Apply different seating patterns
      if (pattern === "2x1" || pattern === "1x2" || pattern === "2x2" || pattern === "3x2" || pattern === "custom") {
        // For all patterns, the middle column is a walkway except in the last row
        // In the last row, the middle seat is a regular seat
        if (isMiddleColumn) {
          if (isLastRow) {
            // Last row middle is a regular seat
            isWalkway = false;
            available = true;
          } else {
            // Other rows middle is a walkway
            isWalkway = true;
            available = false;
          }
        }
      }
      
      // For walkway seats, use -1 as a client-side marker (will be remapped before API submission)
      // For regular seats (including back row middle), use sequential column indices
      let columnForApi;
      
      if (isMiddleColumn && !isLastRow) {
        // This is a walkway seat (not in last row)
        columnForApi = -1;
      } else {
        // This is a regular seat or the back row middle seat
        columnForApi = apiColumnIndex;
        apiColumnIndex++; // Increment for all regular seats
      }
      
      row.push({
        id: `seat-${r}-${c}`, // Use visual column for ID to maintain consistency
        row: r,
        column: columnForApi, // Use -1 for walkways (client-side only)
        type: "regular",
        available,
        label: defaultLabel,
        isWalkway: isMiddleColumn,
        visual_row: r, // Store visual row position
        visual_column: c, // Store visual column position
        is_walkway: isMiddleColumn && !isLastRow // API property for walkway seats
      });
    }
    
    newLayout.push(row);
  }
  
  return newLayout;
}

interface BusConfigurationManagementProps {
  onBack?: () => void;
  standalone?: boolean;
}

export default function BusConfigurationManagement({ onBack, standalone = true }: BusConfigurationManagementProps = {}) {
  const [configurations, setConfigurations] = useState<BusConfiguration[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmCloseDialogOpen, setIsConfirmCloseDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<BusConfiguration | null>(null);
  const [loading, setLoading] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<BusConfiguration | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeTab, setActiveTab] = useState("general");
  const [layoutConfigured, setLayoutConfigured] = useState(false);
  const [isPatternChangeDialogOpen, setIsPatternChangeDialogOpen] = useState(false);
  const [pendingPatternChange, setPendingPatternChange] = useState<string | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importData, setImportData] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(configurations.length / itemsPerPage);
  const paginatedConfigs = configurations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    bus_type: "Standard",
    total_seats: 40,
    rows: 10,
    columns: 4,
    arrangement_pattern: "1x1", // Default arrangement pattern
    selectedAmenities: [] as string[],
  });

  // Define seat type interface
  interface SeatType {
    id: string;
    row: number;
    column: number;
    type: string;
    available: boolean;
    label?: string;
    isWalkway?: boolean;
    apiColumn?: number; // For preserving original API column index
    visual_row?: number; // For preserving visual row position
    visual_column?: number; // For preserving visual column position
    is_walkway?: boolean; // API property for walkway seats
  }

  // Seat layout state
  const [seatLayout, setSeatLayout] = useState<Array<Array<SeatType>>>([]);

  useEffect(() => {
    fetchConfigurations();
  }, []);

    useEffect(() => {
    // Initialize seat layout when rows or columns change
    if (formData.rows > 0 && formData.columns > 0) {
      const newLayout = applySeatingArrangement(
        formData.rows,
        formData.columns,
        formData.arrangement_pattern
      );
      
      setSeatLayout(newLayout);
      
      // Mark layout as configured if we have a valid layout
      setLayoutConfigured(true);
    }
  }, [formData.rows, formData.columns]);

// Add a separate effect to handle arrangement pattern changes
useEffect(() => {
  if (formData.rows > 0 && formData.columns > 0 && formData.arrangement_pattern) {
    const newLayout = applySeatingArrangement(
      formData.rows,
      formData.columns,
      formData.arrangement_pattern
    );
    
    setSeatLayout(newLayout);
    
    // Mark layout as configured if we have a valid layout
    setLayoutConfigured(true);
    
    // Auto-switch to seating tab when changing arrangement pattern
    if (formData.arrangement_pattern === "custom") {
      setActiveTab("seating");
    }
  }
}, [formData.arrangement_pattern]);

  async function fetchConfigurations() {
    setLoading(true);
    try {
      const data = await apiClient.getBusConfigurations();
      setConfigurations(Array.isArray(data) ? data : []);
      
      console.log("Fetched configurations:", data);
      
      if (Array.isArray(data) && data.length === 0) {
        // If no configurations are found, provide helpful message
        toast.info("No bus configurations found. Create your first configuration!");
      }
    } catch (error: any) {
      console.error("Error fetching configurations:", error);
      toast.error(error.message || "Failed to fetch bus configurations");
      
      // If API is not available, show specific message
      if (error.message?.includes("fetch") || error.message?.includes("network")) {
        toast.error("Cannot connect to the API server. Make sure it's running at http://localhost:3002");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(field: keyof typeof formData, value: any) {
    // Special handling for arrangement pattern changes
    if (field === 'arrangement_pattern') {
      // Check if there are any custom labels that would be affected
      const hasCustomLabels = seatLayout.flat().some(seat => 
        seat.label && seat.label !== `${seat.row+1}${String.fromCharCode(65 + seat.column)}`
      );
      
      if (hasCustomLabels && value !== formData.arrangement_pattern) {
        // Store the pending change and show confirmation dialog
        setPendingPatternChange(value);
        setIsPatternChangeDialogOpen(true);
        return;
      }
    }
    
    setFormData((prev) => ({ ...prev, [field]: value }));
  }
  
  function confirmPatternChange() {
    if (pendingPatternChange) {
      setFormData(prev => ({ ...prev, arrangement_pattern: pendingPatternChange }));
      setPendingPatternChange(null);
    }
    setIsPatternChangeDialogOpen(false);
  }
  
  function exportSeatConfiguration() {
    try {
      const exportData = {
        rows: formData.rows,
        columns: formData.columns,
        arrangement_pattern: formData.arrangement_pattern,
        seats: seatLayout.flat().map(seat => ({
          row: seat.row,
          column: seat.column,
          type: seat.type,
          available: seat.available,
          label: seat.label
        }))
      };
      
      // Create a Blob with the data
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bus-config-${formData.name.replace(/\s+/g, '-').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Seat configuration exported successfully");
    } catch (error) {
      toast.error("Failed to export seat configuration");
    }
  }
  
  function importSeatConfiguration() {
    try {
      if (!importData) {
        toast.error("No import data provided");
        return;
      }
      
      const parsedData = JSON.parse(importData);
      
      // Validate the imported data
      if (!parsedData.rows || !parsedData.columns || !Array.isArray(parsedData.seats)) {
        toast.error("Invalid import data format");
        return;
      }
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        rows: parsedData.rows,
        columns: parsedData.columns,
        arrangement_pattern: parsedData.arrangement_pattern || "1x1"
      }));
      
      // Create new seat layout
      const newLayout: Array<Array<{
        id: string;
        row: number;
        column: number;
        type: string;
        available: boolean;
        label?: string;
      }>> = [];
      
      for (let r = 0; r < parsedData.rows; r++) {
        const row: Array<{
          id: string;
          row: number;
          column: number;
          type: string;
          available: boolean;
          label?: string;
        }> = [];
        
        for (let c = 0; c < parsedData.columns; c++) {
          const importedSeat = parsedData.seats.find((s: any) => s.row === r && s.column === c);
          
          if (importedSeat) {
            row.push({
              id: `seat-${r}-${c}`,
              row: r,
              column: c,
              type: importedSeat.type || "regular",
              available: importedSeat.available !== undefined ? importedSeat.available : true,
              label: importedSeat.label
            });
          } else {
            row.push({
              id: `seat-${r}-${c}`,
              row: r,
              column: c,
              type: "regular",
              available: true,
              label: `${r+1}${String.fromCharCode(65 + c)}`
            });
          }
        }
        
        newLayout.push(row);
      }
      
      setSeatLayout(newLayout);
      setIsImportDialogOpen(false);
      setImportData("");
      
      toast.success("Seat configuration imported successfully");
    } catch (error) {
      toast.error("Failed to import seat configuration: Invalid JSON format");
    }
  }

  function toggleAmenity(amenity: string) {
    setFormData(prev => {
      const selectedAmenities = [...prev.selectedAmenities];
      const index = selectedAmenities.indexOf(amenity);
      
      if (index === -1) {
        selectedAmenities.push(amenity);
      } else {
        selectedAmenities.splice(index, 1);
      }
      
      return { ...prev, selectedAmenities };
    });
  }

  function handleSeatTypeChange(rowIndex: number, colIndex: number, type: string) {
    const newLayout = [...seatLayout];
    newLayout[rowIndex][colIndex].type = type;
    setSeatLayout(newLayout);
  }

  function handleSeatAvailabilityChange(rowIndex: number, colIndex: number, available: boolean) {
    const newLayout = [...seatLayout];
    const seat = newLayout[rowIndex][colIndex];
    
    // Special handling for walkway seats
    if (seat.isWalkway) {
      // Only allow toggling walkway seats in the last row or in custom mode
      const isLastRow = rowIndex === seatLayout.length - 1;
      if (isLastRow || formData.arrangement_pattern === "custom") {
        seat.available = available;
      } else {
        // Don't allow making walkway seats available in other rows
        return;
      }
    } else {
      // Normal seat toggle
      seat.available = available;
    }
    
    setSeatLayout(newLayout);
    
    // Don't update the total_seats value - it should remain fixed from the general section
    // Just update the layout
  }

  // Add a function to handle seat label changes
  function handleSeatLabelChange(rowIndex: number, colIndex: number, label: string) {
  // Don't allow empty labels
  if (!label.trim()) return;
  
  // Check for duplicate labels
  const isDuplicate = seatLayout.flat().some(seat => 
    seat.available && 
    seat.label === label && 
    !(seat.row === rowIndex && seat.column === colIndex)
  );
  
  if (isDuplicate) {
    toast.error(`Seat label "${label}" already exists. Please use a unique label.`);
    return;
  }
  
  const newLayout = [...seatLayout];
  newLayout[rowIndex][colIndex].label = label;
  setSeatLayout(newLayout);
}

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      bus_type: "Standard",
      total_seats: 40,
      rows: 10,
      columns: 4,
      arrangement_pattern: "2x2", // Default to 2x2 arrangement
      selectedAmenities: [],
    });
    setSeatLayout([]);
    setLayoutConfigured(false);
    setActiveTab("general");
  }

  function handleAddConfig() {
    setEditingConfig(null);
    resetForm();
    setIsDialogOpen(true);
  }

  function handleEditConfig(config: BusConfiguration) {
    setEditingConfig(config);
    
    console.log("Loading configuration:", config);
    console.log("Original saved seats:", config.seat_layout.seats);
    
    // Map configuration data to form state
    setFormData({
      name: config.name,
      description: config.description || "",
      bus_type: config.bus_type,
      total_seats: config.total_seats,
      rows: config.seat_layout.rows,
      columns: config.seat_layout.columns,
      arrangement_pattern: config.seat_layout.arrangement_pattern || "2x2", // Default to 2x2 if not specified
      selectedAmenities: config.amenities,
    });
    
    // NEW APPROACH: Reconstruct layout directly from API data
    // This doesn't rely on localStorage at all
    
    // 1. First create a fresh layout with the correct dimensions and pattern
    const newLayout = applySeatingArrangement(
      config.seat_layout.rows,
      config.seat_layout.columns,
      config.seat_layout.arrangement_pattern || "2x2"
    );
    
    // 2. Create a lookup map for the new layout for quick access
    const newLayoutMap = new Map();
    for (let r = 0; r < newLayout.length; r++) {
      for (let c = 0; c < newLayout[r].length; c++) {
        const seat = newLayout[r][c];
        const key = `${r}-${c}`;
        newLayoutMap.set(key, seat);
      }
    }
    
    // 3. First, create a mapping of all seats from the API by their position
    const apiSeatMap = new Map();
    
    // Track which seats are disabled in the API data
    const disabledSeats = [];
    
    console.log("Original API seats:", config.seat_layout.seats);
    
    // Process all API seats to build our maps
    config.seat_layout.seats.forEach(apiSeat => {
      const apiSeatAny = apiSeat as any;
      
      // Create a key based on visual coordinates if available, otherwise use row/column
      let key;
      if (apiSeatAny.visual_row !== undefined && apiSeatAny.visual_column !== undefined) {
        key = `${apiSeatAny.visual_row}-${apiSeatAny.visual_column}`;
      } else {
        key = `${apiSeat.row}-${apiSeat.column}`;
      }
      
      // Store in our map
      apiSeatMap.set(key, apiSeat);
      
      // If this seat is disabled, track it
      if (apiSeat.available === false) {
        disabledSeats.push(apiSeat);
        console.log(`Found disabled seat in API data:`, JSON.stringify(apiSeat));
      }
    });
    
    console.log(`Found ${disabledSeats.length} disabled seats in API data`);
    
    // Calculate how many seats should be disabled to match the target
    const totalSeatsInLayout = config.seat_layout.rows * config.seat_layout.columns;
    const backRowMiddleSeatExists = true; // We always have this seat in our layout
    const totalPossibleSeats = backRowMiddleSeatExists ? totalSeatsInLayout + 1 : totalSeatsInLayout;
    const seatsToDisable = totalPossibleSeats - config.total_seats;
    
    console.log(`Total possible seats: ${totalPossibleSeats}, Target seats: ${config.total_seats}, Seats to disable: ${seatsToDisable}`);
    console.log(`Disabled seats from API: ${disabledSeats.length}`);
    
    // 4. Apply properties from API seats to our new layout
    // This is where we restore all custom properties including availability and labels
    for (let r = 0; r < newLayout.length; r++) {
      for (let c = 0; c < newLayout[r].length; c++) {
        const seat = newLayout[r][c];
        const key = `${r}-${c}`;
        const apiSeat = apiSeatMap.get(key);
        
        // Ensure we have a unique label for this seat based on its position
        // This prevents duplicate labels during editing
        const middlePoint = Math.floor(newLayout[r].length / 2);
        let labelIndex;
        if (c < middlePoint) {
          // Left side of walkway
          labelIndex = c;
        } else if (c > middlePoint) {
          // Right side of walkway
          labelIndex = c - middlePoint - 1;
        } else {
          // Middle column (walkway)
          labelIndex = 0;
        }
        
        // Create unique label based on position
        // Use A, B for left side and C, D for right side to ensure uniqueness
        let letter;
        if (c < middlePoint) {
          letter = String.fromCharCode(65 + labelIndex); // A, B, etc.
        } else if (c > middlePoint) {
          letter = String.fromCharCode(67 + labelIndex); // C, D, etc.
        } else {
          letter = 'W'; // For walkway
        }
        
        const defaultLabel = `${r+1}${letter}`;
        
        // Set the default label if no custom label exists
        if (!seat.label) {
          seat.label = defaultLabel;
        }
        
        if (apiSeat) {
          console.log(`Applying API seat data for ${r}-${c}:`, JSON.stringify(apiSeat));
          // Apply properties from API seat
          if (apiSeat.type) seat.type = apiSeat.type;
          
          // Apply custom label if it exists, otherwise keep the default unique label
          if (apiSeat.label && apiSeat.label !== seat.label) {
            seat.label = apiSeat.label;
          }
          
          // CRITICAL: Apply availability status - EXPLICITLY set both true and false values
          if (apiSeat.available === false) {
            seat.available = false;
            console.log(`✓ Disabled seat at position ${r}-${c} from API data`);
          } else if (apiSeat.available === true) {
            seat.available = true;
          }
          
          // Store visual coordinates
          const apiSeatAny = apiSeat as any;
          if (apiSeatAny.visual_row !== undefined) {
            seat.visual_row = apiSeatAny.visual_row;
          }
          if (apiSeatAny.visual_column !== undefined) {
            seat.visual_column = apiSeatAny.visual_column;
          }
          
          // Store is_walkway property
          if (apiSeatAny.is_walkway !== undefined) {
            seat.isWalkway = apiSeatAny.is_walkway;
          }
        }
      }
    }
    
    // 5. If we have fewer disabled seats than expected, find more seats to disable
    // This ensures we match the target seat count
    const currentlyDisabled = newLayout.flat().filter(s => !s.available && !s.isWalkway).length;
    const additionalSeatsToDisable = seatsToDisable - currentlyDisabled;
    
    console.log(`Currently disabled: ${currentlyDisabled}, Additional needed: ${additionalSeatsToDisable}`);
    
    if (additionalSeatsToDisable > 0) {
      console.log(`Need to disable ${additionalSeatsToDisable} more seats to match target`);
      
      // Find seats that aren't walkways and are currently available
      const availableRegularSeats = newLayout.flat().filter(s => 
        s.available && !s.isWalkway
      );
      
      // Disable seats starting from the back
      const seatsToMakeUnavailable = availableRegularSeats
        .sort((a, b) => b.row - a.row || b.column - a.column) // Sort by row descending, then column descending
        .slice(0, additionalSeatsToDisable);
      
      seatsToMakeUnavailable.forEach(seat => {
        seat.available = false;
        console.log(`Additionally disabled seat at position ${seat.row}-${seat.column} to match target count`);
      });
    }
    
    // 4. Handle the back row middle seat
    const backRowMiddleSeat = newLayout[newLayout.length - 1]?.find(seat => 
      seat.column === Math.floor(newLayout[0].length / 2)
    );
    
    if (backRowMiddleSeat) {
      console.log("Found back row middle seat:", backRowMiddleSeat);
      
      // Calculate the expected number of seats without the back middle seat
      const seatsWithoutBackMiddle = config.seat_layout.rows * config.seat_layout.columns;
      
      // If total_seats matches the count WITHOUT the back middle seat, then disable it
      if (config.total_seats === seatsWithoutBackMiddle) {
        backRowMiddleSeat.available = false;
        console.log(`Disabling back row middle seat because total_seats (${config.total_seats}) equals rows*columns (${seatsWithoutBackMiddle})`);
      }
      
      // Always ensure it's not marked as a walkway
      backRowMiddleSeat.isWalkway = false;
    }
    
    // 5. Final verification - make sure we have the right number of available seats
    const availableSeatsCount = newLayout.flat().filter(s => s.available).length;
    console.log(`Restored layout has ${availableSeatsCount} available seats (target: ${config.total_seats})`);
    
    // If the counts don't match, log a warning and fix it
    if (availableSeatsCount !== config.total_seats) {
      console.warn(`WARNING: Available seats (${availableSeatsCount}) doesn't match config total_seats (${config.total_seats})`);
      
      // If we have too many available seats, disable some from the back
      if (availableSeatsCount > config.total_seats) {
        const extraSeats = availableSeatsCount - config.total_seats;
        console.log(`Need to disable ${extraSeats} more seats to match target`);
        
        // Get all available non-walkway seats
        const availableSeats = newLayout.flat().filter(s => s.available && !s.isWalkway);
        
        // Sort by row (descending) then column (descending) to disable from the back
        availableSeats.sort((a, b) => {
          if (a.row !== b.row) return b.row - a.row;
          return b.column - a.column;
        });
        
        // Disable the required number of seats
        for (let i = 0; i < extraSeats && i < availableSeats.length; i++) {
          availableSeats[i].available = false;
          console.log(`Auto-disabled seat at ${availableSeats[i].row}-${availableSeats[i].column}`);
        }
      }
    }
    
    // Final count after adjustments
    const finalAvailableCount = newLayout.flat().filter(s => s.available).length;
    console.log(`Final restored layout has ${finalAvailableCount} available seats (target: ${config.total_seats})`);
    
    console.log("Final restored layout:", newLayout);
    setSeatLayout(newLayout);
    setLayoutConfigured(true);
    setActiveTab("seating"); // Show the seating tab by default
    setIsDialogOpen(true);
  }

  function handleDeleteConfig(config: BusConfiguration) {
    setConfigToDelete(config);
    setIsDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!configToDelete) return;
    setLoading(true);
    try {
      await apiClient.deleteBusConfiguration(configToDelete.id);
      toast.success("Bus configuration deleted successfully");
      fetchConfigurations();
    } catch (e) {
      toast.error("Failed to delete bus configuration");
    } finally {
      setIsDeleteDialogOpen(false);
      setConfigToDelete(null);
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // Validate form before submission
    // Check for empty configuration name
    if (!formData.name.trim()) {
      toast.error("Configuration name is required");
      return;
    }
    
    // Check for valid seat count
    if (formData.total_seats <= 0) {
      toast.error("Total seats must be greater than zero");
      return;
    }
    
    // Ensure the seat layout has been configured
    if (!layoutConfigured || seatLayout.length === 0) {
      toast.error("Please configure the seat layout before saving");
      setActiveTab("seating");
      return;
    }
    
    // For custom layouts, ensure at least one seat is available
    if (formData.arrangement_pattern === "custom" && !seatLayout.flat().some(seat => seat.available)) {
      toast.error("At least one seat must be available in the layout");
      setActiveTab("seating");
      return;
    }
    
    // Check for duplicate seat labels
    const availableSeats = seatLayout.flat().filter(seat => seat.available);
    const seatLabels = availableSeats.map(seat => seat.label || `${seat.row+1}${String.fromCharCode(65 + seat.column)}`);
    const uniqueLabels = new Set(seatLabels);
    
    if (seatLabels.length !== uniqueLabels.size) {
      toast.error("Duplicate seat labels detected. Please ensure all seat labels are unique.");
      return;
    }
    
    // Verify that available seats match total_seats
    if (availableSeats.length !== formData.total_seats) {
      // Auto-update total_seats to match available seats
      setFormData(prev => ({
        ...prev,
        total_seats: availableSeats.length
      }));
    }
    
    setLoading(true);
    
    // NEW APPROACH: Store ALL seat data in the API
    // This includes both available and unavailable seats, walkways, etc.
    // Each seat will have visual_row and visual_column to preserve the exact layout
    
    // 1. Prepare a complete flat array of ALL seats with their properties
    // Group seats by row for sequential column numbering
    const seatsByRow: Record<number, SeatType[]> = {};
    seatLayout.flat().forEach(seat => {
      if (!seatsByRow[seat.row]) {
        seatsByRow[seat.row] = [];
      }
      seatsByRow[seat.row].push(seat);
    });
    
    // Process each row to assign valid column indices
    let allSeats: Array<{
      id: string;
      row: number;
      column: number;
      type: string;
      available: boolean;
      label?: string;
      visual_row: number;
      visual_column: number;
      is_walkway: boolean;
    }> = [];
    
    Object.keys(seatsByRow).forEach(rowStr => {
      const rowIndex = parseInt(rowStr);
      const rowSeats = seatsByRow[rowIndex];
      
      // Sort seats by visual column to ensure consistent ordering
      rowSeats.sort((a: SeatType, b: SeatType) => a.column - b.column);
      
      // Assign sequential column indices starting from 0 for each row
      rowSeats.forEach((seat: SeatType, colIndex: number) => {
        // Ensure column index is within the valid range (0 to columns-1)
        const safeColIndex = Math.min(colIndex, formData.columns - 1);
        
        allSeats.push({
          id: seat.id,
          row: seat.row,
          column: safeColIndex, // Use safe column index for API
          type: seat.type,
          available: seat.available,
          label: seat.label || `${seat.row+1}${String.fromCharCode(65 + seat.column)}`,
          visual_row: seat.row,
          visual_column: seat.column, // Preserve original visual column
          is_walkway: seat.isWalkway || false
        });
      });
    });
    
    // Ensure unique IDs
    const usedIds = new Set<string>();
    allSeats = allSeats.map(seat => {
      let seatId = seat.id;
      if (usedIds.has(seatId)) {
        seatId = `seat-${seat.row}-${seat.column}-${Math.random().toString(36).substring(2, 7)}`;
      }
      usedIds.add(seatId);
      return {
        ...seat,
        id: seatId
      };
    });
    
    console.log(`Prepared ${allSeats.length} seats for API submission`);
    console.log(`Available seats: ${allSeats.filter(s => s.available).length}`);
    console.log(`Unavailable seats: ${allSeats.filter(s => !s.available).length}`);
    console.log(`Walkway seats: ${allSeats.filter(s => s.is_walkway).length}`);
    
    // 2. Special handling for the back row middle seat
    const backRowMiddleSeat = allSeats.find(seat => 
      seat.row === seatLayout.length - 1 && 
      seat.column === Math.floor(seatLayout[0].length / 2)
    );
    
    if (backRowMiddleSeat) {
      console.log("Back row middle seat found:", backRowMiddleSeat);
      // Ensure it's not marked as a walkway
      backRowMiddleSeat.is_walkway = false;
    }
    
    // 3. Prepare the final submission data
    const actualAvailableSeats = allSeats.filter(seat => seat.available).length;
    
    const submitData = {
      name: formData.name,
      description: formData.description,
      bus_type: formData.bus_type,
      total_seats: actualAvailableSeats, // Use the actual count of available seats
      seat_layout: {
        rows: formData.rows,
        columns: formData.columns,
        arrangement_pattern: formData.arrangement_pattern,
        seats: allSeats,
      },
      amenities: formData.selectedAmenities,
    };
    
    // Log the data being sent to the API for debugging
    console.log("Submitting bus configuration data:", submitData);
    
    try {
      // First validate the configuration with the API
      await apiClient.validateBusConfiguration(submitData);
      
      if (editingConfig) {
        await apiClient.updateBusConfiguration(editingConfig.id, submitData);
        toast.success("Bus configuration updated successfully");
      } else {
        await apiClient.createBusConfiguration(submitData);
        toast.success("Bus configuration created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
      fetchConfigurations();
    } catch (error: any) {
      toast.error(error.message || "Failed to save bus configuration");
    } finally {
      setLoading(false);
    }
  }
  
  // Function to handle configuration cloning
  async function handleCloneConfiguration(config: BusConfiguration) {
    const newName = `Copy of ${config.name}`;
    try {
      setLoading(true);
      await apiClient.cloneBusConfiguration(config.id, newName);
      toast.success(`Configuration "${config.name}" cloned successfully`);
      fetchConfigurations();
    } catch (error: any) {
      toast.error(error.message || "Failed to clone configuration");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header - Add Button and View Toggle */}
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportDialogOpen(true)}
            className="border border-[#008F37] text-[#008F37] px-3 py-1"
          >
            Import Config
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="border border-[#008F37] text-[#008F37] px-3 py-1"
          >
            {viewMode === 'list' ? 'Grid View' : 'List View'}
          </Button>
          <Button
            onClick={handleAddConfig}
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
      {loading && !isDialogOpen && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#008F37]" />
          <span className="ml-2 text-gray-600">Loading configurations...</span>
        </div>
      )}

      {/* Configurations Display */}
      {!loading && paginatedConfigs.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedConfigs.map((config) => (
              <Card key={config.id} className="bg-white rounded-xl shadow border p-4 flex flex-col justify-between min-h-[140px]">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold text-base truncate">{config.name}</div>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">{config.bus_type}</span>
                </div>
                <div className="text-xs text-gray-500 mb-1">Seats: {config.total_seats} | Layout: {config.seat_layout.rows}x{config.seat_layout.columns}</div>
                <div className="text-xs line-clamp-2">
                  Amenities: {config.amenities.join(", ")}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditConfig(config)}
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
                    className="flex-1 border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white rounded-lg px-2 py-1 font-semibold transition-all duration-300"
                  >
                    <svg 
                      className="mr-1 h-4 w-4" 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <rect x="8" y="8" width="12" height="12" rx="2" />
                      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                    </svg>
                    Clone
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteConfig(config)}
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
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Seats</th>
                  <th className="px-4 py-2 text-left">Layout</th>
                  <th className="px-4 py-2 text-left">Amenities</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedConfigs.map(config => (
                  <tr key={config.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 font-medium">{config.name}</td>
                    <td className="px-4 py-2">{config.bus_type}</td>
                    <td className="px-4 py-2">{config.total_seats}</td>
                    <td className="px-4 py-2">{config.seat_layout.rows}x{config.seat_layout.columns}</td>
                    <td className="px-4 py-2 max-w-[200px] truncate">{config.amenities.join(", ")}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => handleEditConfig(config)} className="border-gray-300"><Edit className="h-4 w-4" /></Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => handleCloneConfiguration(config)} className="border-gray-300">
                        <svg 
                          className="h-4 w-4" 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <rect x="8" y="8" width="12" height="12" rx="2" />
                          <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                        </svg>
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => handleDeleteConfig(config)} className="border-gray-300"><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
                No bus configurations found
              </h3>
              <p className="text-gray-500">
                No bus configurations have been added yet.
              </p>
            </div>
          </Card>
        )
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

      {/* Add/Edit Configuration Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={handleDialogClose(
          () => formData.name !== "" || formData.description !== "" || seatLayout.length > 0,
          setIsDialogOpen,
          setIsConfirmCloseDialogOpen
        )}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingConfig ? "Edit Bus Configuration" : "Add New Bus Configuration"}</DialogTitle>
            <DialogDescription>Configure your bus layout and amenities.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General Info</TabsTrigger>
                <TabsTrigger value="amenities">Amenities</TabsTrigger>
                <TabsTrigger value="seating">Seating Layout</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Configuration Name</Label>
                    <Input 
                      value={formData.name} 
                      onChange={e => handleInputChange("name", e.target.value)} 
                      placeholder="e.g., Standard 40-Seater" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bus Type</Label>
                    <Select 
                      value={formData.bus_type} 
                      onValueChange={v => handleInputChange("bus_type", v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Select bus type" /></SelectTrigger>
                      <SelectContent>
                        {BUS_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Total Seats</Label>
                    <Input 
                      type="number" 
                      min={1}
                      value={formData.total_seats} 
                      onChange={e => handleInputChange("total_seats", parseInt(e.target.value) || 0)} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Seating Arrangement</Label>
                    <Select 
                      value={formData.arrangement_pattern} 
                      onValueChange={v => handleInputChange("arrangement_pattern", v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Select arrangement" /></SelectTrigger>
                      <SelectContent>
                        {ARRANGEMENT_PATTERNS.map(pattern => (
                          <SelectItem key={pattern.value} value={pattern.value}>{pattern.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Rows</Label>
                      <Input 
                        type="number" 
                        min={1}
                        max={20}
                        value={formData.rows} 
                        onChange={e => handleInputChange("rows", parseInt(e.target.value) || 0)} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Columns</Label>
                      <Input 
                        type="number" 
                        min={1}
                        max={6}
                        value={formData.columns} 
                        onChange={e => handleInputChange("columns", parseInt(e.target.value) || 0)} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Input 
                      value={formData.description} 
                      onChange={e => handleInputChange("description", e.target.value)} 
                      placeholder="Brief description of this bus configuration" 
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="amenities" className="pt-4">
                <div className="space-y-4">
                  <Label>Select Amenities</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {COMMON_AMENITIES.map(amenity => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`amenity-${amenity}`} 
                          checked={formData.selectedAmenities.includes(amenity)}
                          onCheckedChange={() => toggleAmenity(amenity)}
                        />
                        <label 
                          htmlFor={`amenity-${amenity}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4">
                    <Label>Custom Amenity</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        id="custom-amenity" 
                        placeholder="Add custom amenity"
                      />
                      <Button 
                        type="button" 
                        onClick={() => {
                          const input = document.getElementById('custom-amenity') as HTMLInputElement;
                          if (input.value.trim()) {
                            toggleAmenity(input.value.trim());
                            input.value = '';
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="seating" className="pt-4">
                <div className="space-y-4">
                  <Label>Seat Layout Designer</Label>
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded border border-blue-200 flex-grow">
                      <p className="text-sm font-medium text-blue-800 mb-1">Walkway Feature</p>
                      <p className="text-sm text-gray-700">
                        A walkway column is automatically added in the middle of the bus layout. 
                        In the last row (back of the bus), these walkway seats are available by default since many buses 
                        have extra seats at the back. You can right-click to toggle their availability.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-3 rounded border border-green-200 flex-shrink-0 md:w-64">
                      <p className="text-sm font-medium text-green-800 mb-1">Seat Count</p>
                      <div className="flex flex-col">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-700">Available Seats:</span>
                          <span className="text-sm font-bold text-green-700">
                            {seatLayout.flat().filter(seat => seat.available).length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-700">Target Seats:</span>
                          <span className="text-sm font-bold text-blue-700">
                            {formData.total_seats}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-700">Difference:</span>
                          <span className={`text-sm font-bold ${
                            seatLayout.flat().filter(seat => seat.available).length === formData.total_seats 
                              ? 'text-green-700' 
                              : 'text-red-700'
                          }`}>
                            {seatLayout.flat().filter(seat => seat.available).length - formData.total_seats}
                          </span>
                        </div>
                        {seatLayout.flat().filter(seat => seat.available).length !== formData.total_seats && (
                          <div className="mt-2 text-xs text-red-600 bg-red-50 p-1 rounded">
                            {seatLayout.flat().filter(seat => seat.available).length > formData.total_seats ? 
                              "Please disable some seats to match the target count." :
                              "Please enable more seats to match the target count."}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                    <div className="flex justify-center mb-4">
                      <div className="bg-gray-300 px-8 py-2 rounded-t-lg font-medium text-gray-700">Front of Bus</div>
                    </div>
                    <div className="inline-block min-w-full">
                      {seatLayout.map((row, rowIndex) => (
                        <div key={`row-${rowIndex}`} className="flex justify-center mb-2">
                          {row.map((seat, colIndex) => {
                            // Use visual coordinates if available, otherwise fall back to row/column
                            const visualRow = seat.visual_row !== undefined ? seat.visual_row : seat.row;
                            const visualColumn = seat.visual_column !== undefined ? seat.visual_column : seat.column;
                            
                            return (
                            <div 
                              key={`seat-${visualRow}-${visualColumn}`} 
                              className={`
                                w-12 h-12 m-1 rounded-lg flex items-center justify-center cursor-pointer border-2
                                ${!seat.available ? 'bg-gray-200 border-gray-400 opacity-50' : 
                                  seat.type === 'regular' ? 'bg-blue-100 border-blue-300' : 
                                  seat.type === 'vip' ? 'bg-purple-100 border-purple-300' :
                                  seat.type === 'disabled' ? 'bg-yellow-100 border-yellow-300' : 'bg-blue-100 border-blue-300'
                                }
                              `}
                              onClick={() => {
                                // Only allow changing seat type if the seat is available
                                if (seat.available) {
                                  // Cycle through seat types on click
                                  const types = ['regular', 'vip', 'disabled'];
                                  const currentIndex = types.indexOf(seat.type);
                                  const nextType = types[(currentIndex + 1) % types.length];
                                  handleSeatTypeChange(rowIndex, colIndex, nextType);
                                }
                              }}
                                                              onContextMenu={(e) => {
                                  // Toggle availability on right click
                                  e.preventDefault();
                                  
                                  // Special handling for walkway seats
                                  if (seat.isWalkway) {
                                    // Only allow toggling walkway seats in the last row or in custom mode
                                    const isLastRow = rowIndex === seatLayout.length - 1;
                                    if (isLastRow || formData.arrangement_pattern === "custom") {
                                      handleSeatAvailabilityChange(rowIndex, colIndex, !seat.available);
                                    }
                                    // Otherwise, don't allow toggling walkway seats
                                    return;
                                  }
                                  
                                  // For regular seats, always allow toggling
                                  handleSeatAvailabilityChange(rowIndex, colIndex, !seat.available);
                                }}
                            >
                              {!seat.available ? (
  seat.isWalkway ? (
    <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-100">
      <span className="text-xs">{rowIndex === seatLayout.length - 1 ? "Back" : "Aisle"}</span>
    </div>
  ) : (
    <div className="w-full h-full flex items-center justify-center text-gray-500">
      <span className="text-xs">X</span>
    </div>
  )
) : (
  <div className={`w-full h-full flex flex-col items-center justify-center ${
    seat.isWalkway ? 'bg-blue-50 border-blue-200' : ''
  }`}>
    <span>{seat.label}</span>
    {seat.isWalkway && seat.available && (
      <span className="text-[8px] text-blue-700">Back Seat</span>
    )}
  </div>
)}
                            </div>
                          )})}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                                     {/* Add custom seat label editor */}
                   <div className="mt-6 border-t pt-4">
                     <div className="flex justify-between items-center mb-4">
                       <Label className="text-lg font-medium block">Custom Seat Labels</Label>
                       <Button 
                         type="button" 
                         variant="outline" 
                         size="sm"
                         onClick={() => {
                           // Reset all custom labels to default
                           const newLayout = seatLayout.map(row => 
                             row.map(seat => ({
                               ...seat,
                               label: `${seat.row+1}${String.fromCharCode(65 + seat.column)}`
                             }))
                           );
                           setSeatLayout(newLayout);
                           toast.success("All seat labels reset to default");
                         }}
                       >
                         Reset All Labels
                       </Button>
                     </div>
                     <p className="text-sm text-gray-500 mb-4">
                       Click on a seat below to customize its label/number. This is useful for buses with non-standard seat numbering.
                     </p>
                    
                    {/* Render custom seat labels in the same layout as the bus */}
                    <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
                      <div className="flex justify-center mb-4">
                        <div className="bg-gray-300 px-8 py-2 rounded-t-lg font-medium text-gray-700">Custom Seat Labels</div>
                      </div>
                      <div className="inline-block min-w-full">
                        {seatLayout.map((row, rowIndex) => (
                          <div key={`label-row-${rowIndex}`} className="flex justify-center mb-2">
                            {row.map((seat, colIndex) => {
                              // Only show input for available seats
                              if (!seat.available) {
                                return (
                                  <div 
                                    key={`label-seat-${rowIndex}-${colIndex}`} 
                                    className="w-16 h-16 m-1 rounded-lg flex items-center justify-center bg-gray-200 border-2 border-gray-400 opacity-50"
                                  >
                                    {seat.label}
                                  </div>
                                );
                              }
                              
                              // For available seats, show input
                              return (
                                <div 
                                  key={`label-seat-${rowIndex}-${colIndex}`} 
                                  className={`
                                    w-16 h-16 m-1 rounded-lg flex flex-col items-center justify-center border-2
                                    ${seat.type === 'regular' ? 'bg-blue-100 border-blue-300' : 
                                      seat.type === 'vip' ? 'bg-purple-100 border-purple-300' :
                                      seat.type === 'disabled' ? 'bg-yellow-100 border-yellow-300' : 'bg-blue-100 border-blue-300'}
                                  `}
                                >
                                  <div className="text-xs text-gray-500 mb-1">Current: {seat.label}</div>
                                  <Input 
                                    value={seat.label}
                                    onChange={e => handleSeatLabelChange(rowIndex, colIndex, e.target.value)}
                                    className="w-12 h-6 text-xs text-center"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded mr-2"></div>
                      <span>Regular Seat (click to change)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded mr-2"></div>
                      <span>VIP Seat</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
                      <span>Disabled/Priority Seat</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded mr-2"></div>
                      <span>Aisle/Walkway</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded mr-2"></div>
                      <span>Back Seat (in walkway)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded mr-2 opacity-50"></div>
                      <span>Unavailable Seat</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-between gap-2 pt-4 border-t">
              <div>
                {editingConfig && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={exportSeatConfiguration}
                  >
                    Export Config
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    if (formData.name || formData.description || seatLayout.length > 0) {
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
                  {editingConfig ? "Update Configuration" : "Save Configuration"}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bus Configuration</DialogTitle>
            <DialogDescription>Are you sure you want to delete this bus configuration? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button type="button" className="bg-red-600 text-white" onClick={confirmDelete} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pattern Change Confirmation Dialog */}
      <Dialog open={isPatternChangeDialogOpen} onOpenChange={setIsPatternChangeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Seating Arrangement</DialogTitle>
            <DialogDescription>
              Changing the seating arrangement may affect your custom seat labels. 
              The seat layout will be regenerated based on the new pattern.
              Do you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => {
              setIsPatternChangeDialogOpen(false);
              setPendingPatternChange(null);
            }}>Cancel</Button>
            <Button type="button" className="bg-amber-600 text-white" onClick={confirmPatternChange}>
              Change Arrangement
            </Button>
          </div>
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
      
      {/* Import Configuration Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={(open) => {
        if (!open && importData) {
          // If trying to close with data entered, confirm first
          setIsConfirmCloseDialogOpen(true);
        } else {
          setIsImportDialogOpen(open);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Seat Configuration</DialogTitle>
            <DialogDescription>
              Paste the JSON configuration data below to import a seat configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Label>Configuration JSON</Label>
            <textarea 
              className="w-full h-64 p-2 border rounded-md font-mono text-sm"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder='{"rows": 10, "columns": 4, "arrangement_pattern": "2x2", "seats": [...]}'
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setIsImportDialogOpen(false);
                setImportData("");
              }}>Cancel</Button>
              <Button 
                type="button" 
                className="bg-[#008F37] text-white" 
                onClick={importSeatConfiguration}
                disabled={!importData.trim()}
              >
                Import Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 