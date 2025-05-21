import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
// import { jest } from '@jest/globals';
import { LoginForm } from '@/components/login-form';
import { AuthProvider } from '@/context/auth-context';
import { mockUser } from '../__mocks__/user';

// Mock do useRouter
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
    };
  },
}));

// Mock do serviço de API
jest.mock('@/services/api', () => ({
  authService: {
    login: jest.fn().mockImplementation((credentials) => {
      if (credentials.email === 'test@example.com' && credentials.senha === 'password123') {
        return Promise.resolve({
          erro: false,
          mensagem: 'Login realizado com sucesso',
          usuario: mockUser,
          token: 'fake-jwt-token',
        });
      } else {
        return Promise.resolve({
          erro: true,
          mensagem: 'Credenciais inválidas',
        });
      }
    }),
    register: jest.fn().mockImplementation((data) => {
      if (data.email === 'existing@example.com') {
        return Promise.resolve({
          erro: true,
          mensagem: 'Email já está em uso',
        });
      }
      return Promise.resolve({
        erro: false,
        mensagem: 'Usuário registrado com sucesso',
        usuario: {
          ...mockUser,
          nome: data.nome,
          email: data.email,
        },
      });
    }),
    isAuthenticated: jest.fn().mockReturnValue(false),
    validateToken: jest.fn().mockResolvedValue({
      erro: false,
      mensagem: 'Token válido',
      usuario: mockUser,
    }),
    getCurrentUser: jest.fn().mockReturnValue(null),
    logout: jest.fn(),
    getTokenFromCookie: jest.fn().mockReturnValue(null),
  },
}));

// Mock do useToast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('LoginForm Component', () => {
  const setup = () => {
    return render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza o formulário de login', () => {
    setup();
    expect(screen.getByText('Bem-vindo')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /registro/i })).toBeInTheDocument();
  });

  test('alterna entre os formulários de login e registro', () => {
    setup();
    
    // Inicialmente no formulário de login
    expect(screen.getByRole('tab', { name: /login/i })).toHaveAttribute('aria-selected', 'true');
    
    // Muda para o formulário de registro
    fireEvent.click(screen.getByRole('tab', { name: /registro/i }));
    expect(screen.getByRole('tab', { name: /registro/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByPlaceholderText('Seu nome')).toBeInTheDocument();
    
    // Volta para o formulário de login
    fireEvent.click(screen.getByRole('tab', { name: /login/i }));
    expect(screen.getByRole('tab', { name: /login/i })).toHaveAttribute('aria-selected', 'true');
  });

  test('faz login com credenciais válidas', async () => {
    setup();
    
    // Preenche o formulário de login
    fireEvent.change(screen.getByPlaceholderText(/seu@email.com/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'password123' },
    });
    
    // Submete o formulário
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verifica se o login foi bem-sucedido
    await waitFor(() => {
      expect(require('@/services/api').authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  test('mostra erro com credenciais inválidas', async () => {
    setup();
    
    // Preenche o formulário de login com credenciais inválidas
    fireEvent.change(screen.getByPlaceholderText(/seu@email.com/i), {
      target: { value: 'wrong@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'wrongpassword' },
    });
    
    // Submete o formulário
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    
    // Verifica se o login falhou
    await waitFor(() => {
      expect(require('@/services/api').authService.login).toHaveBeenCalledWith('wrong@example.com', 'wrongpassword');
    });
  });

  test('registra um novo usuário', async () => {
    setup();
    
    // Muda para o formulário de registro
    fireEvent.click(screen.getByRole('tab', { name: /registro/i }));
    
    // Preenche o formulário de registro
    fireEvent.change(screen.getByPlaceholderText('Seu nome'), {
      target: { value: 'Novo Usuário' },
    });
    
    fireEvent.change(screen.getAllByPlaceholderText(/seu@email.com/i)[1], {
      target: { value: 'novo@example.com' },
    });
    
    const passwordInputs = screen.getAllByLabelText(/senha/i);
    
    fireEvent.change(passwordInputs[1], {
      target: { value: 'senha123' },
    });
    
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), {
      target: { value: 'senha123' },
    });
    
    // Submete o formulário
    fireEvent.click(screen.getByRole('button', { name: /registrar/i }));
    
    // Verifica se o registro foi bem-sucedido
    await waitFor(() => {
      expect(require('@/services/api').authService.register).toHaveBeenCalledWith('Novo Usuário', 'novo@example.com', 'senha123');
    });
  });

  test('mostra erro ao registrar com email existente', async () => {
    setup();
    
    // Muda para o formulário de registro
    fireEvent.click(screen.getByRole('tab', { name: /registro/i }));
    
    // Preenche o formulário de registro com email já existente
    fireEvent.change(screen.getByPlaceholderText('Seu nome'), {
      target: { value: 'Usuário Existente' },
    });
    
    fireEvent.change(screen.getAllByPlaceholderText(/seu@email.com/i)[1], {
      target: { value: 'existing@example.com' },
    });
    
    const passwordInputs = screen.getAllByLabelText(/senha/i);
    
    fireEvent.change(passwordInputs[1], {
      target: { value: 'senha123' },
    });
    
    fireEvent.change(screen.getByLabelText(/confirmar senha/i), {
      target: { value: 'senha123' },
    });
    
    // Submete o formulário
    fireEvent.click(screen.getByRole('button', { name: /registrar/i }));
    
    // Verifica se o registro falhou devido a email já existente
    await waitFor(() => {
      expect(require('@/services/api').authService.register).toHaveBeenCalledWith('Usuário Existente', 'existing@example.com', 'senha123');
    });
  });
});