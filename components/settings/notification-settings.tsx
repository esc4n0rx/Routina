// components/settings/notification-settings.tsx
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bell, BellOff, Clock, Volume2, Zap, MessageSquare, Trophy, TrendingUp, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useNotifications } from "@/hooks/use-notifications"
import type { NotificationSettings } from "@/services/api/neurolink-service"

export function NotificationSettings() {
  const {
    isEnabled,
    isLoading,
    settings,
    enableNotifications,
    disableNotifications,
    updateSettings,
    isSupported,
    hasPermission
  } = useNotifications()

  const [localSettings, setLocalSettings] = useState<NotificationSettings>({
    personalidade: 'casual',
    horario_inicio: '07:00',
    horario_fim: '22:00',
    frequencia_maxima: 5,
    tipos_habilitados: ['ALERT', 'REMINDER', 'MOTIVATION'],
    timezone: 'America/Sao_Paulo'
  })

  const [hasChanges, setHasChanges] = useState(false)

  // Sincronizar com configurações do servidor
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
      setHasChanges(false)
    }
  }, [settings])

  // Detectar mudanças
  useEffect(() => {
    if (settings) {
      const hasChanged = JSON.stringify(localSettings) !== JSON.stringify(settings)
      setHasChanges(hasChanged)
    }
  }, [localSettings, settings])

  const handleToggleNotifications = async () => {
    if (isEnabled) {
      await disableNotifications()
    } else {
      await enableNotifications()
    }
  }

  const handleUpdateSettings = async () => {
    await updateSettings(localSettings)
  }

  const handlePersonalityChange = (value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      personalidade: value as NotificationSettings['personalidade']
    }))
  }

  const handleTimeChange = (field: 'horario_inicio' | 'horario_fim', value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFrequencyChange = (value: number[]) => {
    setLocalSettings(prev => ({
      ...prev,
      frequencia_maxima: value[0]
    }))
  }

  const handleTypeToggle = (type: string) => {
    setLocalSettings(prev => ({
      ...prev,
      tipos_habilitados: prev.tipos_habilitados.includes(type)
        ? prev.tipos_habilitados.filter(t => t !== type)
        : [...prev.tipos_habilitados, type]
    }))
  }

  // Tipos de notificação com informações
  const notificationTypes = [
    {
      key: 'ALERT',
      name: 'Alertas',
      description: 'Urgências e prazos críticos',
      icon: AlertTriangle,
      color: 'text-red-500'
    },
    {
      key: 'REMINDER',
      name: 'Lembretes',
      description: 'Lembretes amigáveis sobre tarefas',
      icon: Bell,
      color: 'text-blue-500'
    },
    {
      key: 'MOTIVATION',
      name: 'Motivação',
      description: 'Mensagens motivacionais',
      icon: Zap,
      color: 'text-yellow-500'
    },
    {
      key: 'ACHIEVEMENT',
      name: 'Conquistas',
      description: 'Comemorações de conquistas',
      icon: Trophy,
      color: 'text-green-500'
    },
    {
      key: 'PROGRESS',
      name: 'Progresso',
      description: 'Relatórios de progresso',
      icon: TrendingUp,
      color: 'text-purple-500'
    },
    {
      key: 'INSIGHT',
      name: 'Dicas',
      description: 'Dicas e insights personalizados',
      icon: MessageSquare,
      color: 'text-pink-500'
    }
  ]

  // Personalidades disponíveis
  const personalities = [
    {
      key: 'formal',
      name: 'Formal',
      description: 'Tom respeitoso e profissional'
    },
    {
      key: 'casual',
      name: 'Casual',
      description: 'Amigável e descontraído'
    },
    {
      key: 'motivational',
      name: 'Motivacional',
      description: 'Energético e inspirador'
    },
    {
      key: 'friendly',
      name: 'Amigável',
      description: 'Caloroso e empático'
    }
  ]

  if (!isSupported) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Seu dispositivo não suporta notificações push. Você precisará de um navegador mais recente ou dispositivo diferente.
          </AlertDescription>
        </Alert>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Status das Notificações */}
      <Card className="border-neutral-800 bg-black/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
           // Continuando components/settings/notification-settings.tsx

           {isEnabled ? (
             <Bell className="h-5 w-5 text-green-500" />
           ) : (
             <BellOff className="h-5 w-5 text-gray-500" />
           )}
           Notificações Push
         </CardTitle>
         <CardDescription>
           {isEnabled 
             ? "Você está recebendo notificações inteligentes do Routina"
             : "Ative para receber lembretes e motivação personalizados"
           }
         </CardDescription>
       </CardHeader>
       <CardContent>
         <div className="flex items-center justify-between">
           <div className="space-y-1">
             <div className="flex items-center gap-2">
               <Badge variant={isEnabled ? "default" : "secondary"}>
                 {isEnabled ? "Ativado" : "Desativado"}
               </Badge>
               {!hasPermission && !isEnabled && (
                 <Badge variant="outline" className="text-orange-500 border-orange-500">
                   Permissão necessária
                 </Badge>
               )}
             </div>
             <p className="text-sm text-muted-foreground">
               {isEnabled 
                 ? "Notificações serão enviadas conforme suas configurações"
                 : "Clique para ativar e configurar suas preferências"
               }
             </p>
           </div>
           <Button 
             onClick={handleToggleNotifications} 
             disabled={isLoading}
             variant={isEnabled ? "outline" : "default"}
           >
             {isLoading ? "Carregando..." : isEnabled ? "Desativar" : "Ativar"}
           </Button>
         </div>
       </CardContent>
     </Card>

     {/* Configurações Detalhadas - Só mostrar se estiver ativado */}
     {isEnabled && (
       <>
         {/* Personalidade */}
         <Card className="border-neutral-800 bg-black/60 backdrop-blur-sm">
           <CardHeader>
             <CardTitle>Personalidade da IA</CardTitle>
             <CardDescription>
               Escolha como você gostaria que as notificações sejam escritas
             </CardDescription>
           </CardHeader>
           <CardContent>
             <Select 
               value={localSettings.personalidade} 
               onValueChange={handlePersonalityChange}
             >
               <SelectTrigger className="bg-background/50">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent>
                 {personalities.map(personality => (
                   <SelectItem key={personality.key} value={personality.key}>
                     <div className="flex flex-col">
                       <span className="font-medium">{personality.name}</span>
                       <span className="text-xs text-muted-foreground">
                         {personality.description}
                       </span>
                     </div>
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </CardContent>
         </Card>

         {/* Horários */}
         <Card className="border-neutral-800 bg-black/60 backdrop-blur-sm">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Clock className="h-5 w-5 text-blue-500" />
               Horários Permitidos
             </CardTitle>
             <CardDescription>
               Defina quando você quer receber notificações
             </CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Início</Label>
                 <Input
                   type="time"
                   value={localSettings.horario_inicio}
                   onChange={(e) => handleTimeChange('horario_inicio', e.target.value)}
                   className="bg-background/50"
                 />
               </div>
               <div className="space-y-2">
                 <Label>Fim</Label>
                 <Input
                   type="time"
                   value={localSettings.horario_fim}
                   onChange={(e) => handleTimeChange('horario_fim', e.target.value)}
                   className="bg-background/50"
                 />
               </div>
             </div>
             <p className="text-xs text-muted-foreground">
               Notificações só serão enviadas entre {localSettings.horario_inicio} e {localSettings.horario_fim}
             </p>
           </CardContent>
         </Card>

         {/* Frequência */}
         <Card className="border-neutral-800 bg-black/60 backdrop-blur-sm">
           <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <Volume2 className="h-5 w-5 text-purple-500" />
               Frequência Máxima
             </CardTitle>
             <CardDescription>
               Quantas notificações você quer receber por dia
             </CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <Label>Máximo por dia</Label>
                 <Badge variant="outline">
                   {localSettings.frequencia_maxima} notificações
                 </Badge>
               </div>
               <Slider
                 value={[localSettings.frequencia_maxima]}
                 onValueChange={handleFrequencyChange}
                 max={15}
                 min={1}
                 step={1}
                 className="w-full"
               />
               <div className="flex justify-between text-xs text-muted-foreground">
                 <span>1 (Mínimo)</span>
                 <span>15 (Máximo)</span>
               </div>
             </div>
           </CardContent>
         </Card>

         {/* Tipos de Notificação */}
         <Card className="border-neutral-800 bg-black/60 backdrop-blur-sm">
           <CardHeader>
             <CardTitle>Tipos de Notificação</CardTitle>
             <CardDescription>
               Escolha quais tipos de notificações você quer receber
             </CardDescription>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               {notificationTypes.map((type) => {
                 const isEnabled = localSettings.tipos_habilitados.includes(type.key)
                 const Icon = type.icon
                 
                 return (
                   <div 
                     key={type.key} 
                     className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/10 transition-colors"
                   >
                     <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-lg bg-muted/20`}>
                         <Icon className={`h-4 w-4 ${type.color}`} />
                       </div>
                       <div>
                         <div className="font-medium">{type.name}</div>
                         <div className="text-sm text-muted-foreground">
                           {type.description}
                         </div>
                       </div>
                     </div>
                     <Switch
                       checked={isEnabled}
                       onCheckedChange={() => handleTypeToggle(type.key)}
                     />
                   </div>
                 )
               })}
             </div>
             
             <Separator className="my-4 bg-neutral-800" />
             
             <div className="text-center">
               <p className="text-sm text-muted-foreground">
                 {localSettings.tipos_habilitados.length} de {notificationTypes.length} tipos selecionados
               </p>
             </div>
           </CardContent>
         </Card>

         {/* Botão Salvar */}
         {hasChanges && (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="sticky bottom-4 z-10"
           >
             <Card className="border-green-500/50 bg-green-500/10">
               <CardContent className="p-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <div className="font-medium text-green-400">
                       Alterações não salvas
                     </div>
                     <div className="text-sm text-muted-foreground">
                       Suas configurações foram modificadas
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <Button 
                       variant="outline" 
                       size="sm"
                       onClick={() => setLocalSettings(settings!)}
                     >
                       Cancelar
                     </Button>
                     <Button 
                       size="sm"
                       onClick={handleUpdateSettings}
                       disabled={isLoading}
                       className="bg-green-600 hover:bg-green-700"
                     >
                       {isLoading ? "Salvando..." : "Salvar"}
                     </Button>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </motion.div>
         )}
       </>
     )}

     {/* Informações Adicionais */}
     <Card className="border-neutral-800 bg-black/60 backdrop-blur-sm">
       <CardHeader>
         <CardTitle className="text-sm">Como funciona</CardTitle>
       </CardHeader>
       <CardContent className="space-y-3 text-sm text-muted-foreground">
         <div className="flex items-start gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
           <p>
             As notificações são geradas por IA com base no seu comportamento e tarefas
           </p>
         </div>
         <div className="flex items-start gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
           <p>
             Você pode dar feedback sobre cada notificação para melhorar a precisão
           </p>
         </div>
         <div className="flex items-start gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
           <p>
             As notificações funcionam mesmo quando o app está fechado
           </p>
         </div>
         <div className="flex items-start gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
           <p>
             Seus dados são processados de forma segura e privada
           </p>
         </div>
       </CardContent>
     </Card>
   </motion.div>
 )
}