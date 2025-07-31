// Use production API directly
const API_BASE_URL = "https://control-api.stcgh.com";

export interface Company {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface Terminal {
  id: string;
  name: string;
  code: string;
  address: string;
  is_station: boolean;
  is_active: boolean;
  service_country: string;
}

export interface Route {
  id: string;
  origin: string; // terminal id
  destination: string; // terminal id
  distance_in_km: number;
  estimated_time: number;
}

export interface Driver {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  license_number: string;
  license_expiry_date: string;
  phone_number: string;
  address: string;
  status: string;
  license_file?: string;
  ghana_card_file?: string;
  training_certificate_file?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateDriverData {
  firstname: string;
  lastname: string;
  email: string;
  license_number: string;
  license_expiry_date: string;
  phone_number: string;
  address: string;
  status: string;
  license_file?: string | File;
  ghana_card_file?: string | File;
  training_certificate_file?: string | File;
}

export interface UpdateDriverData extends Partial<CreateDriverData> {}

export interface Bus {
  id: string;
  bus_number: string; // Changed from registration_number
  model: string;
  capacity: number;
  year: number;
  status: string;
  fleet_number: string;
  manufacturer: string; // Now required
  station_name: string; // New required field
  fuel_type: string; // New required field
  body_type?: string; // New field
  chassis_number?: string; // New field
  engine_number?: string; // New field
  tracking_device_number?: string; // New field
  purchase_date?: string; // New field
  next_maintenance?: string;
  mileage?: string;
  owner?: string;
  amenities: string[];
  company_id: string;
  created_at?: string;
  updated_at?: string;
  insurance_file?: string | File;
  roadworthy_file?: string | File;
  ecowas_file?: string | File;
  configuration_id: string; // Now required - Reference to bus configuration
  
  // For backward compatibility
  registration_number?: string;
}

export interface BusConfiguration {
  id: string;
  name: string;
  description?: string;
  bus_type: string; // e.g., "business", "economy", "executive"
  total_seats: number;
  seat_layout: {
    rows: number;
    columns: number;
    arrangement_pattern?: string; // e.g., "2x1", "3x2", etc.
    seats: Array<{
      id: string;
      row: number;
      column: number;
      type: string; // "regular", "vip", "disabled", etc.
      available: boolean;
      label?: string; // Custom seat label/number
      visual_row?: number; // Visual row position for UI rendering
      visual_column?: number; // Visual column position for UI rendering
      is_walkway?: boolean; // Whether this seat is in the walkway
    }>;
  };
  amenities: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateBusConfigurationData {
  name: string;
  description?: string;
  bus_type: string;
  total_seats: number;
  seat_layout: {
    rows: number;
    columns: number;
    arrangement_pattern?: string;
    seats: Array<{
      id: string;
      row: number;
      column: number;
      type: string;
      available: boolean;
      label?: string;
      visual_row?: number; // Visual row position for UI rendering
      visual_column?: number; // Visual column position for UI rendering
      is_walkway?: boolean; // Whether this seat is in the walkway
    }>;
  };
  amenities: string[];
}

export interface UpdateBusConfigurationData extends Partial<CreateBusConfigurationData> {}

export interface Trip {
  id: string;
  route_id: string;
  fare: number;
  bus_id: string;
  driver_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTripData {
  route_id: string;
  fare: number;
  bus_id: string;
  driver_id: string;
}

export interface UpdateTripData extends Partial<CreateTripData> {}

class ApiClient {
  private baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    const data = await response.json();
    return data;
  }

  // ROUTES
  async getRoutes(): Promise<Route[]> {
    const response = await fetch(`${this.baseUrl}/routes`);
    const data = await response.json();
    return Array.isArray(data)
      ? data.map((r: any) => ({
          id: r._id || r.id,
          origin: r.origin,
          destination: r.destination,
          distance_in_km: r.distance_in_km,
          estimated_time: r.estimated_time
        }))
      : [];
  }
  async getRoute(id: string): Promise<Route> {
    const response = await fetch(`${this.baseUrl}/routes/${id}`);
    const data = await response.json();
    let origin = data.origin;
    let destination = data.destination;
    if (origin && typeof origin === 'object') origin = origin._id || origin.id || '';
    if (destination && typeof destination === 'object') destination = destination._id || destination.id || '';
    return {
      id: data._id || data.id,
      origin,
      destination,
      distance_in_km: data.distance_in_km,
      estimated_time: data.estimated_time
    };
  }
  async createRoute(data: Partial<Route>): Promise<Route> {
    const response = await fetch(`${this.baseUrl}/routes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const res = await response.json();
    return {
      id: res._id || res.id,
      origin: res.origin,
      destination: res.destination,
      distance_in_km: res.distance_in_km,
      estimated_time: res.estimated_time
    };
  }
  async updateRoute(id: string, data: Partial<Route>): Promise<Route> {
    const response = await fetch(`${this.baseUrl}/routes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const res = await response.json();
    return {
      id: res._id || res.id,
      origin: res.origin,
      destination: res.destination,
      distance_in_km: res.distance_in_km,
      estimated_time: res.estimated_time
    };
  }
  async deleteRoute(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/routes/${id}`, {
      method: "DELETE",
    });
  }

  // BUSES
  async getBuses(): Promise<Bus[]> {
    const response = await fetch(`${this.baseUrl}/api/buses`);
    const data = await response.json();
    return Array.isArray(data)
      ? data.map((b: any) => ({
          id: b._id || b.id,
          // Handle both old and new field names
          bus_number: b.bus_number || b.registration_number || "",
          registration_number: b.registration_number || b.bus_number || "",
          model: b.model || "",
          capacity: b.capacity || 0,
          year: b.year || 0,
          status: b.status || "active",
          fleet_number: b.fleet_number || "",
          manufacturer: b.manufacturer || "",
          station_name: b.station_name || "",
          fuel_type: b.fuel_type || "",
          body_type: b.body_type || "",
          chassis_number: b.chassis_number || "",
          engine_number: b.engine_number || "",
          tracking_device_number: b.tracking_device_number || "",
          purchase_date: b.purchase_date || "",
          next_maintenance: b.next_maintenance || "",
          mileage: b.mileage || "",
          owner: b.owner || "",
          amenities: Array.isArray(b.amenities) ? b.amenities : [],
          company_id: b.company_id || "",
          configuration_id: b.configuration_id || "",
          created_at: b.created_at,
          updated_at: b.updated_at
        }))
      : [];
  }
  async getBus(id: string): Promise<Bus> {
    const response = await fetch(`${this.baseUrl}/api/buses/${id}`);
    const b = await response.json();
    return {
      id: b._id || b.id,
      // Handle both old and new field names
      bus_number: b.bus_number || b.registration_number || "",
      registration_number: b.registration_number || b.bus_number || "",
      model: b.model || "",
      capacity: b.capacity || 0,
      year: b.year || 0,
      status: b.status || "active",
      fleet_number: b.fleet_number || "",
      manufacturer: b.manufacturer || "",
      station_name: b.station_name || "",
      fuel_type: b.fuel_type || "",
      body_type: b.body_type || "",
      chassis_number: b.chassis_number || "",
      engine_number: b.engine_number || "",
      tracking_device_number: b.tracking_device_number || "",
      purchase_date: b.purchase_date || "",
      next_maintenance: b.next_maintenance || "",
      mileage: b.mileage || "",
      owner: b.owner || "",
      amenities: Array.isArray(b.amenities) ? b.amenities : [],
      company_id: b.company_id || "",
      configuration_id: b.configuration_id || "",
      created_at: b.created_at,
      updated_at: b.updated_at
    };
  }
  async createBus(data: Partial<Bus>): Promise<Bus> {
    let body: BodyInit;
    let headers: Record<string, string> = {};
    // Check for file fields
    if (
      (data.insurance_file as any) instanceof File ||
      (data.roadworthy_file as any) instanceof File ||
      (data.ecowas_file as any) instanceof File
    ) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (
          key === 'insurance_file' ||
          key === 'roadworthy_file' ||
          key === 'ecowas_file'
        ) {
          if (value instanceof File) formData.append(key, value);
          else if (typeof value === 'string') formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as any);
        }
      });
      body = formData;
    } else {
      body = JSON.stringify(data);
      headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(`${this.baseUrl}/api/buses`, {
      method: "POST",
      headers,
      body,
    });
    const b = await response.json();
    return {
      id: b._id || b.id,
      // Handle both old and new field names
      bus_number: b.bus_number || b.registration_number || "",
      registration_number: b.registration_number || b.bus_number || "",
      model: b.model || "",
      capacity: b.capacity || 0,
      year: b.year || 0,
      status: b.status || "active",
      fleet_number: b.fleet_number || "",
      manufacturer: b.manufacturer || "",
      station_name: b.station_name || "",
      fuel_type: b.fuel_type || "",
      body_type: b.body_type || "",
      chassis_number: b.chassis_number || "",
      engine_number: b.engine_number || "",
      tracking_device_number: b.tracking_device_number || "",
      purchase_date: b.purchase_date || "",
      next_maintenance: b.next_maintenance || "",
      mileage: b.mileage || "",
      owner: b.owner || "",
      amenities: Array.isArray(b.amenities) ? b.amenities : [],
      company_id: b.company_id || "",
      configuration_id: b.configuration_id || "",
      created_at: b.created_at,
      updated_at: b.updated_at
    };
  }
  async updateBus(id: string, data: Partial<Bus>): Promise<Bus> {
    let body: BodyInit;
    let headers: Record<string, string> = {};
    if (
      (data.insurance_file as any) instanceof File ||
      (data.roadworthy_file as any) instanceof File ||
      (data.ecowas_file as any) instanceof File
    ) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (
          key === 'insurance_file' ||
          key === 'roadworthy_file' ||
          key === 'ecowas_file'
        ) {
          if (value instanceof File) formData.append(key, value);
          else if (typeof value === 'string') formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as any);
        }
      });
      body = formData;
    } else {
      body = JSON.stringify(data);
      headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(`${this.baseUrl}/api/buses/${id}`, {
      method: "PATCH",
      headers,
      body,
    });
    const b = await response.json();
    return {
      id: b._id || b.id,
      // Handle both old and new field names
      bus_number: b.bus_number || b.registration_number || "",
      registration_number: b.registration_number || b.bus_number || "",
      model: b.model || "",
      capacity: b.capacity || 0,
      year: b.year || 0,
      status: b.status || "active",
      fleet_number: b.fleet_number || "",
      manufacturer: b.manufacturer || "",
      station_name: b.station_name || "",
      fuel_type: b.fuel_type || "",
      body_type: b.body_type || "",
      chassis_number: b.chassis_number || "",
      engine_number: b.engine_number || "",
      tracking_device_number: b.tracking_device_number || "",
      purchase_date: b.purchase_date || "",
      next_maintenance: b.next_maintenance || "",
      mileage: b.mileage || "",
      owner: b.owner || "",
      amenities: Array.isArray(b.amenities) ? b.amenities : [],
      company_id: b.company_id || "",
      configuration_id: b.configuration_id || "",
      created_at: b.created_at,
      updated_at: b.updated_at
    };
  }
  async deleteBus(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/api/buses/${id}`, { method: "DELETE" });
  }

  // BUS CONFIGURATIONS
  async getBusConfigurations(): Promise<BusConfiguration[]> {
    try {
      // Using the correct API endpoint for bus configurations
      console.log("Fetching bus configurations from API");
      const response = await fetch(`${this.baseUrl}/api/bus-configurations`, {
        headers: { 
          "Content-Type": "application/json"
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data.data || data)
        ? (data.data || data).map((c: any) => ({
            id: c._id || "",
            name: c.name || "",
            description: c.description || "",
            bus_type: c.bus_type || "",
            total_seats: c.total_seats || 0,
            seat_layout: c.seat_layout ? {
              rows: c.seat_layout.rows || 0,
              columns: c.seat_layout.columns || 0,
              arrangement_pattern: c.seat_layout.arrangement_pattern || "",
              seats: Array.isArray(c.seat_layout.seats) ? c.seat_layout.seats.map((s: any) => ({
                id: s.id || "",
                row: s.row || 0,
                column: s.column || 0,
                visual_row: s.visual_row !== undefined ? s.visual_row : s.row,
                visual_column: s.visual_column !== undefined ? s.visual_column : s.column,
                type: s.type || "regular",
                available: s.available !== undefined ? s.available : true,
                is_walkway: s.is_walkway || false,
                label: s.label || "",
              })) : []
            } : { rows: 0, columns: 0, seats: [] },
            amenities: Array.isArray(c.amenities) ? c.amenities : [],
            created_at: c.created_at || "",
            updated_at: c.updated_at || ""
          }))
        : [];
    } catch (error) {
      console.error("Error fetching bus configurations:", error);
      return [];
    }
  }

  async getBusConfiguration(id: string): Promise<BusConfiguration> {
    try {
      console.log("Getting bus configuration with ID:", id);
      const response = await fetch(`${this.baseUrl}/api/bus-configurations/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      const c = data.data || data;
      
      // Debug: Check for visual coordinates in the response
      if (c.seat_layout && Array.isArray(c.seat_layout.seats)) {
        const seatsWithVisualCoords = c.seat_layout.seats.filter((s: any) => 
          s.visual_row !== undefined && s.visual_column !== undefined
        );
        console.log(`Received ${seatsWithVisualCoords.length} seats with visual coordinates out of ${c.seat_layout.seats.length} total seats`);
        
        if (seatsWithVisualCoords.length > 0) {
          console.log("Sample seat with visual coordinates:", seatsWithVisualCoords[0]);
        }
      }
      
      return {
        id: c._id || "",
        name: c.name || "",
        description: c.description || "",
        bus_type: c.bus_type || "",
        total_seats: c.total_seats || 0,
        seat_layout: c.seat_layout ? {
          rows: c.seat_layout.rows || 0,
          columns: c.seat_layout.columns || 0,
          arrangement_pattern: c.seat_layout.arrangement_pattern || "",
          seats: Array.isArray(c.seat_layout.seats) ? c.seat_layout.seats.map((s: any) => ({
            id: s.id || "",
            row: s.row || 0,
            column: s.column || 0,
            visual_row: s.visual_row !== undefined ? s.visual_row : s.row,
            visual_column: s.visual_column !== undefined ? s.visual_column : s.column,
            type: s.type || "regular",
            available: s.available !== undefined ? s.available : true,
            is_walkway: s.is_walkway || false,
            label: s.label || "",
          })) : []
        } : { rows: 0, columns: 0, seats: [] },
        amenities: Array.isArray(c.amenities) ? c.amenities : [],
        created_at: c.created_at || "",
        updated_at: c.updated_at || ""
      };
    } catch (error) {
      console.error(`Error fetching bus configuration with ID ${id}:`, error);
      throw error;
    }
  }

  async createBusConfiguration(data: CreateBusConfigurationData): Promise<BusConfiguration> {
    try {
      // Debug: Check for visual coordinates in the request
      if (data.seat_layout && Array.isArray(data.seat_layout.seats)) {
        const seatsWithVisualCoords = data.seat_layout.seats.filter(s => 
          (s as any).visual_row !== undefined && (s as any).visual_column !== undefined
        );
        console.log(`Sending ${seatsWithVisualCoords.length} seats with visual coordinates out of ${data.seat_layout.seats.length} total seats`);
        
        if (seatsWithVisualCoords.length > 0) {
          console.log("Sample seat with visual coordinates:", seatsWithVisualCoords[0]);
        }
      }
      
      console.log("Creating bus configuration:", data);
      const response = await fetch(`${this.baseUrl}/api/bus-configurations`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      
      const responseData = await response.json();
      const c = responseData.data || responseData;
      
      return {
        id: c._id || "",
        name: c.name || "",
        description: c.description || "",
        bus_type: c.bus_type || "",
        total_seats: c.total_seats || 0,
        seat_layout: c.seat_layout || { rows: 0, columns: 0, seats: [] },
        amenities: Array.isArray(c.amenities) ? c.amenities : [],
        created_at: c.created_at || "",
        updated_at: c.updated_at || ""
      };
    } catch (error) {
      console.error("Error creating bus configuration:", error);
      throw error;
    }
  }

  async updateBusConfiguration(id: string, data: UpdateBusConfigurationData): Promise<BusConfiguration> {
    try {
      console.log("Updating bus configuration with ID:", id, data);
      const response = await fetch(`${this.baseUrl}/api/bus-configurations/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      
      const responseData = await response.json();
      const c = responseData.data || responseData;
      
      return {
        id: c._id || "",
        name: c.name || "",
        description: c.description || "",
        bus_type: c.bus_type || "",
        total_seats: c.total_seats || 0,
        seat_layout: c.seat_layout || { rows: 0, columns: 0, seats: [] },
        amenities: Array.isArray(c.amenities) ? c.amenities : [],
        created_at: c.created_at || "",
        updated_at: c.updated_at || ""
      };
    } catch (error) {
      console.error(`Error updating bus configuration with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteBusConfiguration(id: string): Promise<void> {
    try {
      console.log("Deleting bus configuration with ID:", id);
      const response = await fetch(`${this.baseUrl}/api/bus-configurations/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      
      return;
    } catch (error) {
      console.error(`Error deleting bus configuration with ID ${id}:`, error);
      throw error;
    }
  }
  
  async validateBusConfiguration(data: CreateBusConfigurationData): Promise<any> {
    try {
      console.log("Validating bus configuration:", data);
      const response = await fetch(`${this.baseUrl}/api/bus-configurations/validate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
      });
      
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error ${response.status}`);
      }
      
      return responseData;
    } catch (error) {
      console.error("Error validating bus configuration:", error);
      throw error;
    }
  }
  
  async cloneBusConfiguration(id: string, name: string): Promise<BusConfiguration> {
    try {
      console.log("Cloning bus configuration with ID:", id, "New name:", name);
      const response = await fetch(`${this.baseUrl}/api/bus-configurations/${id}/clone`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }
      
      const responseData = await response.json();
      const c = responseData.data || responseData;
      
      return {
        id: c._id || "",
        name: c.name || "",
        description: c.description || "",
        bus_type: c.bus_type || "",
        total_seats: c.total_seats || 0,
        seat_layout: c.seat_layout || { rows: 0, columns: 0, seats: [] },
        amenities: Array.isArray(c.amenities) ? c.amenities : [],
        created_at: c.created_at || "",
        updated_at: c.updated_at || ""
      };
    } catch (error) {
      console.error(`Error cloning bus configuration with ID ${id}:`, error);
      throw error;
    }
  }
  
  async getBusConfigurationByBus(busId: string): Promise<BusConfiguration | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/bus-configurations/buses/${busId}/configuration`);
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      const c = data.data || data;
      
      return {
        id: c._id || "",
        name: c.name || "",
        description: c.description || "",
        bus_type: c.bus_type || "",
        total_seats: c.total_seats || 0,
        seat_layout: c.seat_layout || { rows: 0, columns: 0, seats: [] },
        amenities: Array.isArray(c.amenities) ? c.amenities : [],
        created_at: c.created_at || "",
        updated_at: c.updated_at || ""
      };
    } catch (error) {
      console.error(`Error fetching configuration for bus with ID ${busId}:`, error);
      return null;
    }
  }

  // DRIVERS
  async getDrivers(): Promise<Driver[]> {
    const response = await fetch(`${this.baseUrl}/drivers`);
    const data = await response.json();
    return Array.isArray(data)
      ? data.map((d: any) => ({
          id: d._id || d.id,
          firstname: d.firstname,
          lastname: d.lastname,
          fullname: `${d.firstname} ${d.lastname}`,
          email: d.email,
          license_number: d.license_number,
          license_expiry_date: d.license_expiry_date,
          phone_number: d.phone_number,
          address: d.address,
          status: d.status,
          license_file: d.license_file,
          ghana_card_file: d.ghana_card_file,
          training_certificate_file: d.training_certificate_file,
          created_at: d.created_at,
          updated_at: d.updated_at
        }))
      : [];
  }
  async getDriver(id: string): Promise<Driver> {
    const response = await fetch(`${this.baseUrl}/drivers/${id}`);
    const d = await response.json();
    return {
      id: d._id || d.id,
      firstname: d.firstname,
      lastname: d.lastname,
      email: d.email,
      license_number: d.license_number,
      license_expiry_date: d.license_expiry_date,
      phone_number: d.phone_number,
      address: d.address,
      status: d.status,
      license_file: d.license_file,
      ghana_card_file: d.ghana_card_file,
      training_certificate_file: d.training_certificate_file,
      created_at: d.created_at,
      updated_at: d.updated_at
    };
  }
  async createDriver(data: Partial<CreateDriverData>): Promise<Driver> {
    let body: BodyInit;
    let headers: Record<string, string> = {};
    if (
      (data.license_file as any) instanceof File ||
      (data.ghana_card_file as any) instanceof File ||
      (data.training_certificate_file as any) instanceof File
    ) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (
          key === 'license_file' ||
          key === 'ghana_card_file' ||
          key === 'training_certificate_file'
        ) {
          if (value instanceof File) formData.append(key, value);
          else if (typeof value === 'string') formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as any);
        }
      });
      body = formData;
    } else {
      body = JSON.stringify(data);
      headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(`${this.baseUrl}/drivers`, {
      method: "POST",
      headers,
      body,
    });
    const d = await response.json();
    return {
      id: d._id || d.id,
      firstname: d.firstname,
      lastname: d.lastname,
      email: d.email,
      license_number: d.license_number,
      license_expiry_date: d.license_expiry_date,
      phone_number: d.phone_number,
      address: d.address,
      status: d.status,
      license_file: d.license_file,
      ghana_card_file: d.ghana_card_file,
      training_certificate_file: d.training_certificate_file,
      created_at: d.created_at,
      updated_at: d.updated_at
    };
  }
  async updateDriver(id: string, data: Partial<CreateDriverData>): Promise<Driver> {
    let body: BodyInit;
    let headers: Record<string, string> = {};
    if (
      (data.license_file as any) instanceof File ||
      (data.ghana_card_file as any) instanceof File ||
      (data.training_certificate_file as any) instanceof File
    ) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (
          key === 'license_file' ||
          key === 'ghana_card_file' ||
          key === 'training_certificate_file'
        ) {
          if (value instanceof File) formData.append(key, value);
          else if (typeof value === 'string') formData.append(key, value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as any);
        }
      });
      body = formData;
    } else {
      body = JSON.stringify(data);
      headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(`${this.baseUrl}/drivers/${id}`, {
      method: "PATCH",
      headers,
      body,
    });
    const d = await response.json();
    return {
      id: d._id || d.id,
      firstname: d.firstname,
      lastname: d.lastname,
      email: d.email,
      license_number: d.license_number,
      license_expiry_date: d.license_expiry_date,
      phone_number: d.phone_number,
      address: d.address,
      status: d.status,
      license_file: d.license_file,
      ghana_card_file: d.ghana_card_file,
      training_certificate_file: d.training_certificate_file,
      created_at: d.created_at,
      updated_at: d.updated_at
    };
  }
  async deleteDriver(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/drivers/${id}`, { method: "DELETE" });
  }

  // TERMINALS
  async getTerminals(): Promise<Terminal[]> {
    const response = await fetch(`${this.baseUrl}/terminals`);
    const data = await response.json();
    return Array.isArray(data)
      ? data.map((t: any) => ({
          id: t._id || t.id,
          name: t.name,
          code: t.code,
          address: t.address,
          is_station: t.is_station,
          is_active: t.is_active,
          service_country: t.service_country
        }))
      : [];
  }
  async getTerminal(id: string): Promise<Terminal> {
    const response = await fetch(`${this.baseUrl}/terminals/${id}`);
    const t = await response.json();
    return {
      id: t._id || t.id,
      name: t.name,
      code: t.code,
      address: t.address,
      is_station: t.is_station,
      is_active: t.is_active,
      service_country: t.service_country
    };
  }
  async createTerminal(data: Partial<Terminal>): Promise<Terminal> {
    const response = await fetch(`${this.baseUrl}/terminals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const t = await response.json();
    return {
      id: t._id || t.id,
      name: t.name,
      code: t.code,
      address: t.address,
      is_station: t.is_station,
      is_active: t.is_active,
      service_country: t.service_country
    };
  }
  async updateTerminal(id: string, data: Partial<Terminal>): Promise<Terminal> {
    const response = await fetch(`${this.baseUrl}/terminals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const t = await response.json();
    return {
      id: t._id || t.id,
      name: t.name,
      code: t.code,
      address: t.address,
      is_station: t.is_station,
      is_active: t.is_active,
      service_country: t.service_country
    };
  }
  async deleteTerminal(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/terminals/${id}`, { method: "DELETE" });
  }

  async getCompanies(): Promise<Company[]> {
    const response = await fetch(`${this.baseUrl}/companies`);
    return response.json();
  }

  async uploadFile({
    file,
    description = "",
    is_public = false,
    module,
    entity_id = ""
  }: {
    file: File;
    description?: string;
    is_public?: boolean;
    module: string;
    entity_id?: string;
  }): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);
    formData.append("is_public", String(is_public));
    formData.append("module", module);
    if (entity_id) formData.append("entity_id", entity_id);
    const response = await fetch(`${this.baseUrl}/files/upload`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("File upload failed");
    return response.json();
  }

  // TRIPS
  async getTrips(params: {
    route_id?: string;
    bus_id?: string;
    driver_id?: string;
    min_fare?: number;
    max_fare?: number;
    start_date?: string;
    end_date?: string;
  } = {}): Promise<Trip[]> {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join("&");
    const url = query ? `/trips?${query}` : "/trips";
    console.log("Fetching trips from URL:", `${this.baseUrl}${url}`);
    try {
    const response = await fetch(`${this.baseUrl}${url}`);
      console.log("Trips API response status:", response.status);
    const data = await response.json();
      console.log("Trips API raw data:", data);
      
      if (!Array.isArray(data)) {
        console.error("Trips API returned non-array data:", data);
        return [];
      }
      
      const mappedTrips = data.map((t: any) => ({
          id: t._id || t.id,
          route_id: t.route_id,
          fare: t.fare,
          bus_id: t.bus_id,
          driver_id: t.driver_id,
          created_at: t.created_at,
          updated_at: t.updated_at,
      }));
      
      console.log("Mapped trips:", mappedTrips);
      return mappedTrips;
    } catch (error) {
      console.error("Error fetching trips:", error);
      return [];
    }
  }

  async getTrip(id: string): Promise<Trip> {
    const response = await fetch(`${this.baseUrl}/trips/${id}`);
    const t = await response.json();
    return {
      id: t._id || t.id,
      route_id: t.route_id,
      fare: t.fare,
      bus_id: t.bus_id,
      driver_id: t.driver_id,
      created_at: t.created_at,
      updated_at: t.updated_at,
    };
  }

  async createTrip(data: CreateTripData): Promise<Trip> {
    const response = await fetch(`${this.baseUrl}/trips`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        route_id: data.route_id,
        fare: data.fare,
        bus_id: data.bus_id,
        driver_id: data.driver_id,
      }),
    });
    const t = await response.json();
    return {
      id: t._id || t.id,
      route_id: t.route_id,
      fare: t.fare,
      bus_id: t.bus_id,
      driver_id: t.driver_id,
      created_at: t.created_at,
      updated_at: t.updated_at,
    };
  }

  async updateTrip(id: string, data: UpdateTripData): Promise<Trip> {
    const response = await fetch(`${this.baseUrl}/trips/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(data.route_id !== undefined ? { route_id: data.route_id } : {}),
        ...(data.fare !== undefined ? { fare: data.fare } : {}),
        ...(data.bus_id !== undefined ? { bus_id: data.bus_id } : {}),
        ...(data.driver_id !== undefined ? { driver_id: data.driver_id } : {}),
      }),
    });
    const t = await response.json();
    return {
      id: t._id || t.id,
      route_id: t.route_id,
      fare: t.fare,
      bus_id: t.bus_id,
      driver_id: t.driver_id,
      created_at: t.created_at,
      updated_at: t.updated_at,
    };
  }

  async deleteTrip(id: string): Promise<void> {
    await fetch(`${this.baseUrl}/trips/${id}`, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL); 