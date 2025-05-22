import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"
import ProtectedRoute from "@/components/protected-route"
import { TaskProvider } from "@/context/task-context"
import { PWAProvider } from "@/components/pwa/pwa-provider"
import PWAInstallButton from "@/components/pwa/pwa-install-button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <PWAProvider 
        config={{
          showInstallPrompt: false, // Não mostrar modal dentro do dashboard
          forceInstallOnMobile: false, // Permitir uso se já passou pela tela inicial
          allowDesktopUsage: true, // Permitir desktop dentro do dashboard
        }}
      >
        <TaskProvider>
          <div className="relative min-h-screen bg-background">
            <div className="flex flex-col min-h-screen">
              {/* Header com botão de instalação (se aplicável) */}
              <div className="fixed top-4 right-4 z-40">
                <PWAInstallButton variant="minimal" size="sm" />
              </div>
              
              <main className="flex-1 pb-16 pt-2 px-4 md:px-6">{children}</main>
              <Sidebar />
            </div>
            <Toaster />
          </div>
        </TaskProvider>
      </PWAProvider>
    </ProtectedRoute>
  )
}