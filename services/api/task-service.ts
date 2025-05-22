import { toast } from '@/hooks/use-toast';
import { cookieUtils } from '@/lib/cookie-utils';

// Definição da API base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.routina.fun';

// Tipos para tarefas
export interface Task {
  id: string;
  usuario_id: string;
  nome: string;
  descricao?: string;
  data_vencimento?: string;
  hora_vencimento?: string;
  pontos: number;
  concluida: boolean;
  vencida: boolean;
  data_criacao: string;
  data_conclusao?: string | null;
  categorias?: Category[];
  tags?: Tag[];
}

export interface Category {
  id: string;
  nome: string;
  cor: string;
  icone: string;
  padrao: boolean;
}

export interface Tag {
  id: string;
  nome: string;
  cor: string;
  padrao: boolean;
}

export interface CreateTaskData {
  nome: string;
  descricao?: string;
  data_vencimento?: string;
  hora_vencimento?: string;
  pontos: number;
  categorias?: string[];
  tags?: string[];
}

export interface UpdateTaskData {
  nome?: string;
  descricao?: string;
  data_vencimento?: string;
  hora_vencimento?: string;
  pontos?: number;
}

export interface AdiarTaskData {
  data_vencimento: string;
  hora_vencimento?: string;
}

export interface ApiResponse<T> {
  erro: boolean;
  mensagem: string;
  tarefa?: T;
  tarefas?: T[];
  categorias?: Category[];
  tags?: Tag[];
  categoria?: Category;
  tag?: Tag;
}

// Função genérica para lidar com erros da API
const handleApiError = (error: any): never => {
  console.error('Erro na API:', error);
  
  if (error.response) {
    const errorMessage = error.response.data?.mensagem || 'Ocorreu um erro no servidor';
    toast({
      title: 'Erro',
      description: errorMessage,
      variant: 'destructive',
    });
  } else if (error.request) {
    toast({
      title: 'Erro de conexão',
      description: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
      variant: 'destructive',
    });
  } else {
    toast({
      title: 'Erro',
      description: error.message || 'Ocorreu um erro inesperado',
      variant: 'destructive',
    });
  }
  
  throw error;
};

// Função para fazer requisições à API
const apiRequest = async <T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: any, 
  token?: string
): Promise<T> => {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    const responseData = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const error = new Error(isJson ? responseData.mensagem || 'Erro desconhecido' : 'Erro desconhecido');
      (error as any).response = { status: response.status, data: responseData };
      throw error;
    }
    
    return responseData as T;
  } catch (error) {
    return handleApiError(error);
  }
};

// Função para obter token do cookie
const getTokenFromCookie = (): string | undefined => {
  return cookieUtils.get('routina_token') ?? undefined;
};

// Serviços de tarefas
export const taskService = {
  // Criar tarefa
  async createTask(data: CreateTaskData): Promise<ApiResponse<Task>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<Task>>('/api/tarefas', 'POST', data, token);
  },

  // Listar tarefas
  async getTasks(): Promise<ApiResponse<Task[]>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<Task[]>>('/api/tarefas', 'GET', undefined, token);
  },

  // Obter tarefa por ID
  async getTask(id: string): Promise<ApiResponse<Task>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<Task>>(`/api/tarefas/${id}`, 'GET', undefined, token);
  },

  // Atualizar tarefa
  async updateTask(id: string, data: UpdateTaskData): Promise<ApiResponse<Task>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<Task>>(`/api/tarefas/${id}`, 'PUT', data, token);
  },

  // Adiar tarefa
  async delayTask(id: string, data: AdiarTaskData): Promise<ApiResponse<Task>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<Task>>(`/api/tarefas/${id}/adiar`, 'PATCH', data, token);
  },

  // Concluir tarefa
  async completeTask(id: string): Promise<ApiResponse<Task>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<Task>>(`/api/tarefas/${id}/concluir`, 'PATCH', undefined, token);
  },

  // Excluir tarefa
  async deleteTask(id: string): Promise<ApiResponse<void>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<void>>(`/api/tarefas/${id}`, 'DELETE', undefined, token);
  },

  // Adicionar categoria a uma tarefa
  async addCategoryToTask(taskId: string, categoryId: string): Promise<ApiResponse<Category[]>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<Category[]>>(`/api/tarefas/${taskId}/categorias`, 'POST', { categoria_id: categoryId }, token);
  },

  // Remover categoria de uma tarefa
  async removeCategoryFromTask(taskId: string, categoryId: string): Promise<ApiResponse<void>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<void>>(`/api/tarefas/${taskId}/categorias/${categoryId}`, 'DELETE', undefined, token);
  },

  // Listar categorias de uma tarefa
  async getTaskCategories(taskId: string): Promise<ApiResponse<Category[]>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<Category[]>>(`/api/tarefas/${taskId}/categorias`, 'GET', undefined, token);
  },

  // Adicionar tag a uma tarefa
  async addTagToTask(taskId: string, tagId: string): Promise<ApiResponse<Tag[]>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<Tag[]>>(`/api/tarefas/${taskId}/tags`, 'POST', { tag_id: tagId }, token);
  },

  // Remover tag de uma tarefa
  async removeTagFromTask(taskId: string, tagId: string): Promise<ApiResponse<void>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<void>>(`/api/tarefas/${taskId}/tags/${tagId}`, 'DELETE', undefined, token);
  },

  // Listar tags de uma tarefa
  async getTaskTags(taskId: string): Promise<ApiResponse<Tag[]>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<Tag[]>>(`/api/tarefas/${taskId}/tags`, 'GET', undefined, token);
  }
};

// Serviços de categorias
export const categoryService = {
  // Listar categorias
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<Category[]>>('/api/categorias', 'GET', undefined, token);
  },

  // Criar categoria
  async createCategory(data: { nome: string; cor: string; icone: string }): Promise<ApiResponse<Category>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<Category>>('/api/categorias', 'POST', data, token);
  },

  // Atualizar categoria
  async updateCategory(id: string, data: { nome: string; cor: string; icone: string }): Promise<ApiResponse<Category>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<Category>>(`/api/categorias/${id}`, 'PUT', data, token);
  },

  // Excluir categoria
  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<void>>(`/api/categorias/${id}`, 'DELETE', undefined, token);
  }
};

// Serviços de tags
export const tagService = {
  // Listar tags
  async getTags(): Promise<ApiResponse<Tag[]>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<Tag[]>>('/api/tags', 'GET', undefined, token);
  },

  // Criar tag
  async createTag(data: { nome: string; cor: string }): Promise<ApiResponse<Tag>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<Tag>>('/api/tags', 'POST', data, token);
  },

  // Atualizar tag
  async updateTag(id: string, data: { nome: string; cor: string }): Promise<ApiResponse<Tag>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<Tag>>(`/api/tags/${id}`, 'PUT', data, token);
  },

  // Excluir tag
  async deleteTag(id: string): Promise<ApiResponse<void>> {
    const token = getTokenFromCookie();
    return await apiRequest<ApiResponse<void>>(`/api/tags/${id}`, 'DELETE', undefined, token);
  }
};