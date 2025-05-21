"use client"

import { motion } from "framer-motion"
import { getCurrentUser } from "@/lib/api"

export function DashboardHeader() {
  const user = getCurrentUser()
  const greeting = getGreeting()

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h1 className="text-3xl font-bold tracking-tight">
        {greeting}, <span className="text-primary">{user.name}</span>!
      </h1>
      <p className="text-muted-foreground">Aqui está o resumo da sua produtividade hoje.</p>
    </motion.div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    return "Bom dia"
  } else if (hour >= 12 && hour < 18) {
    return "Boa tarde"
  } else {
    return "Boa noite"
  }
}
