import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentTasks } from "@/components/dashboard/recent-tasks"
import { PomodoroButton } from "@/components/dashboard/pomodoro-button"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader />

      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <DashboardStats />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <RecentTasks />
        </Suspense>

        <div className="flex flex-col gap-6">
          <PomodoroButton />
          <div className="rounded-xl border border-neutral-800 bg-card p-6">
            <h3 className="text-lg font-medium mb-4">Próximos Eventos</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                  <span className="font-medium">15</span>
                </div>
                <div>
                  <p className="font-medium">Reunião de Equipe</p>
                  <p className="text-sm text-muted-foreground">15:00 - 16:00</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                  <span className="font-medium">18</span>
                </div>
                <div>
                  <p className="font-medium">Entrega do Projeto</p>
                  <p className="text-sm text-muted-foreground">Prazo final</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
