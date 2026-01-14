import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/context/AuthContext"
import SearchProvider from "@/context/SearchContext"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "JIRAMA - Gestion du Personnel",
  description: "Système intégré de gestion du personnel et des ressources humaines",
  generator: "Santatra",
  
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans antialiased`}>
        <SearchProvider>
          <AuthProvider>{children}</AuthProvider>
        </SearchProvider>
        <Analytics />
      </body>
    </html>
  )
}
