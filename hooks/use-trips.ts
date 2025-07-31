import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/service/api'
import { Trip, CreateTripData, UpdateTripData, TripSearchParams } from '@/types'
import { toast } from 'sonner'

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTrips = useCallback(async (params?: Partial<{
    route_id?: string;
    bus_id?: string;
    driver_id?: string;
    min_fare?: number;
    max_fare?: number;
    start_date?: string;
    end_date?: string;
  }>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.getTrips(params || {})
      setTrips(Array.isArray(response) ? response : [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch trips'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const createTrip = useCallback(async (data: CreateTripData) => {
    setLoading(true)
    setError(null)
    try {
      await apiClient.createTrip(data)
      await fetchTrips()
      toast.success('Trip created successfully')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create trip'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchTrips])

  const updateTrip = useCallback(async (id: string, data: UpdateTripData) => {
    setLoading(true)
    setError(null)
    try {
      await apiClient.updateTrip(id, data)
      await fetchTrips()
      toast.success('Trip updated successfully')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update trip'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchTrips])

  const deleteTrip = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await apiClient.deleteTrip(id)
      await fetchTrips()
      toast.success('Trip deleted successfully')
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete trip'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchTrips])

  const getTrip = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.getTrip(id)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch trip'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  return {
    trips,
    loading,
    error,
    fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    getTrip,
    clearError
  }
} 