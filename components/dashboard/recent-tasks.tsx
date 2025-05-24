"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Clock, AlertCircle, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { taskService, Task } from "@/services/api/task-service"
import { isTaskOverdue } from '@/lib/utils';

export function RecentTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecentTasks = async () => {
    try {
      setLoading(true)
      const response = await taskService.getTasks()
      if (!response.erro && response.tarefas) {
        // Flat o array caso seja aninhado e garantir que temos Task[]
        const tarefasFlat = response.tarefas.flat()
        
        // Ordenar por data de criação e pegar as 5 mais recentes
        const recentTasks = tarefasFlat
          .sort((a: Task, b: Task) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime())
          .slice(0, 5)
        
        setTasks(recentTasks)
      } else {
        setTasks([])
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas recentes:', error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentTasks()
  }, [])

  if (loading) {
    return (
      <Card className="border-routina-purple/30 bg-routina-dark/80 backdrop-blur-sm h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Tarefas Recentes</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="border-routina-purple/30 bg-routina-dark/80 backdrop-blur-sm h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Tarefas Recentes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tasks" className="text-xs text-muted-foreground hover:text-foreground">
                Ver todas
                <ChevronRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/10 transition-colors"
                >
                  <TaskStatusIcon task={task} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{task.nome}</h4>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
                        {task.pontos} XP
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {task.categorias && task.categorias.length > 0 && (
                        <div className="flex gap-1">
                          {task.categorias.slice(0, 2).map(category => (
                            <span 
                              key={category.id}
                              className="px-1.5 py-0.5 rounded text-xs"
                              style={{ 
                                backgroundColor: `${category.cor}20`, 
                                color: category.cor,
                                fontSize: '10px'
                              }}
                            >
                              {category.nome}
                            </span>
                          ))}
                          {task.categorias.length > 2 && (
                            <span className="text-muted-foreground">+{task.categorias.length - 2}</span>
                          )}
                        </div>
                      )}
                      
                      {task.data_vencimento && (
                        <>
                          {task.categorias && task.categorias.length > 0 && <span>•</span>}
                          <span className={isOverdue(task.data_vencimento, task.hora_vencimento) && !task.concluida ? "text-red-400" : ""}>
                            {formatDueDate(task.data_vencimento, task.hora_vencimento)}
                          </span>
                        </>
                      )}
                    </div>

                    {task.tags && task.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {task.tags.slice(0, 3).map(tag => (
                          <Badge 
                            key={tag.id}
                            variant="outline" 
                            className="text-xs px-1 py-0 h-4"
                            style={{ 
                              borderColor: tag.cor, 
                              color: tag.cor,
                              fontSize: '9px'
                            }}
                          >
                            {tag.nome}
                          </Badge>
                        ))}
                        {task.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs px-1 py-0 h-4" style={{ fontSize: '9px' }}>
                            +{task.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma tarefa recente</p>
              </div>
            )}
          </div>
          
          {tasks.length > 0 && (
            <div className="mt-4 pt-3 border-t border-neutral-800">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/tasks">
                  Ver todas as tarefas
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function TaskStatusIcon({ task }: { task: Task }) {
  if (task.concluida) {
    return <CheckCircle2 className="h-4 w-4 text-routina-green flex-shrink-0" />
  }
  
  if (task.vencida || (task.data_vencimento && isOverdue(task.data_vencimento, task.hora_vencimento))) {
    return <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
  }
  
  return <Clock className="h-4 w-4 text-routina-blue flex-shrink-0" />
}

function formatDueDate(dateString: string, timeString?: string) {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) {
    return timeString ? `Hoje ${timeString.substring(0, 5)}` : 'Hoje'
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return timeString ? `Amanhã ${timeString.substring(0, 5)}` : 'Amanhã'
  } else {
    const dateFormatted = date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'short'
    })
    return timeString ? `${dateFormatted} ${timeString.substring(0, 5)}` : dateFormatted
  }
}

function isOverdue(dateString: string, timeString?: string) {
  return isTaskOverdue(dateString, timeString);
}