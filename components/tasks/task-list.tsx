'use client';

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Trash2, Edit, Copy, CheckCircle, AlertCircle, Calendar, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { TaskForm } from "@/components/tasks/task-form"
import { DelayTaskDialog } from "@/components/tasks/delay-task-dialog"
import { LevelUpPopup } from "@/components/tasks/level-up-popup"
import { useAuth } from "@/context/auth-context"
import { useTask } from "@/context/task-context"
import { taskService, Task } from "@/services/api/task-service"
import { levelService } from "@/lib/level-utils"

export function TaskList() {
  const { toast } = useToast()
  const { user, updateUser } = useAuth()
  const { filteredTasks, loadingTasks, refreshTasks } = useTask()
  
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showDelayDialog, setShowDelayDialog] = useState(false)
  const [delayingTask, setDelayingTask] = useState<Task | null>(null)
  const [showLevelUpPopup, setShowLevelUpPopup] = useState(false)
  const [levelUpData, setLevelUpData] = useState({
    xpGained: 0,
    oldXP: 0,
    newXP: 0,
  })

  const handleCompleteTask = async (taskId: string) => {
    try {
      const task = filteredTasks.find(t => t.id === taskId)
      if (!task) return

      if (task.concluida) {
        toast({
          title: "Aviso",
          description: "Esta tarefa já foi concluída.",
          variant: "destructive",
        })
        return
      }

      // Armazenar XP atual antes da requisição
      const currentXP = user?.pontos_xp || 0

      const response = await taskService.completeTask(taskId)
      
      if (!response.erro && response.tarefa) {
        // Atualizar a lista de tarefas
        await refreshTasks()

        // Usar dados reais da resposta da API
        let xpGained = 0
        let newXP = currentXP

        // Se a tarefa não foi vencida, ganhou XP
        if (!response.tarefa.vencida) {
          xpGained = response.tarefa.pontos
          newXP = currentXP + xpGained

          // Verificar se houve level up usando o serviço real
          const levelUpInfo = levelService.checkLevelUp(currentXP, newXP)
          
          if (user) {
            // Atualizar dados do usuário com valores reais
            updateUser({
              pontos_xp: newXP,
              nivel: levelUpInfo.newLevel.nivel,
              sequencia: user.sequencia + 1
            })
          }

          // Mostrar popup com dados reais
          setLevelUpData({
            xpGained,
            oldXP: currentXP,
            newXP,
          })
          setShowLevelUpPopup(true)
        }

        toast({
          title: "Tarefa concluída",
          description: response.mensagem,
        })
      }
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await taskService.deleteTask(taskId)
      
      if (!response.erro) {
        await refreshTasks()
        toast({
          title: "Tarefa removida",
          description: response.mensagem,
        })
      }
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error)
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleDuplicateTask = (task: Task) => {
    const taskData = {
      nome: `${task.nome} (cópia)`,
      descricao: task.descricao,
      data_vencimento: task.data_vencimento,
      hora_vencimento: task.hora_vencimento,
      pontos: task.pontos,
      categorias: task.categorias?.map(c => c.id) || [],
      tags: task.tags?.map(t => t.id) || []
    }

    handleFormSubmit(taskData)
  }

  const handleDelayTask = (task: Task) => {
    setDelayingTask(task)
    setShowDelayDialog(true)
  }

  const handleConfirmDelay = async (delayData: { data_vencimento: string; hora_vencimento?: string }) => {
    if (!delayingTask) return

    try {
      const response = await taskService.delayTask(delayingTask.id, delayData)
      
      if (!response.erro && response.tarefa) {
        await refreshTasks()
        toast({
          title: "Tarefa adiada",
          description: response.mensagem,
        })
      }
    } catch (error) {
      console.error('Erro ao adiar tarefa:', error)
    } finally {
      setShowDelayDialog(false)
      setDelayingTask(null)
    }
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingTask(null)
  }

  const handleFormSubmit = async (taskData: any) => {
    try {
      if (editingTask) {
        // Atualiza tarefa existente
        const response = await taskService.updateTask(editingTask.id, {
          nome: taskData.nome,
          descricao: taskData.descricao,
          data_vencimento: taskData.data_vencimento,
          hora_vencimento: taskData.hora_vencimento,
          pontos: taskData.pontos
        })

        if (!response.erro && response.tarefa) {
          await refreshTasks()
          toast({
            title: "Tarefa atualizada",
            description: response.mensagem,
          })
        }
      } else {
        // Adiciona nova tarefa
        const response = await taskService.createTask(taskData)

        if (!response.erro && response.tarefa) {
          await refreshTasks()
          toast({
            title: "Tarefa adicionada",
            description: response.mensagem,
          })
        }
      }

      handleFormClose()
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
    }
  }

  if (loadingTasks) {
    return (
      <Card className="border-neutral-800 bg-black/60 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-neutral-800 bg-black/60 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista de Tarefas ({filteredTasks.length})</CardTitle>
          <Button onClick={() => setShowForm(true)} size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {filteredTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="rounded-full bg-muted/30 p-4 mb-4">
                  <CheckCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Nenhuma tarefa encontrada</h3>
                <p className="text-muted-foreground max-w-sm">
                  {loadingTasks 
                    ? "Carregando tarefas..."
                    : "Nenhuma tarefa corresponde aos filtros aplicados. Tente ajustar os filtros ou criar uma nova tarefa."
                  }
                </p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task, index) => (
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
                        checked={task.concluida}
                        onCheckedChange={() => handleCompleteTask(task.id)}
                        className={task.concluida ? "text-green-500" : ""}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4
                            className={`font-medium ${task.concluida ? "line-through text-muted-foreground" : ""}`}
                          >
                            {task.nome}
                          </h4>
                          {task.vencida && !task.concluida && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {task.pontos} XP
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          {task.categorias && task.categorias.length > 0 && (
                            <div className="flex gap-1">
                              {task.categorias.map(category => (
                                <Badge 
                                  key={category.id}
                                  variant="outline" 
                                  className="text-xs"
                                  style={{ borderColor: category.cor, color: category.cor }}
                                >
                                  {category.nome}
                                </Badge>
                              ))}
                            </div>
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
                              {!task.concluida && (
                                <DropdownMenuItem onClick={() => handleDelayTask(task)}>
                                  <Clock className="mr-2 h-4 w-4" />
                                  <span>Adiar</span>
                                </DropdownMenuItem>
                              )}
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

                      {task.descricao && (
                        <p
                          className={`text-sm mt-1 ${task.concluida ? "text-muted-foreground/70 line-through" : "text-muted-foreground"}`}
                        >
                          {task.descricao}
                        </p>
                      )}

                      {task.tags && task.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {task.tags.map(tag => (
                            <Badge 
                              key={tag.id}
                              variant="secondary" 
                              className="text-xs"
                              style={{ backgroundColor: `${tag.cor}20`, color: tag.cor }}
                            >
                              {tag.nome}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(task.data_criacao)}</span>
                        </div>
                        {task.data_vencimento && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span
                                className={isOverdue(task.data_vencimento, task.hora_vencimento) && !task.concluida ? "text-red-500" : ""}
                              >
                                Prazo: {formatDateTime(task.data_vencimento, task.hora_vencimento)}
                              </span>
                            </div>
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

      <TaskForm 
        open={showForm} 
        onClose={handleFormClose} 
        onSubmit={handleFormSubmit} 
        initialData={editingTask} 
      />

      <DelayTaskDialog
        open={showDelayDialog}
        onClose={() => {
          setShowDelayDialog(false)
          setDelayingTask(null)
        }}
        onConfirm={handleConfirmDelay}
        task={delayingTask}
      />

      <LevelUpPopup
        show={showLevelUpPopup}
        onClose={() => setShowLevelUpPopup(false)}
        xpGained={levelUpData.xpGained}
        oldXP={levelUpData.oldXP}
        newXP={levelUpData.newXP}
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

function formatDateTime(dateString: string, timeString?: string) {
  const date = new Date(dateString)
  const dateFormatted = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
  
  if (timeString) {
    return `${dateFormatted} às ${timeString.substring(0, 5)}`
  }
  
  return dateFormatted
}

function isOverdue(dateString: string, timeString?: string) {
  const now = new Date()
  const dueDate = new Date(dateString)
  
  if (timeString) {
    const [hours, minutes] = timeString.split(':').map(Number)
    dueDate.setHours(hours, minutes, 0, 0)
  } else {
    dueDate.setHours(23, 59, 59, 999) // Final do dia se não houver horário específico
  }
  
  return dueDate < now
}