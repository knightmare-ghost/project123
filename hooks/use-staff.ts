import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/service/api'
import { Staff, CreateStaffData, UpdateStaffData, StaffSearchParams } from '@/types'
import { toast } from 'sonner'

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStaff = useCallback(async (params?: StaffSearchParams) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.getStaff(params)
      // Staff API returns array directly, not wrapped in ApiResponse
      if (Array.isArray(response)) {
        setStaff(response)
      } else if (response.success && Array.isArray(response.data)) {
        setStaff(response.data)
      } else {
        setError('Invalid response format from staff API')
        toast.error('Failed to fetch staff')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch staff'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const createStaff = useCallback(async (data: CreateStaffData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.createStaff(data)
      // Staff API returns staff object directly on success
      if (response && response.id) {
        setStaff(prev => [...prev, response])
        toast.success('Staff member created successfully')
        return response
      } else if (response.success && response.data) {
        setStaff(prev => [...prev, response.data])
        toast.success('Staff member created successfully')
        return response.data
      } else {
        setError('Failed to create staff member')
        toast.error('Failed to create staff member')
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create staff member'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const updateStaff = useCallback(async (id: string, data: UpdateStaffData) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.updateStaff(id, data)
      // Staff API returns staff object directly on success
      if (response && response.id) {
        setStaff(prev => prev.map(staff => 
          staff.id === id ? response : staff
        ))
        toast.success('Staff member updated successfully')
        return response
      } else if (response.success && response.data) {
        setStaff(prev => prev.map(staff => 
          staff.id === id ? response.data : staff
        ))
        toast.success('Staff member updated successfully')
        return response.data
      } else {
        setError('Failed to update staff member')
        toast.error('Failed to update staff member')
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update staff member'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteStaff = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.deleteStaff(id)
      console.log('Delete staff response:', response)
      
      // Staff API might return different response formats for delete
      if (response && (response.message || response.success || response === true)) {
        setStaff(prev => prev.filter(staff => staff.id !== id))
        toast.success('Staff member deleted successfully')
        return true
      } else if (response && response.data && response.data.message) {
        setStaff(prev => prev.filter(staff => staff.id !== id))
        toast.success('Staff member deleted successfully')
        return true
      } else {
        // If we get here, the delete might have succeeded but response format is unexpected
        // Let's assume success and remove from local state
        setStaff(prev => prev.filter(staff => staff.id !== id))
        toast.success('Staff member deleted successfully')
        return true
      }
    } catch (err) {
      console.error('Delete staff error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete staff member'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteStaffWithRefresh = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.deleteStaff(id)
      console.log('Delete staff response:', response)
      
      // Always assume success and refresh the list
      toast.success('Staff member deleted successfully')
      
      // Refresh the staff list to ensure UI is in sync
      setTimeout(() => {
        fetchStaff()
      }, 500)
      
      return true
    } catch (err) {
      console.error('Delete staff error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete staff member'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchStaff])

  const getStaffMember = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.getStaffMember(id)
      // Staff API returns staff object directly or wrapped
      if (response && response.id) {
        return response
      } else if (response.success && response.data) {
        return response.data
      } else {
        setError('Failed to fetch staff member')
        toast.error('Failed to fetch staff member')
        return null
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch staff member'
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
    fetchStaff()
  }, [fetchStaff])

  return {
    staff,
    loading,
    error,
    fetchStaff,
    createStaff,
    updateStaff,
    deleteStaff,
    deleteStaffWithRefresh,
    getStaffMember,
    clearError
  }
} 