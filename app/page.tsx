import { LoginForm } from "@/components/auth/login-form"
import { Dashboard } from "@/components/dashboard/dashboard"
import { AuthProvider } from "@/components/auth/auth-context"
import { ClientWrapper } from "@/components/client-wrapper"

export default function Home() {
  return (
    <AuthProvider>
      <ClientWrapper />
    </AuthProvider>
  )
}