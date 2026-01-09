"use client"

import type React from "react"

import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Users, Briefcase, Building2, Stethoscope, FileText, Settings, ChevronRight } from "lucide-react"

interface MenuItem {
  label: string
  path: string
  roles: string[]
  icon: React.ReactNode
}

const menuItems: MenuItem[] = [
  {
    label: "Tableau de bord",
    path: "/dashboard",
    roles: ["ADMIN_USER", "ADMIN_RH", "USER"],
    icon: <LayoutGrid className="w-5 h-5" />,
  },
  { label: "Utilisateurs", path: "/users", roles: ["ADMIN_USER"], icon: <Users className="w-5 h-5" /> },
  { label: "Personnel", path: "/personnel", roles: ["ADMIN_RH"], icon: <Briefcase className="w-5 h-5" /> },
  {
    label: "Départements",
    path: "/departments",
    roles: ["ADMIN_USER", "ADMIN_RH", "USER"],
    icon: <Building2 className="w-5 h-5" />,
  },
  { label: "Médical", path: "/medical", roles: ["ADMIN_RH"], icon: <Stethoscope className="w-5 h-5" /> },
  { label: "Rapports", path: "/reports", roles: ["ADMIN_RH"], icon: <FileText className="w-5 h-5" /> },
  {
    label: "Paramètres",
    path: "/settings",
    roles: ["ADMIN_USER", "ADMIN_RH", "USER"],
    icon: <Settings className="w-5 h-5" />,
  },
]

export default function Sidebar() {
  const { user } = useAuth()
  const pathname = usePathname()

  const visibleItems = menuItems.filter((item) => item.roles.includes(user?.role || ""))

  return (
    <aside className="w-64 bg-sidebar-background text-sidebar-foreground h-screen overflow-y-auto flex flex-col border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        <h2 className="text-2xl font-bold text-sidebar-foreground">JIRAMA</h2>
        <p className="text-xs text-muted-foreground mt-1">Gestion Personnel</p>
      </div>

      <nav className="px-3 py-6 space-y-2 flex-1">
        {visibleItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all group ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-sidebar-accent rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-2">Connecté en tant que</p>
          <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
        </div>
      </div>
    </aside>
  )
}
