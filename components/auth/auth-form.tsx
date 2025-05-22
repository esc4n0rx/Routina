// components/auth/auth-form.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { loginSchema, registerSchema, LoginFormValues, RegisterFormValues } from "@/lib/validations/auth";
import { useAuth } from "@/context/auth-context";
import { AuthInput } from "@/components/ui/auth-input";
import { AnimatedButton } from "@/components/ui/animated-button";

export function AuthForm() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register: registerUser, isLoading } = useAuth();

  // Form setup
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
    },
  });

  // Handle form submissions
  const handleLogin = async (data: LoginFormValues) => {
    await login(data.email, data.senha);
  };

  const handleRegister = async (data: RegisterFormValues) => {
    await registerUser(data.nome, data.email, data.senha);
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    loginForm.reset();
    registerForm.reset();
    setShowPassword(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
    >
      <AnimatePresence mode="wait">
        {isRegisterMode ? (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-[#1a103c]/80 backdrop-blur-md border border-purple-500/20 p-6 rounded-2xl shadow-[0_0px_30px_-5px_rgba(138,43,226,0.3)]"
          >
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-1">Comece Grátis</h1>
              <p className="text-gray-300">Grátis para sempre. Não precisa de cartão</p>
            </div>

            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-gray-300 ml-1">
                  Email
                </label>
                <AuthInput
                  {...registerForm.register("email")}
                  id="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  icon={<Mail className="h-5 w-5 text-gray-500" />}
                  error={registerForm.formState.errors.email?.message}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="nome" className="text-gray-300 ml-1">
                  Seu Nome
                </label>
                <AuthInput
                  {...registerForm.register("nome")}
                  id="nome"
                  type="text"
                  placeholder="@seunome"
                  icon={<Mail className="h-5 w-5 text-gray-500" />}
                  error={registerForm.formState.errors.nome?.message}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="senha" className="text-gray-300 ml-1">
                    Senha
                  </label>
                </div>
                <AuthInput
                  {...registerForm.register("senha")}
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  icon={<Lock className="h-5 w-5 text-gray-500" />}
                  error={registerForm.formState.errors.senha?.message}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  }
                />
              </div>

              <AnimatedButton
                type="submit"
                disabled={isLoading}
                loading={isLoading}
                loadingText="Cadastrando..."
              >
                Cadastrar
              </AnimatedButton>
            </form>

            <p className="text-center mt-6 text-gray-400 text-sm">
              Já tem uma conta?{" "}
              <button onClick={toggleMode} className="text-purple-400 hover:text-purple-300 hover:underline">
                Entrar
              </button>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-[#1a103c]/80 backdrop-blur-md border border-purple-500/20 p-6 rounded-2xl shadow-[0_0px_30px_-5px_rgba(138,43,226,0.3)]"
          >
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-1">Bem-vindo de volta!</h1>
              <p className="text-gray-300">sentimos sua falta</p>
            </div>

            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="login-email" className="text-gray-300 ml-1">
                  Email
                </label>
                <AuthInput
                  {...loginForm.register("email")}
                  id="login-email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  icon={<Mail className="h-5 w-5 text-gray-500" />}
                  error={loginForm.formState.errors.email?.message}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="login-senha" className="text-gray-300 ml-1">
                    Senha
                  </label>
                  <a href="#" className="text-sm text-purple-400 hover:text-purple-300">
                    Esqueceu a senha?
                  </a>
                </div>
                <AuthInput
                  {...loginForm.register("senha")}
                  id="login-senha"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  icon={<Lock className="h-5 w-5 text-gray-500" />}
                  error={loginForm.formState.errors.senha?.message}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  }
                />
              </div>

              <AnimatedButton
                type="submit"
                disabled={isLoading}
                loading={isLoading}
                loadingText="Entrando..."
              >
                Entrar
              </AnimatedButton>
            </form>

            <p className="text-center mt-6 text-gray-400 text-sm">
              Não tem uma conta?{" "}
              <button onClick={toggleMode} className="text-purple-400 hover:text-purple-300 hover:underline">
                Cadastre-se
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}