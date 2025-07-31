"use client"

import { useAuth } from "@/components/auth/auth-context"
import { LoginForm } from "@/components/auth/login-form"
import { Dashboard } from "@/components/dashboard/dashboard"

export function ClientWrapper() {
  const { user } = useAuth()

  if (!user) {
    return <LoginForm />
  }

  return <Dashboard />
}