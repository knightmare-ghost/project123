// Route Management module restored with full CRUD and latest schema
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient, Route, Terminal } from "@/service/api";

export default function RouteManagement() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    distance_in_km: 0,
    estimated_time: 0,
  });
  const [loading, setLoading] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    fetchRoutes();
    fetchTerminals();
  }, []);

  async function fetchRoutes() {
    setLoading(true);
    try {
      const data = await apiClient.getRoutes();
      setRoutes(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to fetch routes");
    } finally {
      setLoading(false);
    }
  }

  async function fetchTerminals() {
    try {
      const data = await apiClient.getTerminals();
      setTerminals(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to fetch terminals");
    }
  }

  function handleInputChange(
    field: keyof typeof formData,
    value: string | number
  ) {
    // Defensive: if value is an object, use its id property
    let safeValue = value;
    if (typeof value === "object" && value !== null && "id" in value) {
      safeValue = (value as any).id;
    }
    setFormData((prev) => ({ ...prev, [field]: safeValue }));
  }

  function resetForm() {
    setFormData({
      origin: terminals[0]?.id || "",
      destination: terminals[0]?.id || "",
      distance_in_km: 0,
      estimated_time: 0,
    });
  }

  function handleAddRoute() {
    setEditingRoute(null);
    resetForm();
    setIsDialogOpen(true);
  }

  function handleEditRoute(route: Route) {
    // Defensive: ensure origin/destination are strings (IDs), not objects
    let origin = route.origin;
    let destination = route.destination;
    if (typeof origin !== "string") {
      console.log("Origin is not a string:", origin);
      origin = (origin as any)?.id || "";
    }
    if (typeof destination !== "string") {
      console.log("Destination is not a string:", destination);
      destination = (destination as any)?.id || "";
    }
    setEditingRoute(route);
    setFormData({
      origin,
      destination,
      distance_in_km: route.distance_in_km,
      estimated_time: route.estimated_time,
    });
    setIsDialogOpen(true);
  }

  function handleDeleteRoute(route: Route) {
    setRouteToDelete(route);
    setIsDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!routeToDelete) return;
    setLoading(true);
    try {
      await apiClient.deleteRoute(routeToDelete.id);
      toast.success("Route deleted successfully");
      fetchRoutes();
    } catch (e) {
      toast.error("Failed to delete route");
    } finally {
      setIsDeleteDialogOpen(false);
      setRouteToDelete(null);
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const submitData = {
      ...formData,
      distance_in_km: Number(formData.distance_in_km),
      estimated_time: Number(formData.estimated_time),
    };
    try {
      if (editingRoute) {
        await apiClient.updateRoute(editingRoute.id, submitData);
        toast.success("Route updated successfully");
      } else {
        await apiClient.createRoute(submitData);
        toast.success("Route created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
      fetchRoutes();
    } catch (e) {
      toast.error("Failed to save route");
    } finally {
      setLoading(false);
    }
  }

  function getTerminalName(id: string) {
    return terminals.find((t) => t.id === id)?.name || id;
  }

  function getTerminalDisplay(terminal: any) {
    if (terminal && typeof terminal === 'object' && 'name' in terminal) {
      return terminal.name;
    }
    return typeof terminal === 'string' ? getTerminalName(terminal) : '';
  }

  return (
    <div className="space-y-6">
      {/* Header - Add Button and View Toggle */}
      <div className="flex justify-end items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
          className="border border-[#008F37] text-[#008F37] px-3 py-1"
        >
          {viewMode === "list" ? "Grid View" : "List View"}
        </Button>
        <Button
          onClick={handleAddRoute}
          disabled={loading}
          className="bg-gradient-to-r from-[#1D976C] to-[#93F9B9] hover:from-[#008F37] hover:to-[#00662A] text-white shadow-lg rounded-lg px-4 py-2 font-semibold transition-all duration-300"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Add Route
        </Button>
      </div>
      {/* Grid/List View for Routes */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((route) => (
            <Card key={route.id} className="p-4 flex flex-col gap-2">
              <div className="font-semibold text-base">
                {getTerminalDisplay(route.origin)} →{" "}
                {getTerminalDisplay(route.destination)}
              </div>
              <div className="text-xs text-gray-500">
                Distance: {route.distance_in_km} km | Estimated Time:{" "}
                {route.estimated_time} min
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditRoute(route)}
                >
                  <Edit className="h-4 w-4" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteRoute(route)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
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
                <th className="px-4 py-2 text-left">Origin</th>
                <th className="px-4 py-2 text-left">Destination</th>
                <th className="px-4 py-2 text-left">Distance (km)</th>
                <th className="px-4 py-2 text-left">Estimated Time (min)</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr
                  key={route.id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2 font-medium">
                    {getTerminalDisplay(route.origin)}
                  </td>
                  <td className="px-4 py-2">
                    {getTerminalDisplay(route.destination)}
                  </td>
                  <td className="px-4 py-2">{route.distance_in_km}</td>
                  <td className="px-4 py-2">{route.estimated_time}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditRoute(route)}
                    >
                      <Edit className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteRoute(route)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRoute ? "Edit Route" : "Add New Route"}
            </DialogTitle>
            <DialogDescription>
              Fill in the route details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Origin</Label>
                <Select
                  value={formData.origin}
                  onValueChange={(v) => handleInputChange("origin", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select origin terminal" />
                  </SelectTrigger>
                  <SelectContent>
                    {terminals.map((terminal) => (
                      <SelectItem key={terminal.id} value={terminal.id}>
                        {terminal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Destination</Label>
                <Select
                  value={formData.destination}
                  onValueChange={(v) => handleInputChange("destination", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination terminal" />
                  </SelectTrigger>
                  <SelectContent>
                    {terminals.map((terminal) => (
                      <SelectItem key={terminal.id} value={terminal.id}>
                        {terminal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Distance (km)</Label>
                <Input
                  type="number"
                  value={formData.distance_in_km}
                  onChange={(e) =>
                    handleInputChange("distance_in_km", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Estimated Time (minutes)</Label>
                <Input
                  type="number"
                  value={formData.estimated_time}
                  onChange={(e) =>
                    handleInputChange("estimated_time", e.target.value)
                  }
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#008F37] text-white"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : editingRoute ? (
                  "Update Route"
                ) : (
                  "Add Route"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Route</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this route? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-red-600 text-white"
              onClick={confirmDelete}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
