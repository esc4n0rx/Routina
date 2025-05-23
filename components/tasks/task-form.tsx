"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { CalendarIcon, X, Clock } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { categoryService, tagService, Category, Tag, Task } from "@/services/api/task-service"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"

interface TaskFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  initialData?: Task | null
}

export function TaskForm({ open, onClose, onSubmit, initialData }: TaskFormProps) {
  const { toast } = useToast()
  const isMobile = useIsMobile()
  
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    pontos: 1,
    data_vencimento: null as Date | null,
    hora_vencimento: "",
    categorias: [] as string[],
    tags: [] as string[],
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingTags, setLoadingTags] = useState(false)

  const fetchCategoriesAndTags = async () => {
    try {
      setLoadingCategories(true)
      setLoadingTags(true)

      const [categoriesResponse, tagsResponse] = await Promise.all([
        categoryService.getCategories(),
        tagService.getTags()
      ])

      if (!categoriesResponse.erro && categoriesResponse.categorias) {
        setCategories(categoriesResponse.categorias)
      }

      if (!tagsResponse.erro && tagsResponse.tags) {
        setTags(tagsResponse.tags)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias e tags:', error)
    } finally {
      setLoadingCategories(false)
      setLoadingTags(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchCategoriesAndTags()
    }
  }, [open])

  useEffect(() => {
    if (initialData) {
      const dueDate = initialData.data_vencimento ? new Date(initialData.data_vencimento) : null
      
      setFormData({
        nome: initialData.nome || "",
        descricao: initialData.descricao || "",
        pontos: initialData.pontos || 1,
        data_vencimento: dueDate,
        hora_vencimento: initialData.hora_vencimento || "",
        categorias: initialData.categorias?.map(c => c.id) || [],
        tags: initialData.tags?.map(t => t.id) || [],
      })
    } else {
      setFormData({
        nome: "",
        descricao: "",
        pontos: 1,
        data_vencimento: null,
        hora_vencimento: "",
        categorias: [],
        tags: [],
      })
    }
  }, [initialData, open])

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = formData.categorias.includes(categoryId)
      ? formData.categorias.filter(id => id !== categoryId)
      : [...formData.categorias, categoryId]
    
    handleChange("categorias", newCategories)
  }

  const handleTagToggle = (tagId: string) => {
    const newTags = formData.tags.includes(tagId)
      ? formData.tags.filter(id => id !== tagId)
      : [...formData.tags, tagId]
    
    handleChange("tags", newTags)
  }

  // Função para lidar com mudança de data no input nativo (mobile)
  const handleNativeDateChange = (dateString: string) => {
    if (dateString) {
      const date = new Date(dateString + 'T00:00:00')
      handleChange("data_vencimento", date)
    } else {
      handleChange("data_vencimento", null)
    }
  }

  // Função para formatar data para input nativo
  const formatDateForNativeInput = (date: Date | null): string => {
    if (!date) return ""
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome da tarefa é obrigatório.",
        variant: "destructive",
      })
      return
    }

    if (formData.pontos < 1 || formData.pontos > 20) {
      toast({
        title: "Erro",
        description: "Os pontos devem estar entre 1 e 20.",
        variant: "destructive",
      })
      return
    }

    // Preparar dados para envio
    const submitData = {
      nome: formData.nome.trim(),
      descricao: formData.descricao.trim() || undefined,
      pontos: formData.pontos,
      data_vencimento: formData.data_vencimento ? format(formData.data_vencimento, "yyyy-MM-dd") : undefined,
      hora_vencimento: formData.hora_vencimento || undefined,
      categorias: formData.categorias.length > 0 ? formData.categorias : undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    }

    onSubmit(submitData)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-black/90 border-neutral-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Tarefa *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              placeholder="Digite o nome da tarefa"
              required
              className="bg-background/50"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              placeholder="Descreva a tarefa (opcional)"
              className="bg-background/50 min-h-[80px]"
            />
          </div>

          {/* Pontos */}
          <div className="space-y-2">
            <Label htmlFor="pontos">Pontos XP (1-20) *</Label>
            <Input
              id="pontos"
              type="number"
              min="1"
              max="20"
              value={formData.pontos}
              onChange={(e) => handleChange("pontos", parseInt(e.target.value) || 1)}
              className="bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              Defina quantos pontos de experiência você ganhará ao completar esta tarefa
            </p>
          </div>

          {/* Data e Hora de Vencimento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_vencimento">Data de Vencimento</Label>
              <div className="flex gap-2">
                {isMobile ? (
                  // Input nativo para mobile
                  <Input
                    type="date"
                    value={formatDateForNativeInput(formData.data_vencimento)}
                    onChange={(e) => handleNativeDateChange(e.target.value)}
                    className="bg-background/50 flex-1"
                  />
                ) : (
                  // Popover com Calendar para desktop
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal bg-background/50 ${!formData.data_vencimento && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.data_vencimento ? format(formData.data_vencimento, "PPP", { locale: ptBR }) : "Selecione uma data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.data_vencimento || undefined}
                        onSelect={(date) => handleChange("data_vencimento", date)}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                )}

                {formData.data_vencimento && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleChange("data_vencimento", null)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora_vencimento">Horário</Label>
              <div className="flex gap-2">
                <Input
                  id="hora_vencimento"
                  type="time"
                  value={formData.hora_vencimento}
                  onChange={(e) => handleChange("hora_vencimento", e.target.value)}
                  className="bg-background/50"
                />
                {formData.hora_vencimento && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleChange("hora_vencimento", "")}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Categorias */}
          <div className="space-y-3">
            <Label>Categorias</Label>
            {loadingCategories ? (
              <div className="text-sm text-muted-foreground">Carregando categorias...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={formData.categorias.includes(category.id)}
                      onCheckedChange={() => handleCategoryToggle(category.id)}
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="text-sm font-normal cursor-pointer flex items-center gap-2"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.cor }}
                      />
                      {category.nome}
                    </Label>
                  </div>
                ))}
              </div>
            )}
            {formData.categorias.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.categorias.map((categoryId) => {
                  const category = categories.find(c => c.id === categoryId)
                  return category ? (
                    <Badge
                      key={category.id}
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: category.cor, color: category.cor }}
                    >
                      {category.nome}
                    </Badge>
                  ) : null
                })}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Tags</Label>
            {loadingTags ? (
              <div className="text-sm text-muted-foreground">Carregando tags...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={formData.tags.includes(tag.id)}
                      onCheckedChange={() => handleTagToggle(tag.id)}
                    />
                    <Label
                      htmlFor={`tag-${tag.id}`}
                      className="text-sm font-normal cursor-pointer flex items-center gap-2"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.cor }}
                      />
                      {tag.nome}
                    </Label>
                  </div>
                ))}
              </div>
            )}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.tags.map((tagId) => {
                  const tag = tags.find(t => t.id === tagId)
                  return tag ? (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="text-xs"
                      style={{ backgroundColor: `${tag.cor}20`, color: tag.cor }}
                    >
                      {tag.nome}
                    </Badge>
                  ) : null
                })}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{initialData ? "Salvar Alterações" : "Criar Tarefa"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}