"use client"

import type React from "react"
import { useAuth } from "@/hooks/useAuth"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  Clock,
  Calendar,
  BarChart3,
  Settings,
  ChevronRight,
  LogOut,
  Home,
  UserCircle,
  Bell
} from "lucide-react"
import { useState } from "react"

export default function Sidebar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      roles: ["ADMIN_USER", "ADMIN_RH", "USER"],
      icon: <LayoutDashboard className="w-4 h-4" />,
      color: "from-blue-500 to-cyan-500"
    },
    { 
      label: "Pointage", 
      path: "/attendance", 
      roles: ["ADMIN_RH", "USER"], 
      icon: <Clock className="w-4 h-4" />,
      color: "from-emerald-500 to-green-500"
    },
    { 
      label: "Personnel", 
      path: "/personnel", 
      roles: ["ADMIN_RH"], 
      icon: <Users className="w-4 h-4" />,
      color: "from-violet-500 to-purple-500"
    },
    { 
      label: "Calendrier", 
      path: "/calendar", 
      roles: ["ADMIN_RH", "USER"], 
      icon: <Calendar className="w-4 h-4" />,
      color: "from-amber-500 to-orange-500"
    },
    { 
      label: "Analytics", 
      path: "/analytics", 
      roles: ["ADMIN_RH"], 
      icon: <BarChart3 className="w-4 h-4" />,
      color: "from-rose-500 to-pink-500"
    },
    {
      label: "Paramètres",
      path: "/settings",
      roles: ["ADMIN_USER", "ADMIN_RH", "USER"],
      icon: <Settings className="w-4 h-4" />,
      color: "from-gray-600 to-gray-800"
    },
  ]

  const visibleItems = menuItems.filter((item) => item.roles.includes(user?.role || ""))

  const handleQuickAction = (action: string) => {
    switch(action) {
      case "home":
        router.push("/dashboard")
        break
      case "notifications":
        router.push("/settings?tab=notifications")
        break
      case "profile":
        router.push("/settings?tab=profile")
        break
      case "logout":
        logout()
        router.push("/login")
        break
    }
  }

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800`}>
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl 
                        flex items-center justify-center shadow-md">
            <span className="text-white text-lg font-bold">J</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">JIRAMA</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Gestion RH</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-300 
                                   ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`)
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`group relative flex items-center ${collapsed ? 'justify-center px-2' : 'px-3'} 
                       py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className={`${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}>
                {item.icon}
              </div>
              {!collapsed && (
                <>
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Profile & Quick Actions */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <div className={`${collapsed ? 'justify-center' : ''} flex items-center gap-3 p-2 
                       rounded-lg bg-gray-50 dark:bg-gray-800`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 
                        flex items-center justify-center shadow-sm">
            <span className="text-white text-xs font-bold">{user?.name?.charAt(0) || 'U'}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                {user?.name || 'Utilisateur'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">En ligne</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}