"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, Bell, Volume2, Moon, Sun, Smartphone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"

export function SettingsForm() {
  const { toast } = useToast()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    name: user?.nome ?? "",
    email: user?.email ?? "",
    notifications: {
      email: true,
      push: true,
      tasks: true,
      system: false,
    },
    sounds: {
      effects: true,
      achievements: true,
    },
    appearance: {
      theme: "dark",
    },
  })

  const handleChange = (section: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...((prev[section as keyof typeof prev] as object) ?? {}),
        [field]: value,
      },
    }))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = () => {
    toast({
      title: "Configurações salvas",
      description: "Suas configurações foram atualizadas com sucesso.",
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-neutral-800 bg-black/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Gerencie suas informações pessoais e configurações de conta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="/placeholder.svg?height=96&width=96" alt={user?.nome} />
                    <AvatarFallback className="text-2xl">{user?.nome.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    Alterar foto
                  </Button>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-neutral-800" />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Estatísticas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-lg bg-muted/30 p-3 text-center">
                    <div className="text-2xl font-bold">{user?.nivel}</div>
                    <div className="text-xs text-muted-foreground">Nível</div>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-3 text-center">
                    <div className="text-2xl font-bold">{user?.pontos_xp}</div>
                    <div className="text-xs text-muted-foreground">XP Total</div>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-3 text-center">
                    <div className="text-2xl font-bold">{user?.sequencia}</div>
                    <div className="text-xs text-muted-foreground">Sequencia</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-neutral-800 bg-black/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>Configure como e quando você deseja receber notificações.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <div>
                      <Label htmlFor="notifications-email">Notificações por Email</Label>
                      <p className="text-sm text-muted-foreground">Receba atualizações importantes por email.</p>
                    </div>
                  </div>
                  <Switch
                    id="notifications-email"
                    checked={formData.notifications.email}
                    onCheckedChange={(checked) => handleChange("notifications", "email", checked)}
                  />
                </div>

                <Separator className="bg-neutral-800" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <div>
                      <Label htmlFor="notifications-push">Notificações Push</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba notificações em tempo real no seu dispositivo.
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="notifications-push"
                    checked={formData.notifications.push}
                    onCheckedChange={(checked) => handleChange("notifications", "push", checked)}
                  />
                </div>

                <Separator className="bg-neutral-800" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <Label htmlFor="notifications-tasks">Lembretes de Tarefas</Label>
                      <p className="text-sm text-muted-foreground">Receba lembretes sobre tarefas próximas do prazo.</p>
                    </div>
                  </div>
                  <Switch
                    id="notifications-tasks"
                    checked={formData.notifications.tasks}
                    onCheckedChange={(checked) => handleChange("notifications", "tasks", checked)}
                  />
                </div>

                <Separator className="bg-neutral-800" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <div>
                      <Label htmlFor="notifications-system">Notificações do Sistema</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba atualizações sobre o sistema e novos recursos.
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="notifications-system"
                    checked={formData.notifications.system}
                    onCheckedChange={(checked) => handleChange("notifications", "system", checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sons</h3>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-primary" />
                    <div>
                      <Label htmlFor="sounds-effects">Efeitos Sonoros</Label>
                      <p className="text-sm text-muted-foreground">Sons para ações e interações no aplicativo.</p>
                    </div>
                  </div>
                  <Switch
                    id="sounds-effects"
                    checked={formData.sounds.effects}
                    onCheckedChange={(checked) => handleChange("sounds", "effects", checked)}
                  />
                </div>

                <Separator className="bg-neutral-800" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-primary" />
                    <div>
                      <Label htmlFor="sounds-achievements">Sons de Conquistas</Label>
                      <p className="text-sm text-muted-foreground">Sons ao completar tarefas e ganhar XP.</p>
                    </div>
                  </div>
                  <Switch
                    id="sounds-achievements"
                    checked={formData.sounds.achievements}
                    onCheckedChange={(checked) => handleChange("sounds", "achievements", checked)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="border-neutral-800 bg-black/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>Personalize a aparência do aplicativo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Tema</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer
                      ${
                        formData.appearance.theme === "dark"
                          ? "border-primary bg-primary/10"
                          : "border-neutral-800 hover:border-neutral-700"
                      }
                    `}
                    onClick={() => handleChange("appearance", "theme", "dark")}
                  >
                    <div className="h-20 w-full rounded-md bg-black flex items-center justify-center">
                      <Moon className="h-8 w-8 text-primary" />
                    </div>
                    <span className="font-medium">Escuro</span>
                  </div>

                  <div
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer
                      ${
                        formData.appearance.theme === "light"
                          ? "border-primary bg-primary/10"
                          : "border-neutral-800 hover:border-neutral-700"
                      }
                    `}
                    onClick={() => handleChange("appearance", "theme", "light")}
                  >
                    <div className="h-20 w-full rounded-md bg-neutral-200 flex items-center justify-center">
                      <Sun className="h-8 w-8 text-amber-500" />
                    </div>
                    <span className="font-medium">Claro</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
