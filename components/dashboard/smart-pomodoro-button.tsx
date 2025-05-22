"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Timer, Pause, Play, X, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function SmartPomodoroButton() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState("25:00")
  const [progress, setProgress] = useState(0)
  const [mode, setMode] = useState<'work' | 'break'>('work')

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
    if (isActive) {
      setIsActive(false)
    }
  }

  const toggleTimer = () => {
    setIsActive(!isActive)
    // In a real app, we would start/stop the timer here
    // For demo purposes, we're just toggling the state
  }

  const resetTimer = () => {
    setIsActive(false)
    setProgress(0)
    setTimeLeft(mode === 'work' ? "25:00" : "05:00")
  }

  const switchMode = () => {
    const newMode = mode === 'work' ? 'break' : 'work'
    setMode(newMode)
    setTimeLeft(newMode === 'work' ? "25:00" : "05:00")
    setProgress(0)
    setIsActive(false)
  }

  return (
    <>
      {/* Botão Flutuante Compacto */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-20 right-4 z-40 md:relative md:bottom-auto md:right-auto"
          >
            <motion.button
              onClick={toggleExpanded}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-routina-purple to-routina-blue shadow-lg hover:shadow-xl transition-shadow md:h-12 md:w-12"
            >
              <motion.div
                animate={{
                  boxShadow: isActive
                    ? ["0 0 0 0 rgba(138, 43, 226, 0.4)", "0 0 0 20px rgba(138, 43, 226, 0)"]
                    : "0 0 0 0 rgba(138, 43, 226, 0)",
                }}
                transition={{
                  duration: 2,
                  repeat: isActive ? Number.POSITIVE_INFINITY : 0,
                  repeatType: "loop",
                }}
                className="absolute inset-0 rounded-full"
              />
              <Timer className="h-6 w-6 text-white md:h-5 md:w-5" />
              
              {/* Indicador de progresso ao redor do botão */}
              {progress > 0 && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-transparent"
                  style={{
                    background: `conic-gradient(from 0deg, transparent ${360 - (progress * 3.6)}deg, rgba(255,255,255,0.3) ${360 - (progress * 3.6)}deg)`,
                    mask: "radial-gradient(circle at center, transparent 70%, black 72%)",
                    WebkitMask: "radial-gradient(circle at center, transparent 70%, black 72%)",
                  }}
                  initial={{ rotate: -90 }}
                  animate={{ rotate: -90 }}
                />
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Expandido do Pomodoro */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 15 }}
            className="fixed inset-4 z-50 flex items-center justify-center md:relative md:inset-auto"
          >
            <Card className="w-full max-w-sm border-routina-purple/30 bg-gradient-to-br from-routina-purple/10 to-routina-blue/10 backdrop-blur-lg shadow-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {mode === 'work' ? 'Foco' : 'Pausa'}
                  </h3>
                  <Button variant="ghost" size="icon" onClick={toggleExpanded}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

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
                    className="relative mb-6 rounded-full bg-background p-8"
                  >
                    <Timer className={`h-12 w-12 ${mode === 'work' ? 'text-routina-purple' : 'text-routina-blue'}`} />
                    <motion.div
                      className={`absolute inset-0 rounded-full border ${mode === 'work' ? 'border-routina-purple' : 'border-routina-blue'}`}
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

                  <h2 className="text-4xl font-bold mb-2">{timeLeft}</h2>
                  <p className="text-muted-foreground mb-4">
                    {mode === 'work' ? 'Tempo de Foco' : 'Tempo de Pausa'}
                  </p>

                  <Progress value={progress} className="h-2 w-full mb-6 bg-routina-dark" />

                  <div className="flex gap-2 w-full">
                    <Button
                      onClick={toggleTimer}
                      size="lg" 
                      className={`flex-1 gap-2 ${
                        mode === 'work' 
                          ? 'bg-gradient-to-r from-routina-purple to-routina-blue hover:from-routina-purple/90 hover:to-routina-blue/90'
                          : 'bg-gradient-to-r from-routina-blue to-routina-green hover:from-routina-blue/90 hover:to-routina-green/90'
                      }`}
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
                    
                    <Button variant="outline" size="lg" onClick={resetTimer}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex gap-2 mt-3 w-full">
                    <Button
                      variant={mode === 'work' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => mode !== 'work' && switchMode()}
                      className="flex-1"
                    >
                      Foco (25min)
                    </Button>
                    <Button
                      variant={mode === 'break' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => mode !== 'break' && switchMode()}
                      className="flex-1"
                    >
                      Pausa (5min)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay para fechar quando clicar fora (apenas no mobile) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleExpanded}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  )
}