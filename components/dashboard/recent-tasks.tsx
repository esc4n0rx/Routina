"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Clock, AlertCircle, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Dados fictícios para demonstração - versão compacta
const mockTasks = [
  {
    id: "task-1",
    title: "Finalizar relatório mensal",
    status: "pending",
    priority: "high",
    category: "Trabalho",
    dueDate: "2025-05-20T18:00:00",
  },
  {
    id: "task-2",
    title: "Treino de musculação",
    status: "completed",
    priority: "medium",
    category: "Saúde",
  },
  {
    id: "task-3",
    title: "Comprar mantimentos",
    status: "pending",
    priority: "medium",
    category: "Pessoal",
    dueDate: "2025-05-16T20:00:00",
  },
  {
    id: "task-4",
    title: "Estudar para certificação",
    status: "pending",
    priority: "high",
    category: "Estudo",
    dueDate: "2025-05-25T23:59:00",
  },
];

export function RecentTasks() {
  const [tasks, setTasks] = useState(mockTasks.slice(0, 5)); // Mostrar apenas 5 tarefas

  // Na implementação real, buscaríamos tarefas recentes da API
  useEffect(() => {
    // Aqui ficaria a chamada para a API
    // Por enquanto, usamos os dados mockados
  }, []);

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
                  <TaskStatusIcon status={task.status} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{task.title}</h4>
                      <TaskPriorityBadge priority={task.priority} />
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {task.category && (
                        <>
                          <span>{task.category}</span>
                          {task.dueDate && <span>•</span>}
                        </>
                      )}
                      {task.dueDate && (
                        <span className={isOverdue(task.dueDate) && task.status !== "completed" ? "text-red-400" : ""}>
                          {formatDueDate(task.dueDate)}
                        </span>
                      )}
                    </div>
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

function TaskStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-routina-green flex-shrink-0" />
    case "pending":
      return <Clock className="h-4 w-4 text-routina-blue flex-shrink-0" />
    case "urgent":
      return <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
    default:
      return <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
  }
}

function TaskPriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case "high":
      return (
        <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-5">
          Alta
        </Badge>
      )
    case "medium":
      return (
        <Badge variant="default" className="bg-routina-blue hover:bg-routina-blue/90 text-xs px-1.5 py-0.5 h-5">
          Média
        </Badge>
      )
    case "low":
      return (
        <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5">
          Baixa
        </Badge>
      )
    default:
      return null
  }
}

function formatDueDate(dateString: string) {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  if (date.toDateString() === today.toDateString()) {
    return `Hoje ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Amanhã ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  } else {
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

function isOverdue(dateString: string) {
  const dueDate = new Date(dateString)
  const now = new Date()
  return dueDate < now
}