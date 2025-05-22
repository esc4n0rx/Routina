import { toast } from '@/hooks/use-toast';
import { cookieUtils } from '@/lib/cookie-utils';

// Definição da API base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.routina.fun';

// Tipos para autenticação
export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface RegisterData {
  nome: string;
  email: string;
  senha: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  nivel: number;
  pontos_xp: number;
  sequencia: number;
  criado_em: string;
}

export interface AuthResponse {
  erro: boolean;
  mensagem: string;
  usuario: User;
  token?: string;
}

// Função genérica para lidar com erros da API
const handleApiError = (error: any): never => {
  console.error('Erro na API:', error);
  
  if (error.response) {
    // O servidor respondeu com um status fora do intervalo 2xx
    const errorMessage = error.response.data?.mensagem || 'Ocorreu um erro no servidor';
    toast({
      title: 'Erro',
      description: errorMessage,
      variant: 'destructive',
    });
  } else if (error.request) {
    // A requisição foi feita mas não houve resposta
    toast({
      title: 'Erro de conexão',
      description: 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.',
      variant: 'destructive',
    });
  } else {
    // Algo aconteceu na configuração da requisição
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
    
    // Verificar se a resposta é JSON antes de fazer o parse
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    const responseData = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      // Resposta não foi bem-sucedida
      const error = new Error(isJson ? responseData.mensagem || 'Erro desconhecido' : 'Erro desconhecido');
      (error as any).response = { status: response.status, data: responseData };
      throw error;
    }
    
    return responseData as T;
  } catch (error) {
    return handleApiError(error);
  }
};

// Serviços de autenticação
export const authService = {
  // Login de usuário
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiRequest<AuthResponse>('/api/usuarios/login', 'POST', credentials);
      
      if (!response.erro && response.token) {
        // Armazenar token em cookie seguro (7 dias de expiração)
        cookieUtils.set('routina_token', response.token, {
          maxAge: 604800, // 7 dias em segundos
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
        
        // Armazenar usuário no localStorage
        localStorage.setItem('routina_user', JSON.stringify(response.usuario));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Registro de usuário
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiRequest<AuthResponse>('/api/usuarios/registro', 'POST', data);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Validar token do usuário
  async validateToken(): Promise<AuthResponse> {
    try {
      // Obter token do cookie
      const token = cookieUtils.get('routina_token');
      
      if (!token) {
        throw new Error('Token não encontrado');
      }
      
      const response = await apiRequest<AuthResponse>('/api/usuarios/validar', 'GET', undefined, token);
      return response;
    } catch (error) {
      // Limpar dados de autenticação em caso de erro
      this.logout();
      throw error;
    }
  },
  
  // Obter usuário atual
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('routina_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      this.logout();
      return null;
    }
  },
  
  // Verificar se o usuário está autenticado
  isAuthenticated(): boolean {
    return cookieUtils.exists('routina_token');
  },
  
  // Logout de usuário
  logout(): void {
    // Remover cookie do token
    cookieUtils.remove('routina_token');
    localStorage.removeItem('routina_user');
  }
}