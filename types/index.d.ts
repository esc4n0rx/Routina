// Interfaces globais da aplicação

export interface User {
  id: string;
  nome: string;
  email: string;
  nivel: number;
  pontos_xp: number;
  sequencia: number;
  criado_em: string;
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

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  type: string;
}

export interface ApiResponse<T> {
  erro: boolean;
  mensagem: string;
  data?: T;
}

// Tipos para formulários
export interface LoginForm {
  email: string;
  senha: string;
}

export interface RegisterForm {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}