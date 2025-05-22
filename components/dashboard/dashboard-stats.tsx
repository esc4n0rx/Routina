"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trophy, Zap, TrendingUp, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/context/auth-context"
import { taskService, Task } from "@/services/api/task-service"

export function DashboardStats() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // Carregar tarefas para calcular estatísticas
  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await taskService.getTasks()
      if (!response.erro && response.tarefas) {
        setTasks(response.tarefas.flat())
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // Função para calcular XP necessário para o próximo nível
  const getNextLevelXp = (currentLevel: number) => {
    // Fórmula progressiva: cada nível requer mais XP
    return Math.floor(1000 * Math.pow(1.2, currentLevel - 1))
  }

  // Função para calcular progresso no nível atual
  const getCurrentLevelProgress = (currentXp: number, currentLevel: number) => {
    const previousLevelXp = currentLevel > 1 ? getNextLevelXp(currentLevel - 1) : 0
    const nextLevelXp = getNextLevelXp(currentLevel)
    const xpInCurrentLevel = currentXp - previousLevelXp
    const xpNeededForCurrentLevel = nextLevelXp - previousLevelXp
    
    return {
      current: Math.max(0, xpInCurrentLevel),
      needed: xpNeededForCurrentLevel,
      percentage: Math.max(0, Math.min(100, (xpInCurrentLevel / xpNeededForCurrentLevel) * 100))
    }
  }

  // Calcular estatísticas das tarefas
  const calculateTaskStats = () => {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    const todayTasks = tasks.filter(task => {
      const taskDate = new Date(task.data_criacao)
      return taskDate >= todayStart && taskDate <= todayEnd
    })

    const completedToday = todayTasks.filter(task => task.concluida).length
    const pendingToday = todayTasks.filter(task => !task.concluida && !task.vencida).length
    const overdueToday = todayTasks.filter(task => !task.concluida && task.vencida).length

    // Calcular produtividade (% de tarefas concluídas vs total)
    const totalTasksToday = todayTasks.length
    const productivity = totalTasksToday > 0 ? Math.round((completedToday / totalTasksToday) * 100) : 0

    return {
      completedToday,
      pendingToday: pendingToday + overdueToday,
      productivity,
      totalTasksToday
    }
  }

  // Dados reais do usuário
  const stats = {
    level: user?.nivel || 1,
    xp: user?.pontos_xp || 0,
    sequence: user?.sequencia || 0,
  }

  const levelProgress = getCurrentLevelProgress(stats.xp, stats.level)
  const taskStats = calculateTaskStats()

  if (loading) {
    return (
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-neutral-800 bg-routina-dark/80 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-neutral-700 rounded mb-2"></div>
                <div className="h-8 bg-neutral-700 rounded mb-2"></div>
                <div className="h-3 bg-neutral-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {/* Card de Nível e XP */}
        <Card className="border-routina-purple/30 bg-routina-dark/80 backdrop-blur-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-full bg-routina-purple/20 p-2">
                <Trophy className="h-5 w-5 text-routina-purple" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Nível</h3>
                <p className="text-2xl font-bold">{stats.level}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{levelProgress.current} XP</span>
                <span>{levelProgress.needed} XP</span>
              </div>
              <XPProgressBar value={levelProgress.percentage} />
              <p className="text-xs text-muted-foreground">
                {levelProgress.needed - levelProgress.current} XP para nível {stats.level + 1}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card de Sequência */}
        <Card className="border-routina-blue/30 bg-routina-dark/80 backdrop-blur-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-full bg-routina-blue/20 p-2">
                <Target className="h-5 w-5 text-routina-blue" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Sequência</h3>
                <p className="text-2xl font-bold">{stats.sequence}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.sequence > 0 
                ? `${stats.sequence} dias consecutivos` 
                : 'Complete tarefas para iniciar sua sequência'
              }
            </p>
          </CardContent>
        </Card>

        {/* Card de Produtividade */}
        <Card className="border-routina-green/30 bg-routina-dark/80 backdrop-blur-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-full bg-routina-green/20 p-2">
                <TrendingUp className="h-5 w-5 text-routina-green" />
              </div>
              <div>
                <h3 className="font-medium text-sm">Produtividade</h3>
                <p className="text-2xl font-bold">{taskStats.productivity}%</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {taskStats.totalTasksToday > 0 
                ? `${taskStats.completedToday}/${taskStats.totalTasksToday} tarefas hoje`
                : 'Nenhuma tarefa hoje'
              }
            </p>
          </CardContent>
        </Card>

        {/* Card de Tarefas Hoje */}
        <Card className="border-neutral-800 bg-routina-dark/80 backdrop-blur-sm">
          <CardContent className="p-4 md:p-6">
            <h3 className="font-medium text-sm mb-3">Tarefas Hoje</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-routina-green/10 p-2 text-center">
                <div className="text-lg font-bold">{taskStats.completedToday}</div>
                <div className="text-xs text-muted-foreground">Concluídas</div>
              </div>
              <div className="rounded-lg bg-muted/30 p-2 text-center">
                <div className="text-lg font-bold">{taskStats.pendingToday}</div>
                <div className="text-xs text-muted-foreground">Pendentes</div>
              </div>
            </div>
            
            {taskStats.totalTasksToday > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progresso do dia</span>
                  <span>{taskStats.productivity}%</span>
                </div>
                <Progress value={taskStats.productivity} className="h-1.5 bg-muted/30" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

function XPProgressBar({ value }: { value: number }) {
  return (
    <div className="relative">
      <Progress value={value} className="h-2 bg-muted/30" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-routina-purple via-routina-blue to-routina-green opacity-0 rounded-full"
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          ease: "easeInOut",
        }}
        style={{
          width: `${value}%`,
          maskImage: "linear-gradient(to right, black, black)",
          WebkitMaskImage: "linear-gradient(to right, black, black)",
        }}
      />
    </div>
  )
}