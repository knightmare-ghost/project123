"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type UserRole = "hq_admin" | "regional_manager" | "operations_officer" | "maintenance_officer" | "finance"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  stationId?: string
  busId?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Admin",
    email: "admin@stc.com",
    role: "hq_admin",
  },
  {
    id: "4",
    name: "Regina Regional",
    email: "regional@stc.com",
    role: "regional_manager",
    stationId: "kumasi-central",
  },
  {
    id: "5",
    name: "Oscar Ops",
    email: "ops@stc.com",
    role: "operations_officer",
    stationId: "accra-central",
  },
  {
    id: "6",
    name: "Mavis Maint",
    email: "maint@stc.com",
    role: "maintenance_officer",
    stationId: "takoradi-station",
  },
  {
    id: "7",
    name: "Felicia Finance",
    email: "finance@stc.com",
    role: "finance",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = (email: string, password: string): boolean => {
    const foundUser = mockUsers.find((u) => u.email === email)
    if (foundUser && password === "password") {
      setUser(foundUser)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
