"use client"

import { useState } from "react"
import { CalendarIcon, Clock, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Task } from "@/services/api/task-service"

interface DelayTaskDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (data: { data_vencimento: string; hora_vencimento?: string }) => void
  task: Task | null
}

export function DelayTaskDialog({ open, onClose, onConfirm, task }: DelayTaskDialogProps) {
  const [newDueDate, setNewDueDate] = useState<Date | null>(null)
  const [newDueTime, setNewDueTime] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newDueDate) {
      return
    }

    const submitData = {
      data_vencimento: format(newDueDate, "yyyy-MM-dd"),
      hora_vencimento: newDueTime || undefined,
    }

    onConfirm(submitData)
  }

  const handleClose = () => {
    setNewDueDate(null)
    setNewDueTime("")
    onClose()
  }

  if (!task) return null

  // Calcular penalidade (30% dos pontos)
  const penaltyPoints = Math.ceil(task.pontos * 0.3)
  const remainingPoints = task.pontos - penaltyPoints

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] bg-black/90 border-neutral-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Adiar Tarefa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atenção:</strong> Adiar uma tarefa resultará em uma penalidade de {penaltyPoints} pontos XP. 
              Você receberá apenas {remainingPoints} pontos ao completar esta tarefa.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Tarefa: <strong>{task.nome}</strong></Label>
            {task.data_vencimento && (
              <p className="text-sm text-muted-foreground">
                Prazo atual: {format(new Date(task.data_vencimento), "PPP", { locale: ptBR })}
                {task.hora_vencimento && ` às ${task.hora_vencimento.substring(0, 5)}`}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newDueDate">Nova Data de Vencimento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal bg-background/50 ${!newDueDate && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newDueDate ? format(newDueDate, "PPP", { locale: ptBR }) : "Selecione uma nova data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newDueDate || undefined}
                    onSelect={(date) => setNewDueDate(date ?? null)}
                    initialFocus
                    locale={ptBR}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newDueTime">Novo Horário (opcional)</Label>
              <Input
                id="newDueTime"
                type="time"
                value={newDueTime}
                onChange={(e) => setNewDueTime(e.target.value)}
                className="bg-background/50"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="destructive"
                disabled={!newDueDate}
              >
                Adiar Tarefa (-{penaltyPoints} XP)
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}