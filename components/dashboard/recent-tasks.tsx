"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Dados fictícios para demonstração
const mockTasks = [
  {
    id: "task-1",
    title: "Finalizar relatório mensal",
    description: "Completar o relatório de desempenho para a reunião de equipe",
    status: "pending",
    priority: "high",
    category: "Trabalho",
    date: "2025-05-15T10:30:00",
    dueDate: "2025-05-20T18:00:00",
  },
  {
    id: "task-2",
    title: "Treino de musculação",
    description: "Foco em exercícios para as costas e bíceps",
    status: "completed",
    priority: "medium",
    category: "Saúde",
    date: "2025-05-15T08:00:00",
  },
  {
    id: "task-3",
    title: "Comprar mantimentos",
    description: "Frutas, vegetais, proteínas e snacks saudáveis",
    status: "pending",
    priority: "medium",
    category: "Pessoal",
    date: "2025-05-16T14:00:00",
    dueDate: "2025-05-16T20:00:00",
  },
  {
    id: "task-4",
    title: "Estudar para certificação",
    description: "Revisar capítulos 5-8 e fazer exercícios práticos",
    status: "pending",
    priority: "high",
    category: "Estudo",
    date: "2025-05-14T19:00:00",
    dueDate: "2025-05-25T23:59:00",
  }
];

export function RecentTasks() {
  const [tasks, setTasks] = useState(mockTasks);

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
        <CardHeader>
          <CardTitle>Tarefas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/20 transition-colors"
              >
                <TaskStatusIcon status={task.status} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium truncate">{task.title}</h4>
                    <TaskPriorityBadge priority={task.priority} />
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{formatDate(task.date)}</span>
                    {task.category && (
                      <>
                        <span>•</span>
                        <span>{task.category}</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function TaskStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-5 w-5 text-routina-green mt-1" />
    case "pending":
      return <Clock className="h-5 w-5 text-routina-blue mt-1" />
    case "urgent":
      return <AlertCircle className="h-5 w-5 text-red-500 mt-1" />
    default:
      return <Clock className="h-5 w-5 text-muted-foreground mt-1" />
  }
}

function TaskPriorityBadge({ priority }: { priority: string }) {
  switch (priority) {
    case "high":
      return (
        <Badge variant="destructive" className="text-xs">
          Alta
        </Badge>
      )
    case "medium":
      return (
        <Badge variant="default" className="bg-routina-blue hover:bg-routina-blue/90 text-xs">
          Média
        </Badge>
      )
    case "low":
      return (
        <Badge variant="outline" className="text-xs">
          Baixa
        </Badge>
      )
    default:
      return null
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}