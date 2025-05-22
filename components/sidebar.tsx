// components/sidebar.tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { LayoutDashboard, CheckSquare, Calendar, Settings } from "lucide-react"
import { useSafeArea } from "@/hooks/use-safe-area"

export function Sidebar() {
  const pathname = usePathname()
  const insets = useSafeArea();

  type NavItem = {
    name: string
    href: string
    icon: React.ComponentType<any>
    badge?: React.ReactNode
  }

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Tarefas",
      href: "/tasks",
      icon: CheckSquare,
    },
    {
      name: "Calendário",
      href: "/calendar",
      icon: Calendar,
    },
    {
      name: "Configurações",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <motion.nav
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-10 bg-routina-dark/90 backdrop-blur-lg border-t border-routina-purple/20 px-2 py-2 md:py-3"
      style={{ 
        paddingBottom: `${Math.max(8, insets.bottom)}px`, // Garante um padding mínimo de 8px
        bottom: 0
      }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link key={item.name} href={item.href} className="relative flex flex-col items-center justify-center">
              <motion.div
                className={`
                  relative flex h-12 w-12 items-center justify-center rounded-full
                  ${isActive ? "text-routina-green" : "text-muted-foreground"}
                  transition-colors hover:text-routina-purple
                `}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.9 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-background"
                    className="absolute inset-0 rounded-full bg-routina-green/10"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <item.icon className="h-5 w-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-routina-purple text-[10px] font-medium text-white">
                    {item.badge}
                  </span>
                )}
              </motion.div>
              <span className="mt-1 text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}