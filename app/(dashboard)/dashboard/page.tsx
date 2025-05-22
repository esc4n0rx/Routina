import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentTasks } from "@/components/dashboard/recent-tasks"
import { SmartPomodoroButton } from "@/components/dashboard/smart-pomodoro-button"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader />

      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <DashboardStats />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-1">
        {/* Tarefas Recentes */}
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <RecentTasks />
        </Suspense>
      </div>

      {/* Botão Inteligente do Pomodoro - Posicionado de forma inteligente */}
      <SmartPomodoroButton />
    </div>
  )
}