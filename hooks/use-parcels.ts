import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/service/api'
import { Parcel, CreateParcelData, UpdateParcelData, ParcelSearchParams, PaginatedResponse } from '@/types'
import { toast } from 'sonner'

export function useParcels() {
  const [parcels, setParcels] = useState<Parcel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginatedResponse<Parcel> | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchParcels = useCallback(async (params?: ParcelSearchParams, isRetry = false) => {
    setLoading(true)
    if (!isRetry) {
      setError(null)
    }
    
    try {
      const response = await apiClient.getParcels(params)
      setParcels(response.data.data)
      setPagination(response.data)
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch parcels'
      
      // Check if it's the specific backend relationship error
      if (errorMessage.includes('undefined relationship [trip] on model [App\\Models\\Parcel]')) {
        const backendError = 'Unable to load parcels at this time. Please try again later.'
        setError(backendError)
        toast.error(backendError, {
          duration: 5000,
          description: 'The parcel service is temporarily unavailable.'
        })
      } else {
        setError(errorMessage)
        toast.error(errorMessage)
      }
      
      // Set empty arrays to prevent UI crashes
      setParcels([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const retryFetch = useCallback(() => {
    setRetryCount(prev => prev + 1)
    fetchParcels(undefined, true)
  }, [fetchParcels])

  const createParcel = useCallback(async (data: CreateParcelData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.createParcel(data)
      toast.success('Parcel created successfully')
      
      // Refresh the parcels list
      await fetchParcels()
      
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create parcel'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchParcels])

  const updateParcel = useCallback(async (id: string, data: UpdateParcelData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.updateParcel(id, data)
      toast.success('Parcel updated successfully')
      
      // Refresh the parcels list
      await fetchParcels()
      
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update parcel'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchParcels])

  const deleteParcel = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      await apiClient.deleteParcel(id)
      toast.success('Parcel deleted successfully')
      
      // Refresh the parcels list
      await fetchParcels()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete parcel'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchParcels])

  const getParcel = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.getParcel(id)
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch parcel'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
    setRetryCount(0)
  }, [])

  // Load parcels on mount
  useEffect(() => {
    fetchParcels()
  }, [fetchParcels])

  return {
    parcels,
    loading,
    error,
    pagination,
    retryCount,
    fetchParcels,
    retryFetch,
    createParcel,
    updateParcel,
    deleteParcel,
    getParcel,
    clearError
  }
} 