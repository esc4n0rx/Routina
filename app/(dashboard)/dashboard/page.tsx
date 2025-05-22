import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentTasks } from "@/components/dashboard/recent-tasks"
import { SmartPomodoroButton } from "@/components/dashboard/smart-pomodoro-button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader />

      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <DashboardStats />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tarefas Recentes - Ocupa 2 colunas no desktop */}
        <div className="lg:col-span-2">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <RecentTasks />
          </Suspense>
        </div>

        {/* Próximos Eventos - 1 coluna no desktop */}
        <div className="space-y-6">
          <Card className="border-neutral-800 bg-routina-dark/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Próximos Eventos</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/10 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                    15
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Reunião de Equipe</p>
                    <p className="text-xs text-muted-foreground">15:00 - 16:00</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/10 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                    18
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Entrega do Projeto</p>
                    <p className="text-xs text-muted-foreground">Prazo final</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/10 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                    22
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Consulta Médica</p>
                    <p className="text-xs text-muted-foreground">10:30 - 11:30</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botão Inteligente do Pomodoro - Posicionado de forma inteligente */}
      <SmartPomodoroButton />
    </div>
  )
}