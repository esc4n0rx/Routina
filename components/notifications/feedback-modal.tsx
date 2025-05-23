// components/notifications/feedback-modal.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, ThumbsUp, ThumbsDown, Clock, X, MessageSquare } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { neurolinkService, NotificationFeedback, NeuroLinkNotification } from "@/services/api/neurolink-service"
import { useToast } from "@/hooks/use-toast"

interface FeedbackModalProps {
  notification: NeuroLinkNotification | null
  open: boolean
  onClose: () => void
  onSubmit?: () => void
}

export function FeedbackModal({ notification, open, onClose, onSubmit }: FeedbackModalProps) {
  const [selectedFeedback, setSelectedFeedback] = useState<NotificationFeedback['feedback_tipo'] | null>(null)
  const [comment, setComment] = useState("")
  const [isSubmiting, setIsSubmiting] = useState(false)
  const { toast } = useToast()

  const feedbackOptions = [
    {
      type: 'helpful' as const,
      name: 'Útil',
      description: 'Notificação útil e relevante',
      icon: ThumbsUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10 border-green-500/20'
    },
    {
      type: 'perfect' as const,
      name: 'Perfeita',
      description: 'Timing e conteúdo perfeitos',
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10 border-yellow-500/20'
    },
    {
      type: 'annoying' as const,
      name: 'Irritante',
      description: 'Muito frequente ou irrelevante',
      icon: ThumbsDown,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10 border-red-500/20'
    },
    {
      type: 'irrelevant' as const,
      name: 'Irrelevante',
      description: 'Não se aplica à minha situação',
      icon: X,
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10 border-gray-500/20'
    },
    {
      type: 'too_early' as const,
      name: 'Muito Cedo',
      description: 'Chegou em um momento inadequado',
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10 border-orange-500/20'
    },
    {
      type: 'too_late' as const,
      name: 'Muito Tarde',
      description: 'Deveria ter chegado antes',
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10 border-blue-500/20'
    }
  ]

  const handleSubmit = async () => {
    if (!notification || !selectedFeedback) return

    try {
      setIsSubmiting(true)

      const feedback: NotificationFeedback = {
        feedback_tipo: selectedFeedback,
        comentario: comment.trim() || undefined
      }

      await neurolinkService.sendFeedback(notification.id, feedback)

      toast({
        title: "Feedback enviado",
        description: "Obrigado! Seu feedback nos ajuda a melhorar as notificações.",
      })

      onSubmit?.()
      handleClose()
    } catch (error) {
      console.error('Erro ao enviar feedback:', error)
      toast({
        title: "Erro",
        description: "Não foi possível enviar o feedback. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsSubmiting(false)
    }
  }

  const handleClose = () => {
    setSelectedFeedback(null)
    setComment("")
    onClose()
  }

  if (!notification) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-black/90 border-neutral-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Feedback da Notificação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Notificação Preview */}
          <div className="p-3 rounded-lg bg-muted/10 border border-neutral-800">
            <div className="flex items-start gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {getTypeLabel(notification.tipo)}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Prioridade {notification.prioridade}
              </Badge>
            </div>
            <h4 className="font-medium mb-1">{notification.titulo}</h4>
            <p className="text-sm text-muted-foreground">{notification.mensagem}</p>
          </div>

          {/* Opções de Feedback */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Como foi esta notificação?</h4>
            <div className="grid grid-cols-2 gap-2">
              {feedbackOptions.map((option) => {
                const Icon = option.icon
                const isSelected = selectedFeedback === option.type

                return (
                  <motion.button
                    key={option.type}
                    onClick={() => setSelectedFeedback(option.type)}
                    className={`
                      p-3 rounded-lg border transition-all text-left
                      ${isSelected 
                        ? `${option.bgColor} border-current` 
                        : 'bg-muted/5 border-neutral-800 hover:bg-muted/10'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4 w-4 ${isSelected ? option.color : 'text-muted-foreground'}`} />
                      <span className={`text-sm font-medium ${isSelected ? option.color : ''}`}>
                        {option.name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Comentário Opcional */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Comentário adicional (opcional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte-nos mais sobre sua experiência..."
              className="bg-background/50 min-h-[80px]"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {comment.length}/500
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Pular
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedFeedback || isSubmiting}
              className="flex-1"
            >
              {isSubmiting ? "Enviando..." : "Enviar Feedback"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'ALERT': 'Alerta',
    'REMINDER': 'Lembrete',
    'MOTIVATION': 'Motivação',
    'ACHIEVEMENT': 'Conquista',
    'PROGRESS': 'Progresso',
    'INSIGHT': 'Dica'
  }
  return labels[type] || type
}