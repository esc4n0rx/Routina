import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que não exigem autenticação
const publicRoutes = ['/', '/login', '/registro'];

// Função de middleware para verificar autenticação
export function middleware(request: NextRequest) {
  const token = request.cookies.get('routina_token')?.value;
  const { pathname } = request.nextUrl;
  
  // Verificar se a rota atual precisa de autenticação
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  
  // Se for uma rota pública, permite o acesso
  if (isPublicRoute) {
    // Se já estiver autenticado e tentando acessar uma rota pública, redireciona para o dashboard
    if (token && pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    return NextResponse.next();
  }
  
  // Se for uma rota protegida e não estiver autenticado, redireciona para a página inicial
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Se estiver autenticado e a rota exigir autenticação, permite o acesso
  return NextResponse.next();
}

// Configuração para aplicar o middleware apenas às rotas especificadas
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\.png$).*)'],
};