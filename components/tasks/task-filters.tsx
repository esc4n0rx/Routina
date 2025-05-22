"use client"

import { motion } from "framer-motion"
import { Search, Filter, CheckCircle, Clock, AlertCircle, Tag as TagIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTask } from "@/context/task-context"

export function TaskFilters() {
  const {
    searchQuery,
    setSearchQuery,
    selectedStatuses,
    setSelectedStatuses,
    selectedCategories,
    setSelectedCategories,
    selectedTags,
    setSelectedTags,
    categories,
    tags,
    loadingCategories,
    loadingTags,
  } = useTask()

  const handleStatusChange = (status: string) => {
    setSelectedStatuses(
      selectedStatuses.includes(status) 
        ? selectedStatuses.filter(s => s !== status)
        : [...selectedStatuses, status]
    )
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(
      selectedCategories.includes(categoryId)
        ? selectedCategories.filter(c => c !== categoryId)
        : [...selectedCategories, categoryId]
    )
  }

  const handleTagChange = (tagId: string) => {
    setSelectedTags(
      selectedTags.includes(tagId)
        ? selectedTags.filter(t => t !== tagId)
        : [...selectedTags, tagId]
    )
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedStatuses([])
    setSelectedCategories([])
    setSelectedTags([])
  }

  const hasActiveFilters = searchQuery || selectedStatuses.length > 0 || selectedCategories.length > 0 || selectedTags.length > 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="border-neutral-800 bg-black/60 backdrop-blur-sm">
        <CardContent className="p-4 space-y-4">
          {/* Barra de busca e filtros */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar tarefas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-4 w-4" />
                    Status
                    {selectedStatuses.length > 0 && (
                      <Badge variant="secondary" className="ml-1 px-1 py-0 h-5">
                        {selectedStatuses.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={selectedStatuses.includes("completed")}
                    onCheckedChange={() => handleStatusChange("completed")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Concluídas
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedStatuses.includes("pending")}
                    onCheckedChange={() => handleStatusChange("pending")}
                  >
                    <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                    Pendentes
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={selectedStatuses.includes("overdue")}
                    onCheckedChange={() => handleStatusChange("overdue")}
                  >
                    <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                    Vencidas
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Filter className="h-4 w-4" />
                    Categoria
                    {selectedCategories.length > 0 && (
                      <Badge variant="secondary" className="ml-1 px-1 py-0 h-5">
                        {selectedCategories.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filtrar por Categoria</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {loadingCategories ? (
                    <div className="px-2 py-1 text-sm text-muted-foreground">Carregando...</div>
                  ) : (
                    categories.map((category) => (
                      <DropdownMenuCheckboxItem
                        key={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryChange(category.id)}
                      >
                        <div
                          className="mr-2 h-3 w-3 rounded-full"
                          style={{ backgroundColor: category.cor }}
                        />
                        {category.nome}
                      </DropdownMenuCheckboxItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <TagIcon className="h-4 w-4" />
                    Tags
                    {selectedTags.length > 0 && (
                      <Badge variant="secondary" className="ml-1 px-1 py-0 h-5">
                        {selectedTags.length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filtrar por Tags</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {loadingTags ? (
                    <div className="px-2 py-1 text-sm text-muted-foreground">Carregando...</div>
                  ) : (
                    tags.map((tag) => (
                      <DropdownMenuCheckboxItem
                        key={tag.id}
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={() => handleTagChange(tag.id)}
                      >
                        <div
                          className="mr-2 h-3 w-3 rounded-full"
                          style={{ backgroundColor: tag.cor }}
                        />
                        {tag.nome}
                      </DropdownMenuCheckboxItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>

          {/* Tags populares para seleção rápida */}
          {!loadingTags && tags.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Tags populares:</div>
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 8).map((tag) => (
                  <motion.button
                    key={tag.id}
                    onClick={() => handleTagChange(tag.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge
                      variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                      className={`text-xs transition-colors cursor-pointer ${
                        selectedTags.includes(tag.id)
                          ? "border-primary"
                          : "hover:border-primary/50"
                      }`}
                      style={{
                        backgroundColor: selectedTags.includes(tag.id) 
                          ? tag.cor 
                          : 'transparent',
                        borderColor: tag.cor,
                        color: selectedTags.includes(tag.id) 
                          ? 'white' 
                          : tag.cor
                      }}
                    >
                      {tag.nome}
                    </Badge>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}