"use client"

import { Bell, Search, Menu, Cog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "../auth/auth-context"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useState } from "react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"

// Notification mock data and helpers
const notificationTabs = [
  { key: 'all', label: 'All' },
  { key: 'system', label: 'System' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'alerts', label: 'Alerts' },
];
const notificationsMock = [
  { id: 1, type: 'system', title: 'System Update', desc: 'The system will undergo maintenance at 10:00 PM.', time: new Date(Date.now() - 5 * 60 * 1000), read: false },
  { id: 2, type: 'bookings', title: 'New Booking', desc: 'A new booking has been made for Accra-Kumasi.', time: new Date(Date.now() - 20 * 60 * 1000), read: false },
  { id: 3, type: 'alerts', title: 'Driver Late', desc: 'Driver for Bus 12 is running late.', time: new Date(Date.now() - 2 * 60 * 60 * 1000), read: true },
  { id: 4, type: 'system', title: 'Password Changed', desc: 'Your password was changed successfully.', time: new Date(Date.now() - 24 * 60 * 60 * 1000), read: true },
];
function timeAgo(date: Date) {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export function Header({ isDashboard, onOpenSidebar, activeModule, onSearch, user }: {
  isDashboard: boolean,
  onOpenSidebar?: () => void,
  activeModule: string,
  onSearch: (value: string) => void,
  user: any
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState('all');
  const [notifications, setNotifications] = useState(notificationsMock);
  const filteredNotifications = notificationTab === 'all' ? notifications : notifications.filter(n => n.type === notificationTab);
  const hasUnread = notifications.some(n => !n.read);
  function markAllAsRead() {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  }
  // Contextual search placeholder
  const searchPlaceholders: Record<string, string> = {
    dashboard: "Search...",
    routes: "Search routes...",
    buses: "Search buses...",
    drivers: "Search drivers...",
    staff: "Search staff...",
    schedules: "Search trips...",
    bookings: "Search bookings...",
    parcels: "Search parcels...",
    analytics: "Search analytics...",
  };
  const placeholder = searchPlaceholders[activeModule] || "Search...";
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-30 px-3 py-2 sm:px-6 sm:py-4 md:px-8 md:py-5 flex items-center justify-between rounded-b-xl" style={{ boxShadow: '0 2px 8px 0 #008F3720', borderBottom: '2px solid #B7FFD2' }}>
      {/* Sidebar Hamburger for mobile */}
      {onOpenSidebar && (
        <button className="sm:hidden p-2 rounded-md border border-[#B7FFD2] bg-white mr-2 hover:bg-[#B7FFD2]/40 transition" onClick={onOpenSidebar} aria-label="Open sidebar menu">
          <Menu className="h-6 w-6 text-[#008F37]" />
        </button>
      )}
      {/* Context-aware Search Bar */}
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#008F37] h-5 w-5" />
          <Input
            placeholder={placeholder}
            className="pl-10 pr-4 py-2 w-full rounded-lg bg-[#B7FFD2]/40 focus:bg-white border border-[#B7FFD2] focus:border-[#008F37] text-base shadow-sm transition"
            onChange={e => onSearch(e.target.value)}
          />
        </div>
      </div>
      {/* Notification, Settings, and Profile */}
      <div className="flex items-center space-x-3 ml-4">
        {/* Notification */}
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-[#B7FFD2]/60 transition relative" onClick={() => setNotificationsOpen(true)}>
              <Bell className="h-5 w-5 text-[#008F37]" />
              {hasUnread && <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={8} className="mt-2 w-80 max-h-96 p-0 rounded-xl shadow-lg border border-[#B7FFD2] bg-white animate-fade-in">
            <div className="px-4 pt-4 pb-2 border-b flex items-center justify-between">
              <div className="font-semibold text-lg text-[#008F37]">Notifications</div>
              {/* Removed Mark all as read button */}
            </div>
            {/* Tabs */}
            <div className="flex border-b border-[#B7FFD2] bg-[#B7FFD2]/30">
              {notificationTabs.map(tab => (
                <button
                  key={tab.key}
                  className={`flex-1 py-2 text-xs font-semibold transition border-b-2 ${notificationTab === tab.key ? 'border-[#008F37] text-[#008F37] bg-white' : 'border-transparent text-gray-500 hover:text-[#008F37] hover:bg-[#B7FFD2]/40'}`}
                  onClick={() => setNotificationTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="overflow-y-auto max-h-72 divide-y divide-[#B7FFD2] animate-slide-in">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <Bell className="h-8 w-8 mb-2" />
                  <span className="text-sm">No notifications</span>
                </div>
              ) : (
                filteredNotifications.map(n => (
                  <div key={n.id} className={`flex items-start space-x-2 px-4 py-3 hover:bg-[#B7FFD2]/30 cursor-pointer relative ${!n.read ? 'bg-[#B7FFD2]/20' : ''}`}>
                    <Bell className="h-5 w-5 text-[#008F37] mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        {n.title}
                        {!n.read && <span className="ml-2 h-2 w-2 bg-red-500 rounded-full inline-block" />}
                      </p>
                      <p className="text-xs text-gray-600">{n.desc}</p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(n.time)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
        {/* Settings */}
        <Button variant="ghost" size="icon" className="hover:bg-[#B7FFD2]/60 transition" onClick={() => setSettingsOpen(true)}>
          <Cog className="h-5 w-5 text-[#008F37]" />
        </Button>
        {/* Profile */}
        <button className="focus:outline-none">
          <Avatar className="border-2 border-[#B7FFD2] shadow rounded-full cursor-pointer">
            <AvatarImage src={user?.image} alt={user?.name || "User"} />
            <AvatarFallback>{user?.name ? user.name[0] : "U"}</AvatarFallback>
          </Avatar>
        </button>
      </div>
      {/* Notifications Modal */}
      {/* Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-2xl rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Manage your account, preferences, and security</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
            {/* Profile Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#008F37]">Profile</h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Name</label>
                <Input defaultValue={user?.name} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Email</label>
                <Input defaultValue={user?.email} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Password</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Profile Photo</label>
                <Input type="file" />
              </div>
            </div>
            {/* Preferences Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#008F37]">Preferences</h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Theme</label>
                <select className="w-full border rounded-lg p-2">
                  <option>System</option>
                  <option>Light</option>
                  <option>Dark</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Notifications</label>
                <select className="w-full border rounded-lg p-2">
                  <option>All</option>
                  <option>Email Only</option>
                  <option>None</option>
                </select>
              </div>
              {/* <div className="space-y-2">
                <label className="block text-sm font-medium">Language</label>
                <select className="w-full border rounded-lg p-2">
                  <option>English</option>
                  <option>French</option>
                </select>
              </div> */}
            </div>
          </div>
          {/* Account Section */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold text-[#008F37] mb-2">Account</h3>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <Button variant="outline" className="border border-[#008F37] text-[#008F37] rounded-lg">View Activity Log</Button>
              <Button variant="destructive" className="rounded-lg">Deactivate Account</Button>
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setSettingsOpen(false)} className="bg-white border border-[#008F37] text-[#008F37] hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white rounded-lg px-4 py-2 font-semibold transition hover:shadow-lg">Cancel</Button>
            <Button className="bg-gradient-to-r from-[#1D976C] to-[#93F9B9] text-white shadow-lg rounded-lg px-4 py-2 font-semibold transition hover:bg-gradient-to-r hover:from-[#1D976C] hover:to-[#93F9B9] hover:text-white">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
