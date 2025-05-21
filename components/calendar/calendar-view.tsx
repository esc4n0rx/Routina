"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Dados fictícios de eventos para demonstração
const mockEvents = [
  {
    id: "event-1",
    title: "Reunião de Equipe",
    description: "Discussão sobre o progresso do projeto atual",
    date: "2025-05-15T00:00:00",
    time: "15:00 - 16:00",
    type: "Trabalho",
  },
  {
    id: "event-2",
    title: "Entrega do Projeto",
    description: "Prazo final para entrega do projeto XYZ",
    date: "2025-05-18T00:00:00",
    time: "23:59",
    type: "Trabalho",
  },
  {
    id: "event-3",
    title: "Consulta Médica",
    description: "Check-up anual",
    date: "2025-05-22T00:00:00",
    time: "10:30 - 11:30",
    type: "Saúde",
  },
  {
    id: "event-4",
    title: "Aniversário de Maria",
    description: "Não esquecer de comprar presente",
    date: "2025-05-25T00:00:00",
    time: "Todo o dia",
    type: "Pessoal",
  },
];

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events] = useState(mockEvents)

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    setSelectedDate(null)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const hasEventsOnDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return getEventsForDate(date).length > 0
  }

  const renderCalendarDays = () => {
    const days = []
    const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

    // Render weekday headers
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={`header-${i}`} className="text-center font-medium text-sm py-2">
          {weekdays[i]}
        </div>,
      )
    }

    // Render empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />)
    }

    // Render days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const isToday = isSameDay(date, new Date())
      const isSelected = selectedDate && isSameDay(date, selectedDate)
      const hasEvents = hasEventsOnDate(day)

      days.push(
        <motion.div key={`day-${day}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-1">
          <button
            onClick={() => setSelectedDate(date)}
            className={`
              w-full aspect-square rounded-lg flex flex-col items-center justify-center relative
              hover:bg-primary/10 transition-colors
              ${isToday ? "border border-primary" : ""}
              ${isSelected ? "bg-primary/20" : ""}
            `}
          >
            <span className={`text-sm ${isToday ? "font-bold text-primary" : ""}`}>{day}</span>
            {hasEvents && (
              <span className="absolute top-1 right-1 text-xs bg-primary/20 rounded-full px-1">
                {getEventsForDate(date).length}
              </span>
            )}
          </button>
        </motion.div>,
      )
    }

    return days
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="border-neutral-800 bg-black/60 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">
            {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Hoje
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>

          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-6 border-t border-neutral-800 pt-4"
            >
              <h3 className="font-medium mb-3">
                {selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              </h3>

              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/10">
                      <div className="mt-0.5">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {event.type}
                          </Badge>
                        </div>
                        {event.description && <p className="text-sm text-muted-foreground mt-1">{event.description}</p>}
                        <p className="text-xs text-muted-foreground mt-1">{formatTime(event.time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>Nenhum evento para este dia</p>
                  <Button variant="link" className="mt-2">
                    + Adicionar evento
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

function formatTime(timeString: string) {
  return timeString
}