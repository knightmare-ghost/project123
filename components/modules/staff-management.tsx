"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Mail, Phone, MapPin, Shield, Loader2, Calendar } from "lucide-react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { useStaff } from "@/hooks/use-staff"
import { Staff as StaffType, CreateStaffData, UpdateStaffData } from "@/types"
import { useAuth } from "@/components/auth/auth-context"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export function StaffManagement({ searchTerm, onSearch }: { searchTerm: string; onSearch: (value: string) => void }) {
  const { user } = useAuth()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffType | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [hireDate, setHireDate] = useState<Date>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [staffToDelete, setStaffToDelete] = useState<StaffType | null>(null)
  const [formData, setFormData] = useState<CreateStaffData>({
    fullname: '',
    phone_number: '',
    email: '',
    role: '',
    assigned_station: '',
    status: 'active',
    hire_date: undefined
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Use local mock data for all staff operations
  const [mockStaff, setMockStaff] = useState<StaffType[]>([
    {
      id: '1',
      fullname: 'Sarah Adjei',
      staff_id: 'STC-STF-001',
      phone_number: '+233 24 111 2222',
      email: 'sarah.adjei@stc.com',
      role: 'Station Manager',
      assigned_station: 'Accra Central',
      status: 'active',
      hire_date: '2022-01-15',
    },
    {
      id: '2',
      fullname: 'Kwame Mensah',
      staff_id: 'STC-STF-002',
      phone_number: '+233 20 222 3333',
      email: 'kwame.mensah@stc.com',
      role: 'Booking Agent',
      assigned_station: 'Kumasi',
      status: 'inactive',
      hire_date: '2021-06-10',
    },
    {
      id: '3',
      fullname: 'Ama Owusu',
      staff_id: 'STC-STF-003',
      phone_number: '+233 27 333 4444',
      email: 'ama.owusu@stc.com',
      role: 'Customer Service',
      assigned_station: 'Takoradi',
      status: 'active',
      hire_date: '2023-03-05',
    },
  ]);

  // Use mockStaff for all UI and operations
  const staffList = mockStaff;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(staffList.length / itemsPerPage);
  const paginatedStaffs = staffList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const filteredStaff = staffList.filter(
    (member) =>
      (statusFilter === 'all' || member.status === statusFilter) &&
      (member.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.staff_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleAddStaff = () => {
    setEditingStaff(null)
    setHireDate(undefined)
    setFormData({
      fullname: '',
      phone_number: '',
      email: '',
      role: '',
      assigned_station: '',
      status: 'active',
      hire_date: undefined
    })
    setIsDialogOpen(true)
  }

  const handleEditStaff = (staffMember: StaffType) => {
    setEditingStaff(staffMember)
    setHireDate(staffMember.hire_date ? new Date(staffMember.hire_date) : undefined)
    setFormData({
      fullname: staffMember.fullname,
      phone_number: staffMember.phone_number,
      email: staffMember.email,
      role: staffMember.role,
      assigned_station: staffMember.assigned_station,
      status: staffMember.status
    })
    setIsDialogOpen(true)
  }

  const handleDeleteStaff = (staffMember: StaffType) => {
    setStaffToDelete(staffMember);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (staffToDelete) {
      setMockStaff((prev) => prev.filter((s) => s.id !== staffToDelete.id));
      toast.success(`Staff member "${staffToDelete.fullname}" deleted successfully.`);
      setDeleteDialogOpen(false)
      setStaffToDelete(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) {
      alert('User not authenticated')
      return
    }
    const submitData = {
      ...formData,
      user_id: user.id,
      hire_date: hireDate ? hireDate.toISOString().split('T')[0] : undefined,
      id: editingStaff ? editingStaff.id : (Math.random().toString(36).substr(2, 9)),
      staff_id: formData.staff_id || `STC-STF-${Math.floor(Math.random()*900+100)}`
    }
    if (editingStaff) {
      setMockStaff((prev) => prev.map((s) => s.id === editingStaff.id ? { ...s, ...submitData } : s));
      toast.success(`Staff member "${submitData.fullname}" updated successfully.`);
      setIsDialogOpen(false)
      setEditingStaff(null)
    } else {
      setMockStaff((prev) => [...prev, submitData]);
      toast.success(`Staff member "${submitData.fullname}" created successfully.`);
      setIsDialogOpen(false)
    }
  }

  const handleInputChange = (field: keyof CreateStaffData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Station Manager":
        return "bg-green-100 text-green-800"
      case "Booking Agent":
        return "bg-purple-100 text-purple-800"
      case "Customer Service":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified'
    return format(new Date(dateString), 'MMM dd, yyyy')
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      

      <div className="flex justify-between items-center">
        {/* Status Filter Dropdown */}
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-48 rounded-lg border border-[#B7FFD2] shadow-sm bg-white text-sm font-medium">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Staff ({staffList.length})</SelectItem>
            <SelectItem value="active">Active ({staffList.filter(s => s.status === 'active').length})</SelectItem>
            <SelectItem value="inactive">Inactive ({staffList.filter(s => s.status === 'inactive').length})</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className="border border-[#008F37] text-[#008F37] px-3 py-1"
            >
                {viewMode === 'list' ? 'Grid View' : 'List View'}
            </Button>
            {/* Add Button */}
            <Button onClick={handleAddStaff} className="bg-white border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white shadow-lg rounded-lg px-4 py-2 font-semibold transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" />
              Add Staff
            </Button>
        </div>
      </div>

      {/* Loading State */}
      

      {/* Staff Display */}
      {paginatedStaffs.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedStaffs.map((staffMember) => (
              <Card key={staffMember.id} className="bg-white rounded-xl shadow-lg border-0 p-6 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{staffMember.fullname}</CardTitle>
                      <CardDescription>{staffMember.staff_id || `ID: ${staffMember.id}`}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(staffMember.status)}>{staffMember.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-[#008F37]" />
                    <Badge className={getRoleColor(staffMember.role)}>{staffMember.role}</Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-[#008F37]" />
                    <span className="text-sm">{staffMember.email}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-[#008F37]" />
                    <span className="text-sm">{staffMember.phone_number}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-[#008F37]" />
                    <span className="text-sm">{staffMember.assigned_station}</span>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p>Hired: {formatDate(staffMember.hire_date)}</p>
                  </div>

                  <div className="flex space-x-2 pt-4">
                    <Button variant="outline" size="sm" onClick={() => handleEditStaff(staffMember)} className="flex-1 bg-white border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white rounded-lg px-4 py-2 font-semibold transition">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteStaff(staffMember)}
                      className="flex-1 bg-white border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white rounded-lg px-4 py-2 font-semibold transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Full Name</th>
                  <th className="px-4 py-2 text-left">Role</th>
                  <th className="px-4 py-2 text-left">Station</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStaffs.map(staffMember => (
                  <tr key={staffMember.id} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 font-medium">{staffMember.fullname}</td>
                    <td className="px-4 py-2"><Badge className={getRoleColor(staffMember.role)}>{staffMember.role}</Badge></td>
                    <td className="px-4 py-2">{staffMember.assigned_station}</td>
                    <td className="px-4 py-2">{staffMember.phone_number}</td>
                    <td className="px-4 py-2">
                      <Badge className={getStatusColor(staffMember.status)}>{staffMember.status}</Badge>
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => handleEditStaff(staffMember)} className="border-gray-300"><Edit className="h-4 w-4" /></Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => handleDeleteStaff(staffMember)} className="border-gray-300"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="col-span-full text-center py-10">
          <p>No staff members found.</p>
          {searchTerm && <p>Try a different search term.</p>}
        </div>
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

      {/* Add/Edit Staff Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle>{editingStaff ? "Edit Staff Member" : "Add New Staff Member"}</DialogTitle>
            <DialogDescription>
              {editingStaff ? "Update staff information" : "Add a new staff member to the system"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="staffId">Staff ID</Label>
                <Input 
                  id="staffId" 
                  placeholder="e.g., STC-STF-001" 
                  value={formData.staff_id || ''}
                  onChange={(e) => handleInputChange('staff_id', e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input 
                  id="fullName" 
                  placeholder="e.g., Sarah Adjei" 
                  value={formData.fullname}
                  onChange={(e) => handleInputChange('fullname', e.target.value)}
                  required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="sarah.adjei@stc.com" 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input 
                  id="phone" 
                  placeholder="+233 24 111 2222" 
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Station Manager">Station Manager</SelectItem>
                  <SelectItem value="Booking Agent">Booking Agent</SelectItem>
                  <SelectItem value="Customer Service">Customer Service</SelectItem>
                  <SelectItem value="Maintenance Staff">Maintenance Staff</SelectItem>
                    <SelectItem value="Driver">Driver</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="assignedStation">Assigned Station *</Label>
                <Input 
                  id="assignedStation" 
                  placeholder="e.g., Accra Central" 
                  value={formData.assigned_station}
                  onChange={(e) => handleInputChange('assigned_station', e.target.value)}
                  required
                />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hireDate">Hire Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !hireDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {hireDate ? format(hireDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={hireDate}
                      onSelect={setHireDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="bg-white border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white rounded-lg px-4 py-2 font-semibold transition-all duration-300"
              >
              Cancel
            </Button>
              <Button 
                type="submit" 
                className="bg-[#008F37] text-white font-semibold rounded-lg px-4 py-2 transition-all duration-300 hover:bg-[#00662A]"
                disabled={false}
              >
                {false ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {editingStaff ? 'Update Staff' : 'Add Staff'}
            </Button>
          </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-xl shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this staff member?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete <strong>{staffToDelete?.fullname}</strong> from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
