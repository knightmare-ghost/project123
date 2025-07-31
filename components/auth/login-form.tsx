"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "./auth-context"
import { Mail, Lock } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (login(email, password)) {
      // Login successful
    } else {
      setError('Invalid credentials. Use password "password" for any user.')
    }
  }

  const demoAccounts = [
    { label: "Admin", email: "admin@stc.com" },
    { label: "Regional Manager", email: "regional@stc.com" },
    { label: "Operations Officer", email: "ops@stc.com" },
    { label: "Maintenance Officer", email: "maint@stc.com" },
    { label: "Finance Department", email: "finance@stc.com" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white">
        <Card className="w-full max-w-xl shadow-2xl rounded-2xl border-0 p-8 md:p-10 animate-fade-in relative" style={{ borderLeft: '6px solid #008F37' }}>
          <CardHeader className="text-center mb-2">
            <div className="flex justify-center mb-4">
              <img src="/stc-logo.png" alt="STC Ghana" className="h-14 w-auto" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-[#008F37] tracking-tight">STC Ghana</CardTitle>
            <CardDescription className="text-base text-gray-600">Fleet Management System</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#008F37] h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="pl-10 py-3 text-base rounded-lg border border-[#B7FFD2] focus:border-[#008F37] focus:ring-2 focus:ring-[#008F37] shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#008F37] h-5 w-5" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="pl-10 py-3 text-base rounded-lg border border-[#B7FFD2] focus:border-[#008F37] focus:ring-2 focus:ring-[#008F37] shadow-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-demo">Quick Demo Login</Label>
                <select
                  id="role-demo"
                  className="w-full rounded-lg border border-[#B7FFD2] p-3 text-base bg-[#F8FFF9] focus:border-[#008F37] focus:ring-2 focus:ring-[#008F37] shadow-sm"
                  value=""
                  onChange={e => {
                    const selected = demoAccounts.find(acc => acc.label === e.target.value);
                    if (selected) setEmail(selected.email);
                  }}
                >
                  <option value="">Select a role to autofill email</option>
                  {demoAccounts.map(acc => (
                    <option key={acc.email} value={acc.label}>{acc.label}</option>
                  ))}
                </select>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full py-3 text-lg font-bold rounded-lg bg-gradient-to-r from-[#1D976C] to-[#93F9B9] text-white shadow-lg hover:from-[#008F37] hover:to-[#B7FFD2] transition-all duration-200">
                Sign In
              </Button>
            </form>
            <div className="mt-8 p-4 bg-[#F8FFF9] rounded-lg border border-[#B7FFD2]">
              <p className="text-sm font-semibold text-[#008F37] mb-2">Demo Accounts:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Admin:</strong> admin@stc.com</p>
                <p><strong>Regional Manager:</strong> regional@stc.com</p>
                <p><strong>Operations Officer:</strong> ops@stc.com</p>
                <p><strong>Maintenance Officer:</strong> maint@stc.com</p>
                <p><strong>Finance Department:</strong> finance@stc.com</p>
                <p><strong>Password:</strong> password</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Right: Gradient Branding with Image */}
      <div className="hidden md:flex flex-1 items-center justify-center relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1674606867357-a9b26fbdca9e?q=80&w=1121&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Fleet" className="absolute inset-0 w-full h-full object-cover z-0" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#00662A]/40 via-[#008F37]/30 to-[#B7FFD2]/20 z-10" />
        <img src="/stc-logo.png" alt="STC Logo" className="absolute right-8 bottom-8 h-32 w-auto opacity-10 z-20" />
        <div className="relative z-30 flex flex-col items-center justify-center w-full h-full">
        </div>
      </div>
    </div>
  )
}
