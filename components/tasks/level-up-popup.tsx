"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { levelService } from "@/lib/level-utils"

interface LevelUpPopupProps {
  show: boolean;
  onClose: () => void;
  xpGained: number;
  oldXP: number;
  newXP: number;
}

export function LevelUpPopup({ show, onClose, xpGained, oldXP, newXP }: LevelUpPopupProps) {
  const [animationComplete, setAnimationComplete] = useState(false)
  
  // Verificar se houve level up usando dados reais
  const levelUpInfo = levelService.checkLevelUp(oldXP, newXP)
  const isLevelUp = levelUpInfo.leveledUp
  
  // Progress do nível antigo e novo
  const oldProgress = levelService.getLevelProgress(oldXP)
  const newProgress = levelService.getLevelProgress(newXP)

  useEffect(() => {
    if (show) {
      // Auto-close após 5 segundos
      const timer = setTimeout(() => {
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="relative w-full max-w-md p-6 rounded-xl bg-gradient-to-br from-routina-dark to-routina-dark/90 border border-routina-purple/30 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>

            <div className="flex flex-col items-center text-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 1.5, 0],
                          x: Math.cos(i * 60 * (Math.PI / 180)) * 50,
                          y: Math.sin(i * 60 * (Math.PI / 180)) * 50,
                        }}
                        transition={{
                          delay: 0.5 + i * 0.1,
                          duration: 1.5,
                          repeat: 0,
                        }}
                      >
                        <Star className="h-6 w-6 text-routina-blue" />
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 0.5,
                      delay: 0.3,
                    }}
                  >
                    <div className="rounded-full bg-routina-purple/20 p-6">
                      <Trophy className="h-12 w-12 text-routina-purple" />
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold mb-2"
              >
                {isLevelUp ? "Nível Aumentado!" : "Tarefa Concluída!"}
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-6"
              >
                {isLevelUp
                  ? `Parabéns! Você avançou para ${levelUpInfo.newLevel.nome} (Nível ${levelUpInfo.newLevel.nivel})!`
                  : `Você ganhou ${xpGained} pontos de experiência!`}
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-full space-y-4"
              >
                {isLevelUp ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{levelUpInfo.oldLevel.nome} (Nível {levelUpInfo.oldLevel.nivel})</span>
                      <span>{levelUpInfo.newLevel.nome} (Nível {levelUpInfo.newLevel.nivel})</span>
                    </div>
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/30">
                      <motion.div
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{
                          duration: 1.5,
                          delay: 0.6,
                          onComplete: () => setAnimationComplete(true),
                        }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-routina-purple via-routina-blue to-routina-green"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {oldXP} XP → {newXP} XP (+{xpGained} XP)
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{oldProgress.currentLevel.nome} (Nível {oldProgress.currentLevel.nivel})</span>
                      <span>{newProgress.nextLevel ? `${newProgress.xpInCurrentLevel}/${newProgress.xpNeededForNext} XP` : 'Nível Máximo'}</span>
                    </div>
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/30">
                      <motion.div
                        initial={{ width: `${oldProgress.percentage}%` }}
                        animate={{ width: `${newProgress.percentage}%` }}
                        transition={{
                          duration: 1.5,
                          delay: 0.6,
                          onComplete: () => setAnimationComplete(true),
                        }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-routina-purple via-routina-blue to-routina-green"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {oldXP} XP → {newXP} XP (+{xpGained} XP)
                    </div>
                    {newProgress.nextLevel && (
                      <div className="text-xs text-muted-foreground">
                        Faltam {newProgress.nextLevel.pontos_necessarios - newXP} XP para {newProgress.nextLevel.nome}
                      </div>
                    )}
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: animationComplete ? 1 : 0 }}
                  className="flex justify-center"
                >
                  <Button
                    onClick={onClose}
                    className="bg-gradient-to-r from-routina-purple to-routina-blue hover:from-routina-purple/90 hover:to-routina-blue/90"
                  >
                    Continuar
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}