"use client"
import { LoginForm } from "@/components/auth/login-form"
import { Dashboard } from "@/components/dashboard/dashboard"
import { AuthProvider, useAuth } from "@/components/auth/auth-context"

function AppContent() {
  const { user } = useAuth()

  if (!user) {
    return <LoginForm />
  }

  return <Dashboard />
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
