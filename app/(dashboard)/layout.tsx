// app/(dashboard)/layout.tsx
"use client";

import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/toaster";
import ProtectedRoute from "@/components/protected-route";
import { TaskProvider } from "@/context/task-context";
import { PWAProvider } from "@/components/pwa/pwa-provider";
import PWAInstallButton from "@/components/pwa/pwa-install-button";
import { SafeAreaContainer } from "@/components/layout/safe-area-container";
import { NotificationProvider } from "@/components/notifications/notification-provider";
import { useNotificationPrompt } from "@/hooks/use-notification-prompt";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  // Este hook irá solicitar permissões de notificação automaticamente após o login
  useNotificationPrompt();

  return (
    <PWAProvider 
      config={{
        showInstallPrompt: false,
        forceInstallOnMobile: false,
        allowDesktopUsage: true,
      }}
    >
      <TaskProvider>
        <NotificationProvider>
          <div className="relative min-h-screen bg-background">
            <SafeAreaContainer respectBottom={false}>
              <div className="fixed top-4 right-4 z-40">
                <PWAInstallButton variant="minimal" size="sm" />
              </div>
              
              <main className="flex-1 pb-24 pt-6 px-4 md:px-6">{children}</main>
              <Sidebar />
            </SafeAreaContainer>
          </div>
        </NotificationProvider>
        <Toaster />
      </TaskProvider>
    </PWAProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ProtectedRoute>
  );
}