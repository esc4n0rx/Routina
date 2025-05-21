"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Timer, Pause, Play } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export function PomodoroButton() {
  const [isActive, setIsActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const [timeLeft, setTimeLeft] = useState("25:00")

  const toggleTimer = () => {
    setIsActive(!isActive)
    // In a real app, we would start/stop the timer here
    // For demo purposes, we're just toggling the state
  }

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
      <Card className="border-routina-purple/30 bg-gradient-to-br from-routina-purple/10 to-routina-blue/10 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <motion.div
              animate={{
                boxShadow: isActive
                  ? ["0 0 0 0 rgba(138, 43, 226, 0)", "0 0 0 20px rgba(138, 43, 226, 0)"]
                  : "0 0 0 0 rgba(138, 43, 226, 0)",
              }}
              transition={{
                duration: 2,
                repeat: isActive ? Number.POSITIVE_INFINITY : 0,
                repeatType: "loop",
              }}
              className="relative mb-4 rounded-full bg-background p-6"
            >
              <Timer className="h-8 w-8 text-routina-purple" />
              <motion.div
                className="absolute inset-0 rounded-full border border-routina-purple"
                animate={{
                  scale: isActive ? [1, 1.1, 1] : 1,
                  opacity: isActive ? [1, 0.8, 1] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: isActive ? Number.POSITIVE_INFINITY : 0,
                  repeatType: "loop",
                }}
              />
            </motion.div>

            <h2 className="text-3xl font-bold mb-2">{timeLeft}</h2>
            <p className="text-muted-foreground mb-4">Pomodoro Timer</p>

            <Progress value={progress} className="h-2 w-full mb-4 bg-routina-dark" />

            <Button
              onClick={toggleTimer}
              size="lg"
              className="gap-2 w-full bg-gradient-to-r from-routina-purple to-routina-blue hover:from-routina-purple/90 hover:to-routina-blue/90"
            >
              {isActive ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Iniciar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
