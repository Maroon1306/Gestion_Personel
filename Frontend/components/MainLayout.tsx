"use client"

import type React from "react"
import Sidebar from "./Sidebar"
import Navbar from "./Navbar"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import SearchProvider from "@/context/SearchContext"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <SearchProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <div className="pl-72">
          <Navbar />
          <main className="pt-20 ">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SearchProvider>
  )
}