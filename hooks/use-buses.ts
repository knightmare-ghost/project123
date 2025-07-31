import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/service/api';
import { Bus, CreateBusData, UpdateBusData, BusSearchParams, BusAvailabilityParams, PaginatedResponse } from '@/types';

interface UseBusesReturn {
  buses: Bus[];
  loading: boolean;
  error: string | null;
  pagination: PaginatedResponse<Bus> | null;
  fetchBuses: (params?: BusSearchParams) => Promise<void>;
  getBus: (id: string) => Promise<Bus | null>;
  createBus: (data: CreateBusData) => Promise<Bus | null>;
  updateBus: (id: string, data: UpdateBusData) => Promise<Bus | null>;
  deleteBus: (id: string) => Promise<boolean>;
  getBusAvailability: (params: BusAvailabilityParams) => Promise<Bus[]>;
  clearError: () => void;
}

export function useBuses(): UseBusesReturn {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchBuses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getBuses();
      setBuses(Array.isArray(response) ? response : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch buses';
      setError(errorMessage);
      console.error('Error fetching buses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getBus = useCallback(async (id: string): Promise<Bus | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getBus(id);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bus';
      setError(errorMessage);
      console.error('Error fetching bus:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createBus = useCallback(async (data: CreateBusData): Promise<Bus | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.createBus(data);
      await fetchBuses();
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create bus';
      setError(errorMessage);
      console.error('Error creating bus:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchBuses]);

  const updateBus = useCallback(async (id: string, data: UpdateBusData): Promise<Bus | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.updateBus(id, data);
      await fetchBuses();
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bus';
      setError(errorMessage);
      console.error('Error updating bus:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchBuses]);

  const deleteBus = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.deleteBus(id);
      setBuses(prevBuses => prevBuses.filter(bus => bus.id !== id));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete bus';
      setError(errorMessage);
      console.error('Error deleting bus:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBusAvailability = useCallback(async (params: BusAvailabilityParams): Promise<Bus[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getBusAvailability(params);
      return Array.isArray(response) ? response : [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bus availability';
      setError(errorMessage);
      console.error('Error fetching bus availability:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial buses on mount
  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  return {
    buses,
    loading,
    error,
    fetchBuses,
    getBus,
    createBus,
    updateBus,
    deleteBus,
    getBusAvailability,
    clearError,
  };
} 