// services/api/neurolink-service.ts
import { toast } from '@/hooks/use-toast';
import { cookieUtils } from '@/lib/cookie-utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.routina.fun';

// Tipos para notificações
export interface NeuroLinkNotification {
  id: string;
  tipo: 'ALERT' | 'REMINDER' | 'MOTIVATION' | 'ACHIEVEMENT' | 'PROGRESS' | 'INSIGHT';
  titulo: string;
  mensagem: string;
  status: 'PENDING' | 'SENT' | 'read' | 'DISMISSED';
  prioridade: number;
  agendado_para: string;
  enviado_em?: string;
  lido_em?: string;
  criado_em: string;
  metadata: {
    tom: string;
    emoji_principal: string;
    generated_with_ai: boolean;
  };
}

export interface NotificationSettings {
  personalidade: 'formal' | 'casual' | 'motivational' | 'friendly';
  horario_inicio: string;
  horario_fim: string;
  frequencia_maxima: number;
  tipos_habilitados: string[];
  timezone: string;
}

export interface NotificationStats {
  total_notifications: number;
  sent_notifications: number;
  read_notifications: number;
  read_rate: string;
  types_breakdown: Record<string, number>;
  priority_breakdown: Record<string, number>;
  engagement_score: string;
}

export interface NotificationFeedback {
  feedback_tipo: 'helpful' | 'perfect' | 'annoying' | 'irrelevant' | 'too_early' | 'too_late';
  comentario?: string;
}

interface ApiResponse<T> {
  erro: boolean;
  mensagem?: string;
  notifications?: T[];
  configuracoes?: NotificationSettings;
  statistics?: NotificationStats;
  notification?: T;
  feedback?: any;
  total?: number;
}

// Função para fazer requisições à API
const apiRequest = async <T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: any
): Promise<ApiResponse<T>> => {
  try {
    const token = cookieUtils.get('routina_token');
    
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

    const response = await fetch(`${API_BASE_URL}/api/neurolink${endpoint}`, config);
    
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    const responseData = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const error = new Error(isJson ? responseData.mensagem || 'Erro desconhecido' : 'Erro desconhecido');
      throw error;
    }
    
    return responseData as ApiResponse<T>;
  } catch (error: any) {
    console.error('Erro na API NeuroLink:', error);
    throw error;
  }
};

export const neurolinkService = {
  // Listar notificações
  async getNotifications(params?: {
    status?: 'PENDING' | 'SENT' | 'read' | 'DISMISSED';
    tipo?: 'ALERT' | 'REMINDER' | 'MOTIVATION' | 'ACHIEVEMENT' | 'PROGRESS' | 'INSIGHT';
    limite?: number;
  }): Promise<ApiResponse<NeuroLinkNotification>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.tipo) searchParams.append('tipo', params.tipo);
    if (params?.limite) searchParams.append('limite', params.limite.toString());
    
    const queryString = searchParams.toString();
    const endpoint = `/notifications${queryString ? `?${queryString}` : ''}`;
    
    return await apiRequest<NeuroLinkNotification>(endpoint);
  },

  // Marcar como lida
  async markAsRead(notificationId: string): Promise<ApiResponse<NeuroLinkNotification>> {
    return await apiRequest<NeuroLinkNotification>(`/notifications/${notificationId}/read`, 'PATCH');
  },

  // Obter configurações
  async getSettings(): Promise<ApiResponse<NotificationSettings>> {
    return await apiRequest<NotificationSettings>('/settings');
  },

  // Atualizar configurações
  async updateSettings(settings: NotificationSettings): Promise<ApiResponse<NotificationSettings>> {
    return await apiRequest<NotificationSettings>('/settings', 'PUT', settings);
  },

  // Obter estatísticas
  async getStats(): Promise<ApiResponse<NotificationStats>> {
    return await apiRequest<NotificationStats>('/stats');
  },

  // Enviar feedback
  async sendFeedback(notificationId: string, feedback: NotificationFeedback): Promise<ApiResponse<any>> {
    return await apiRequest<any>(`/notifications/${notificationId}/feedback`, 'POST', feedback);
  },

  // Gerar notificação manual (opcional)
  async generateNotification(data: {
    tipo: 'ALERT' | 'REMINDER' | 'MOTIVATION' | 'ACHIEVEMENT' | 'PROGRESS' | 'INSIGHT';
    tarefa_id?: string;
    objetivo: string;
  }): Promise<ApiResponse<NeuroLinkNotification>> {
    return await apiRequest<NeuroLinkNotification>('/generate', 'POST', data);
  }
};