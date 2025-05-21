// Mock API functions and data
// In a real app, these would be replaced with actual API calls

// User data
const currentUser = {
  id: "user-1",
  name: "João Silva",
  email: "joao@example.com",
  stats: {
    level: 4,
    xp: 1600,
    nextLevelXp: 2000,
    tasksCompleted: 42,
    tasksPending: 7,
    productivity: 78,
    productivityChange: 5,
    streak: 5,
  },
}

// Tasks data
const tasks = [
  {
    id: "task-1",
    title: "Finalizar relatório mensal",
    description: "Completar o relatório de desempenho para a reunião de equipe",
    status: "pending",
    priority: "high",
    category: "Trabalho",
    date: "2025-05-15T10:30:00",
    dueDate: "2025-05-20T18:00:00",
  },
  {
    id: "task-2",
    title: "Treino de musculação",
    description: "Foco em exercícios para as costas e bíceps",
    status: "completed",
    priority: "medium",
    category: "Saúde",
    date: "2025-05-15T08:00:00",
  },
  {
    id: "task-3",
    title: "Comprar mantimentos",
    description: "Frutas, vegetais, proteínas e snacks saudáveis",
    status: "pending",
    priority: "medium",
    category: "Pessoal",
    date: "2025-05-16T14:00:00",
    dueDate: "2025-05-16T20:00:00",
  },
  {
    id: "task-4",
    title: "Estudar para certificação",
    description: "Revisar capítulos 5-8 e fazer exercícios práticos",
    status: "pending",
    priority: "high",
    category: "Estudo",
    date: "2025-05-14T19:00:00",
    dueDate: "2025-05-25T23:59:00",
  },
  {
    id: "task-5",
    title: "Pagar contas mensais",
    description: "Aluguel, luz, internet e cartão de crédito",
    status: "urgent",
    priority: "high",
    category: "Finanças",
    date: "2025-05-13T10:00:00",
    dueDate: "2025-05-18T23:59:00",
  },
  {
    id: "task-6",
    title: "Ligar para o dentista",
    description: "Agendar consulta de rotina",
    status: "completed",
    priority: "low",
    category: "Saúde",
    date: "2025-05-12T11:30:00",
  },
]

// Calendar events
const calendarEvents = [
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
]

// API functions
export function getCurrentUser() {
  return currentUser
}

export function getUserStats() {
  return currentUser.stats
}

export function getRecentTasks() {
  return tasks.slice(0, 4)
}

export function getTasks() {
  return tasks
}

// Adicione uma função para atualizar os stats do usuário quando uma tarefa é concluída
export function completeTask(taskId: string) {
  const task = tasks.find((t) => t.id === taskId)
  if (task) {
    // Toggle task status
    task.status = task.status === "completed" ? "pending" : "completed"

    // If task is being completed (not uncompleted), update user XP
    if (task.status === "completed") {
      // Add 50 XP for completing a task
      currentUser.stats.xp += 50

      // Check if user leveled up
      if (currentUser.stats.xp >= currentUser.stats.nextLevelXp) {
        currentUser.stats.level += 1
        // Reset XP but keep overflow
        const overflow = currentUser.stats.xp - currentUser.stats.nextLevelXp
        currentUser.stats.xp = overflow
        // Increase XP needed for next level
        currentUser.stats.nextLevelXp += 500
      }
    }

    return task
  }
  throw new Error("Task not found")
}

export function deleteTask(taskId: string) {
  const taskIndex = tasks.findIndex((t) => t.id === taskId)
  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1)
    return true
  }
  throw new Error("Task not found")
}

export function getCalendarEvents() {
  return calendarEvents
}

// Auth functions
export async function loginUser(email: string, password: string) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real app, we would validate credentials here
  if (email && password) {
    return currentUser
  }

  throw new Error("Invalid credentials")
}

export async function registerUser(userData: { name: string; email: string; password: string }) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real app, we would create a new user here
  if (userData.name && userData.email && userData.password) {
    return true
  }

  throw new Error("Invalid user data")
}
