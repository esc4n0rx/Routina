// hooks/use-notification-feedback.ts
import { useState, useEffect } from 'react'
import { NeuroLinkNotification } from '@/services/api/neurolink-service'

interface FeedbackState {
  notification: NeuroLinkNotification | null
  showModal: boolean
  lastShownTime: number
}

export function useNotificationFeedback() {
  const [feedbackState, setFeedbackState] = useState<FeedbackState>({
    notification: null,
    showModal: false,
    lastShownTime: 0
  })

  // Solicitar feedback para uma notificação específica
  const requestFeedback = (notification: NeuroLinkNotification, delayMs: number = 300000) => { // 5 minutos
    const now = Date.now()
    
    // Não mostrar feedback muito frequente (máximo 1 por hora)
    if (now - feedbackState.lastShownTime < 3600000) {
      return
    }

    setTimeout(() => {
      setFeedbackState({
        notification,
        showModal: true,
        lastShownTime: now
      })
    }, delayMs)
  }

  const closeFeedback = () => {
    setFeedbackState(prev => ({
      ...prev,
      showModal: false
    }))
  }

  const completeFeedback = () => {
    setFeedbackState({
      notification: null,
      showModal: false,
      lastShownTime: Date.now()
    })
  }

  return {
    feedbackNotification: feedbackState.notification,
    showFeedbackModal: feedbackState.showModal,
    requestFeedback,
    closeFeedback,
    completeFeedback
  }
}