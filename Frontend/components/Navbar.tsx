"use client"

import { useState } from "react"
import { Search, Bell, Sun, Moon, HelpCircle, User, Settings, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import { useSearch } from "@/context/SearchContext"
import { useAuth } from "@/hooks/useAuth"

export default function Navbar() {
  const pathname = usePathname()
  const { search, setSearch } = useSearch()
  const { user, logout } = useAuth()
  const [darkMode, setDarkMode] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const showSearch = pathname?.startsWith("/personnel") || pathname?.startsWith("/attendance")

  return (
    <nav className="fixed top-0 right-0 left-64 z-40 glass-card border-b px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 dark:text-gray-400">JIRAMA</span>
          <span className="text-gray-400">/</span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {pathname === "/dashboard" && "Tableau de bord"}
            {pathname === "/attendance" && "Pointage"}
            {pathname === "/personnel" && "Personnel"}
            {pathname === "/analytics" && "Analytiques"}
            {pathname === "/settings" && "Paramètres"}
          </span>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-xl mx-8">
          {showSearch && (
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                placeholder="Rechercher employés, matricules, départements..."
                className="w-full pl-12 pr-2 py-2 rounded-xl border border-gray-300 dark:border-gray-700 
                         bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white 
                         placeholder:text-gray-500 dark:placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent 
                         transition-all duration-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Changer de thème"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
          </div>

          {/* Help */}
          <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 
                            flex items-center justify-center">
                <span className="text-white font-bold text-sm">{user?.name?.charAt(0)}</span>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role?.replace('_', ' ')}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 glass-card rounded-2xl p-2 
                              shadow-2xl border border-gray-200 dark:border-gray-800 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl 
                                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">Mon profil</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-xl 
                                     hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">Paramètres</span>
                    </button>
                    <div className="h-px bg-gray-200 dark:bg-gray-800 my-2" />
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 p-3 rounded-xl 
                               hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 
                               transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}