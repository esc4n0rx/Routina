"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Edit, Copy, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { getTasks, completeTask, deleteTask, getUserStats } from "@/lib/api"
import { TaskForm } from "@/components/tasks/task-form"
import { LevelUpPopup } from "@/components/tasks/level-up-popup"

export function TaskList() {
  const { toast } = useToast()
  const [tasks, setTasks] = useState(getTasks())
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [showLevelUpPopup, setShowLevelUpPopup] = useState(false)
  const [levelUpData, setLevelUpData] = useState({
    xpGained: 0,
    initialLevel: 0,
    initialXp: 0,
    newLevel: undefined as number | undefined,
  })

  const handleCompleteTask = (taskId: string) => {
    try {
      completeTask(taskId)

      // Update local state
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, status: task.status === "completed" ? "pending" : "completed" } : task,
        ),
      )

      // Get user stats for XP calculation
      const stats = getUserStats()
      const xpGained = 50 // XP gained for completing a task
      const initialXp = stats.xp
      const initialLevel = stats.level

      // Calculate if user levels up
      const totalXp = initialXp + xpGained
      const xpForNextLevel = stats.nextLevelXp
      let newLevel = undefined

      if (totalXp >= xpForNextLevel) {
        newLevel = initialLevel + 1
      }

      // Show level up popup
      setLevelUpData({
        xpGained,
        initialLevel,
        initialXp,
        newLevel,
      })
      setShowLevelUpPopup(true)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a tarefa.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = (taskId: string) => {
    try {
      deleteTask(taskId)

      // Update local state
      setTasks(tasks.filter((task) => task.id !== taskId))

      toast({
        title: "Tarefa removida",
        description: "A tarefa foi removida com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover a tarefa.",
        variant: "destructive",
      })
    }
  }

  const handleEditTask = (task: any) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleDuplicateTask = (task: any) => {
    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
      title: `${task.title} (cópia)`,
    }

    setTasks([...tasks, newTask])

    toast({
      title: "Tarefa duplicada",
      description: "A tarefa foi duplicada com sucesso.",
    })
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  const handleFormSubmit = (taskData: any) => {
    if (editingTask) {
      // Update existing task
      setTasks(tasks.map((task) => (task.id === editingTask.id ? { ...task, ...taskData } : task)))

      toast({
        title: "Tarefa atualizada",
        description: "A tarefa foi atualizada com sucesso.",
      })
    } else {
      // Add new task
      const newTask = {
        id: `task-${Date.now()}`,
        status: "pending",
        date: new Date().toISOString(),
        ...taskData,
      }

      setTasks([newTask, ...tasks])

      toast({
        title: "Tarefa adicionada",
        description: "A nova tarefa foi adicionada com sucesso.",
      })
    }

    handleFormClose()
  }

  return (
    <>
      <Card className="border-neutral-800 bg-black/60 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista de Tarefas</CardTitle>
          <Button onClick={() => setShowForm(true)} size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {tasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="rounded-full bg-muted/30 p-4 mb-4">
                  <CheckCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Nenhuma tarefa</h3>
                <p className="text-muted-foreground max-w-sm">
                  Você não tem nenhuma tarefa no momento. Clique no botão "Nova Tarefa" para adicionar uma.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/10 transition-colors"
                  >
                    <div className="pt-0.5">
                      <Checkbox
                        checked={task.status === "completed"}
                        onCheckedChange={() => handleCompleteTask(task.id)}
                        className={task.status === "completed" ? "text-green-500" : ""}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                          >
                            {task.title}
                          </h4>
                          {task.priority === "high" && <AlertCircle className="h-4 w-4 text-red-500" />}
                        </div>

                        <div className="flex items-center gap-2">
                          {task.category && (
                            <Badge variant="outline" className="text-xs">
                              {task.category}
                            </Badge>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <span className="sr-only">Abrir menu</span>
                                <svg
                                  width="15"
                                  height="15"
                                  viewBox="0 0 15 15"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                >
                                  <path
                                    d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                  ></path>
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateTask(task)}>
                                <Copy className="mr-2 h-4 w-4" />
                                <span>Duplicar</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-red-500 focus:text-red-500"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Excluir</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {task.description && (
                        <p
                          className={`text-sm mt-1 ${task.status === "completed" ? "text-muted-foreground/70 line-through" : "text-muted-foreground"}`}
                        >
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{formatDate(task.date)}</span>
                        {task.dueDate && (
                          <>
                            <span>•</span>
                            <span
                              className={isOverdue(task.dueDate) && task.status !== "completed" ? "text-red-500" : ""}
                            >
                              Prazo: {formatDate(task.dueDate)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <TaskForm open={showForm} onClose={handleFormClose} onSubmit={handleFormSubmit} initialData={editingTask} />

      <LevelUpPopup
        open={showLevelUpPopup}
        onClose={() => setShowLevelUpPopup(false)}
        xpGained={levelUpData.xpGained}
        initialLevel={levelUpData.initialLevel}
        initialXp={levelUpData.initialXp}
        newLevel={levelUpData.newLevel}
      />
    </>
  )
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

function isOverdue(dateString: string) {
  const dueDate = new Date(dateString)
  const today = new Date()
  return dueDate < today
}
