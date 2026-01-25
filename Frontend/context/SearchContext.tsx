// SearchContext.tsx
"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { usePathname } from "next/navigation"

type SearchContextType = {
  search: string
  setSearch: (s: string) => void
  resetSearch: () => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export default function SearchProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [search, setSearch] = useState("")

  // Reset search when navigating away from pages that use search
  useEffect(() => {
    const searchPages = ['/attendance', '/personnel']
    const isSearchPage = searchPages.some(page => pathname?.startsWith(page))
    
    if (!isSearchPage) {
      setSearch("")
    }
  }, [pathname])

  const resetSearch = () => setSearch("")

  return (
    <SearchContext.Provider value={{ search, setSearch, resetSearch }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error("useSearch must be used within SearchProvider")
  return ctx
}