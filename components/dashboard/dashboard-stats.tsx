"use client"

import { motion } from "framer-motion"
import { Trophy, Zap, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getUserStats } from "@/lib/api"

export function DashboardStats() {
  const stats = getUserStats()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="border-routina-purple/30 bg-routina-dark/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-routina-purple" />
                <h3 className="font-medium">Nível {stats.level}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-routina-blue" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{stats.xp} XP</span>
                    <span>{stats.nextLevelXp} XP</span>
                  </div>
                  <XPProgressBar value={(stats.xp / stats.nextLevelXp) * 100} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-routina-green" />
                <h3 className="font-medium">Produtividade</h3>
              </div>
              <div className="text-2xl font-bold">{stats.productivity}%</div>
              <div className="text-sm text-muted-foreground">
                {stats.productivityChange > 0 ? "+" : ""}
                {stats.productivityChange}% em relação à semana passada
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-medium">Tarefas Hoje</h3>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-routina-green/10 p-2">
                  <div className="text-xl font-bold">{stats.tasksCompleted}</div>
                  <div className="text-xs text-muted-foreground">Concluídas</div>
                </div>
                <div className="rounded-lg bg-muted/30 p-2">
                  <div className="text-xl font-bold">{stats.tasksPending}</div>
                  <div className="text-xs text-muted-foreground">Pendentes</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function XPProgressBar({ value }: { value: number }) {
  return (
    <div className="relative">
      <Progress value={value} className="h-2 bg-muted/30" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-routina-purple via-routina-blue to-routina-green opacity-0"
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{
          duration: 1.5,
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
