// components/notifications/notification-provider.tsx
"use client"

import { useEffect } from 'react'
import { FeedbackModal } from './feedback-modal'
import { useNotifications } from '@/hooks/use-notifications'
import { useNotificationFeedback } from '@/hooks/use-notification-feedback'

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isEnabled } = useNotifications()
  const { 
    feedbackNotification, 
    showFeedbackModal, 
    closeFeedback, 
    completeFeedback 
  } = useNotificationFeedback()

  // Inicializar notificações quando o componente montar
  useEffect(() => {
    if (isEnabled) {
      // Inicialização já acontece no hook useNotifications
      console.log('Sistema de notificações ativo')
    }
  }, [isEnabled])

  return (
    <>
      {children}
      
      {/* Modal de Feedback */}
      <FeedbackModal
        notification={feedbackNotification}
        open={showFeedbackModal}
        onClose={closeFeedback}
        onSubmit={completeFeedback}
      />
    </>
  )
}