'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, authService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const { toast } = useToast();

  // Função para atualizar usuário com dados do backend
  const refreshUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const response = await authService.validateToken();
        if (!response.erro) {
          setUser(response.usuario);
          return;
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar dados do usuário:", error);
    }
  };

  // Verificar autenticação ao iniciar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        if (authService.isAuthenticated()) {
          // Tenta validar o token existente e obter dados atualizados
          const response = await authService.validateToken();
          if (!response.erro) {
            setUser(response.usuario);
          }
        }
      } catch (error) {
        console.error("Erro ao validar autenticação:", error);
        // Não mostrar toast aqui, pois pode ser uma operação normal se o usuário não estiver logado
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Função de login
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, senha: password });
      
      if (!response.erro) {
        // Usar dados reais retornados pelo backend
        setUser(response.usuario);
        
        toast({
          title: "Login bem-sucedido",
          description: `Bem-vindo de volta, ${response.usuario.nome}!`,
        });
        
        router.push('/dashboard');
      } else {
        toast({
          title: "Erro ao fazer login",
          description: response.mensagem,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      // O erro já é tratado no serviço de API
      console.error("Erro no login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função de registro
  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.register({
        nome: name,
        email,
        senha: password
      });
      
      if (!response.erro) {
        toast({
          title: "Registro concluído",
          description: "Sua conta foi criada com sucesso. Faça login para continuar.",
        });
        
        // Não logar automaticamente, apenas redirecionar para a página de login
        // Isso está em conformidade com o fluxo descrito na API
      } else {
        toast({
          title: "Erro no registro",
          description: response.mensagem,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      // O erro já é tratado no serviço de API
      console.error("Erro no registro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/');
    
    toast({
      title: "Logout realizado",
      description: "Você saiu da sua conta com sucesso.",
    });
  };

  // Função para atualizar dados do usuário (localmente e no localStorage)
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('routina_user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}