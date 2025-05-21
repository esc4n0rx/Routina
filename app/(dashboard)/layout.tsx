import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"
import ProtectedRoute from "@/components/protected-route"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="relative min-h-screen bg-background">
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 pb-16 pt-2 px-4 md:px-6">{children}</main>
          <Sidebar />
        </div>
        <Toaster />
      </div>
    </ProtectedRoute>
  )
}