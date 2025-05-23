// components/protected-route.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useAfterLoginActions } from '@/hooks/use-auth-after-login';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // Executa ações após o login bem-sucedido
  useAfterLoginActions();

  useEffect(() => {
    // Se não estiver carregando e não houver usuário autenticado, redireciona para a página inicial
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [isLoading, user, router]);

  // Se estiver carregando ou não existir usuário, não renderiza nada (ou pode mostrar um spinner)
  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Se existir usuário, renderiza o conteúdo protegido
  return <>{children}</>;
}