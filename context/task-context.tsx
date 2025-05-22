'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, Category, Tag, taskService, categoryService, tagService } from '@/services/api/task-service';
import { useToast } from '@/hooks/use-toast';

interface TaskContextType {
  // Tasks
  tasks: Task[];
  loadingTasks: boolean;
  refreshTasks: () => Promise<void>;
  
  // Categories
  categories: Category[];
  loadingCategories: boolean;
  refreshCategories: () => Promise<void>;
  
  // Tags
  tags: Tag[];
  loadingTags: boolean;
  refreshTags: () => Promise<void>;
  
  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatuses: string[];
  setSelectedStatuses: (statuses: string[]) => void;
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  
  // Filtered tasks
  filteredTasks: Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Fetch functions
  const refreshTasks = async () => {
    try {
      setLoadingTasks(true);
      const response = await taskService.getTasks();
      if (!response.erro && response.tarefas) {
        setTasks(response.tarefas.flat());
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as tarefas.',
        variant: 'destructive',
      });
    } finally {
      setLoadingTasks(false);
    }
  };

  const refreshCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoryService.getCategories();
      if (!response.erro && response.categorias) {
        setCategories(response.categorias);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const refreshTags = async () => {
    try {
      setLoadingTags(true);
      const response = await tagService.getTags();
      if (!response.erro && response.tags) {
        setTags(response.tags);
      }
    } catch (error) {
      console.error('Erro ao carregar tags:', error);
    } finally {
      setLoadingTags(false);
    }
  };

  // Filter logic
  const filteredTasks = tasks.filter(task => {
    // Search query filter
    if (searchQuery && !task.nome.toLowerCase().includes(searchQuery.toLowerCase()) && 
        (!task.descricao || !task.descricao.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }

    // Status filter
    if (selectedStatuses.length > 0) {
      const taskStatus = getTaskStatus(task);
      if (!selectedStatuses.includes(taskStatus)) {
        return false;
      }
    }

    // Category filter
    if (selectedCategories.length > 0) {
      const taskCategoryIds = task.categorias?.map(c => c.id) || [];
      if (!selectedCategories.some(catId => taskCategoryIds.includes(catId))) {
        return false;
      }
    }

    // Tag filter
    if (selectedTags.length > 0) {
      const taskTagIds = task.tags?.map(t => t.id) || [];
      if (!selectedTags.some(tagId => taskTagIds.includes(tagId))) {
        return false;
      }
    }

    return true;
  });

  // Helper function to get task status
  const getTaskStatus = (task: Task): string => {
    if (task.concluida) return 'completed';
    if (task.vencida) return 'overdue';
    
    // Check if overdue by date
    if (task.data_vencimento) {
      const now = new Date();
      const dueDate = new Date(task.data_vencimento);
      
      if (task.hora_vencimento) {
        const [hours, minutes] = task.hora_vencimento.split(':').map(Number);
        dueDate.setHours(hours, minutes, 0, 0);
      } else {
        dueDate.setHours(23, 59, 59, 999);
      }
      
      if (dueDate < now) return 'overdue';
    }
    
    return 'pending';
  };

  // Load initial data
  useEffect(() => {
    refreshTasks();
    refreshCategories();
    refreshTags();
  }, []);

  const value = {
    tasks,
    loadingTasks,
    refreshTasks,
    categories,
    loadingCategories,
    refreshCategories,
    tags,
    loadingTags,
    refreshTags,
    searchQuery,
    setSearchQuery,
    selectedStatuses,
    setSelectedStatuses,
    selectedCategories,
    setSelectedCategories,
    selectedTags,
    setSelectedTags,
    filteredTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTask() {
  const context = useContext(TaskContext);
  
  if (context === undefined) {
    throw new Error('useTask deve ser usado dentro de um TaskProvider');
  }
  
  return context;
}