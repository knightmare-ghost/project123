import { useState, useCallback } from "react";
import { apiClient, Driver, CreateDriverData, UpdateDriverData } from "@/service/api";

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getDrivers();
      setDrivers(Array.isArray(data) ? data.map(d => ({ ...d, fullname: `${d.firstname} ${d.lastname}` })) : []);
    } catch (err) {
      setError("Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  }, []);

  const createDriver = useCallback(async (driverData: Partial<CreateDriverData>) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.createDriver(driverData);
      await fetchDrivers();
    } catch (err) {
      setError("Failed to create driver");
    } finally {
      setLoading(false);
    }
  }, [fetchDrivers]);

  const updateDriver = useCallback(async (id: string, driverData: Partial<UpdateDriverData>) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.updateDriver(id, driverData);
      await fetchDrivers();
    } catch (err) {
      setError("Failed to update driver");
    } finally {
      setLoading(false);
    }
  }, [fetchDrivers]);

  const deleteDriver = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.deleteDriver(id);
      await fetchDrivers();
    } catch (err) {
      setError("Failed to delete driver");
    } finally {
      setLoading(false);
    }
  }, [fetchDrivers]);

  const clearError = useCallback(() => setError(null), []);

  return {
    drivers,
    loading,
    error,
    fetchDrivers,
    createDriver,
    updateDriver,
    deleteDriver,
    clearError,
  };
} 