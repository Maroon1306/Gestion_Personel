"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <nav className="bg-card border-b border-border px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">J</span>
        </div>
        <h1 className="text-lg font-semibold text-foreground">JIRAMA</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          title="Déconnexion"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </nav>
  )
}
