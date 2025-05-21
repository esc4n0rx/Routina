import { Suspense } from "react"
import { TaskList } from "@/components/tasks/task-list"
import { TaskFilters } from "@/components/tasks/task-filters"
import { Skeleton } from "@/components/ui/skeleton"

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
        <p className="text-muted-foreground">Gerencie suas tarefas e acompanhe seu progresso.</p>
      </div>

      <TaskFilters />

      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <TaskList />
      </Suspense>
    </div>
  )
}
