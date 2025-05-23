"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trophy, Zap, TrendingUp, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/context/auth-context"
import { taskService, Task } from "@/services/api/task-service"
import { levelService } from "@/lib/level-utils"

export function DashboardStats() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    completedToday: 0,
    pendingToday: 0,
    productivity: 0,
    totalTasksToday: 0
  })

  // Memoizar dados do usuário para evitar recálculos desnecessários
  const userXP = user?.pontos_xp || 0
  const levelProgress = levelService.getLevelProgress(userXP)

  // Carregar tarefas e calcular stats uma única vez
  const fetchTasksAndCalculateStats = async () => {
    try {
      setLoading(true)
      const response = await taskService.getTasks()
      if (!response.erro && response.tarefas) {
        const tarefasFlat = response.tarefas.flat()
        setTasks(tarefasFlat)
        
        // Calcular estatísticas imediatamente
        const today = new Date()
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

        const todayTasks = tarefasFlat.filter(task => {
          const taskDate = new Date(task.data_criacao)
          return taskDate >= todayStart && taskDate <= todayEnd
        })

        const completedToday = todayTasks.filter(task => task.concluida).length
        const pendingToday = todayTasks.filter(task => !task.concluida && !task.vencida).length
        const overdueToday = todayTasks.filter(task => !task.concluida && task.vencida).length
        const totalTasksToday = todayTasks.length
        const productivity = totalTasksToday > 0 ? Math.round((completedToday / totalTasksToday) * 100) : 0

        setStats({
          completedToday,
          pendingToday: pendingToday + overdueToday,
          productivity,
          totalTasksToday
        })
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasksAndCalculateStats()
  }, [])

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
                <h3 className="font-medium text-sm">{levelProgress.currentLevel.nome}</h3>
                <p className="text-2xl font-bold">Nível {levelProgress.currentLevel.nivel}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{levelProgress.xpInCurrentLevel} XP</span>
                <span>{levelProgress.nextLevel ? `${levelProgress.xpNeededForNext} XP` : 'Máximo'}</span>
              </div>
              <XPProgressBar value={levelProgress.percentage} />
              <p className="text-xs text-muted-foreground">
                {levelProgress.nextLevel 
                  ? `${levelProgress.nextLevel.pontos_necessarios - userXP} XP para ${levelProgress.nextLevel.nome}`
                  : 'Nível máximo alcançado!'
                }
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
                <p className="text-2xl font-bold">{user?.sequencia || 0}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {(user?.sequencia || 0) > 0 
                ? `${user?.sequencia} dias consecutivos` 
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
                <p className="text-2xl font-bold">{stats.productivity}%</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalTasksToday > 0 
                ? `${stats.completedToday}/${stats.totalTasksToday} tarefas hoje`
                : 'Nenhuma tarefa hoje'
              }
            </p>
          </CardContent>
        </Card>

        {/* Card de XP Total */}
        <Card className="border-neutral-800 bg-routina-dark/80 backdrop-blur-sm">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-full bg-amber-500/20 p-2">
                <Zap className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-medium text-sm">XP Total</h3>
                <p className="text-2xl font-bold">{userXP}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-routina-green/10 p-2 text-center">
                  <div className="text-sm font-bold">{stats.completedToday}</div>
                  <div className="text-xs text-muted-foreground">Concluídas</div>
                </div>
                <div className="rounded-lg bg-muted/30 p-2 text-center">
                  <div className="text-sm font-bold">{stats.pendingToday}</div>
                  <div className="text-xs text-muted-foreground">Pendentes</div>
                </div>
              </div>
              
              {stats.totalTasksToday > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progresso do dia</span>
                    <span>{stats.productivity}%</span>
                  </div>
                  <Progress value={stats.productivity} className="h-1.5 bg-muted/30" />
                </div>
              )}
            </div>
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