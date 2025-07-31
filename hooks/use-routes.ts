import { useState, useCallback } from "react";
import { apiClient, Route } from "@/service/api";

export function useRoutes() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getRoutes();
      setRoutes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to fetch routes");
    } finally {
      setLoading(false);
    }
  }, []);

  const createRoute = useCallback(async (routeData: Partial<Route>) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.createRoute(routeData);
      await fetchRoutes();
    } catch (err) {
      setError("Failed to create route");
    } finally {
      setLoading(false);
    }
  }, [fetchRoutes]);

  const updateRoute = useCallback(async (id: string, routeData: Partial<Route>) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.updateRoute(id, routeData);
      await fetchRoutes();
    } catch (err) {
      setError("Failed to update route");
    } finally {
      setLoading(false);
    }
  }, [fetchRoutes]);

  const deleteRoute = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.deleteRoute(id);
      await fetchRoutes();
    } catch (err) {
      setError("Failed to delete route");
    } finally {
      setLoading(false);
    }
  }, [fetchRoutes]);

  const clearError = useCallback(() => setError(null), []);

  return {
    routes,
    loading,
    error,
    fetchRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
    clearError,
  };
} 