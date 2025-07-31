// Terminal Management module restored with full CRUD and latest schema
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient, Terminal } from "@/service/api";

const SERVICE_COUNTRIES = [
  { value: "GH", label: "Ghana" },
  { value: "NG", label: "Nigeria" },
  { value: "CI", label: "Côte d'Ivoire" },
];

export default function TerminalManagement() {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTerminal, setEditingTerminal] = useState<Terminal | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    is_station: false,
    is_active: true,
    service_country: "GH",
  });
  const [loading, setLoading] = useState(false);
  const [terminalToDelete, setTerminalToDelete] = useState<Terminal | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    fetchTerminals();
  }, []);

  async function fetchTerminals() {
    setLoading(true);
    try {
      const data = await apiClient.getTerminals();
      console.log('Fetched terminals:', data);
      setTerminals(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to fetch terminals");
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(field: keyof typeof formData, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setFormData({
      name: "",
      code: "",
      address: "",
      is_station: false,
      is_active: true,
      service_country: "GH",
    });
  }

  function handleAddTerminal() {
    setEditingTerminal(null);
    resetForm();
    setIsDialogOpen(true);
  }

  function handleEditTerminal(terminal: Terminal) {
    setEditingTerminal(terminal);
    setFormData({
      name: terminal.name,
      code: terminal.code,
      address: terminal.address,
      is_station: terminal.is_station,
      is_active: terminal.is_active,
      service_country: terminal.service_country,
    });
    setIsDialogOpen(true);
  }

  function handleDeleteTerminal(terminal: Terminal) {
    setTerminalToDelete(terminal);
    setIsDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!terminalToDelete) return;
    setLoading(true);
    try {
      await apiClient.deleteTerminal(terminalToDelete.id);
      toast.success("Terminal deleted successfully");
      fetchTerminals();
    } catch (e) {
      toast.error("Failed to delete terminal");
    } finally {
      setIsDeleteDialogOpen(false);
      setTerminalToDelete(null);
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const submitData = {
      ...formData,
      is_station: Boolean(formData.is_station),
      is_active: Boolean(formData.is_active),
    };
    try {
      if (editingTerminal) {
        await apiClient.updateTerminal(editingTerminal.id, submitData);
        toast.success("Terminal updated successfully");
      } else {
        await apiClient.createTerminal(submitData);
        toast.success("Terminal created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
      fetchTerminals();
    } catch (e) {
      toast.error("Failed to save terminal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header - Add Button and View Toggle */}
      <div className="flex justify-end items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          className="border border-[#008F37] text-[#008F37] px-3 py-1"
        >
          {viewMode === 'list' ? 'Grid View' : 'List View'}
        </Button>
        <Button
          onClick={handleAddTerminal}
          disabled={loading}
          className="bg-gradient-to-r from-[#1D976C] to-[#93F9B9] hover:from-[#008F37] hover:to-[#00662A] text-white shadow-lg rounded-lg px-4 py-2 font-semibold transition-all duration-300"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Add Terminal
        </Button>
      </div>
      {/* Grid/List View for Terminals */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {terminals.map((terminal) => (
            <Card key={terminal.id} className="p-4 flex flex-col gap-2">
              <div className="font-semibold text-base">{terminal.name} ({terminal.code})</div>
              <div className="text-xs text-gray-500">{terminal.address}</div>
              <div className="text-xs">Station: {terminal.is_station ? "Yes" : "No"} | Active: {terminal.is_active ? "Yes" : "No"}</div>
              <div className="text-xs">Country: {SERVICE_COUNTRIES.find(c => c.value === terminal.service_country)?.label || terminal.service_country}</div>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => handleEditTerminal(terminal)}><Edit className="h-4 w-4" /> Edit</Button>
                <Button size="sm" variant="outline" onClick={() => handleDeleteTerminal(terminal)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
                <th className="px-4 py-2 text-left">Code</th>
                <th className="px-4 py-2 text-left">Address</th>
                <th className="px-4 py-2 text-left">Station</th>
                <th className="px-4 py-2 text-left">Active</th>
                <th className="px-4 py-2 text-left">Country</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {terminals.map((terminal) => (
                <tr key={terminal.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2 font-medium">{terminal.name}</td>
                  <td className="px-4 py-2">{terminal.code}</td>
                  <td className="px-4 py-2">{terminal.address}</td>
                  <td className="px-4 py-2">{terminal.is_station ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">{terminal.is_active ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">{SERVICE_COUNTRIES.find(c => c.value === terminal.service_country)?.label || terminal.service_country}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditTerminal(terminal)}><Edit className="h-4 w-4" /> Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteTerminal(terminal)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
            <DialogTitle>{editingTerminal ? "Edit Terminal" : "Add New Terminal"}</DialogTitle>
            <DialogDescription>Fill in the terminal details below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={formData.name} onChange={e => handleInputChange("name", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={formData.code} onChange={e => handleInputChange("code", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={formData.address} onChange={e => handleInputChange("address", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Is Station</Label>
                <Select value={formData.is_station ? "true" : "false"} onValueChange={v => handleInputChange("is_station", v === "true") }>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Is Active</Label>
                <Select value={formData.is_active ? "true" : "false"} onValueChange={v => handleInputChange("is_active", v === "true") }>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Service Country</Label>
                <Select value={formData.service_country} onValueChange={v => handleInputChange("service_country", v)}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    {SERVICE_COUNTRIES.map((country) => (
                      <SelectItem key={country.value} value={country.value}>{country.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-[#008F37] text-white" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (editingTerminal ? "Update Terminal" : "Add Terminal")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Terminal</DialogTitle>
            <DialogDescription>Are you sure you want to delete this terminal? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button type="button" className="bg-red-600 text-white" onClick={confirmDelete} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 