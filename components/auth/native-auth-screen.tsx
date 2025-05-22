"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ArrowRight, Sparkles, Zap, Target } from "lucide-react";
import { loginSchema, registerSchema, LoginFormValues, RegisterFormValues } from "@/lib/validations/auth";
import { useAuth } from "@/context/auth-context";
import { FloatingParticles } from "@/components/ui/floating-particles";
import { NativeInput } from "@/components/ui/native-input";
import { NativeButton } from "@/components/ui/native-button";

export function NativeAuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
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

  const switchMode = () => {
    setIsLogin(!isLogin);
    loginForm.reset();
    registerForm.reset();
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#0F0A1F] via-[#1a103c] to-[#2D1B4E]">
      {/* Fundo com partículas */}
      <FloatingParticles />
      
      {/* Gradiente de fundo dinâmico */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-64 h-64 bg-pink-500/20 rounded-full filter blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Logo e branding */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.div
            className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-2xl overflow-hidden"
            animate={{
              boxShadow: [
                '0 0 20px rgba(139, 92, 246, 0.3)',
                '0 0 40px rgba(139, 92, 246, 0.5)',
                '0 0 20px rgba(139, 92, 246, 0.3)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <img 
              src="/logo.png" 
              alt="Routina Logo" 
              className="w-16 h-16 object-contain rounded-2xl"
            />
          </motion.div>
          
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2"
            animate={{
              backgroundPosition: ['0%', '100%', '0%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            Routina
          </motion.h1>
          
          <p className="text-gray-300 text-lg">
            Transforme sua rotina em conquistas
          </p>
        </motion.div>

        {/* Card de formulário */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div
            className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl"
            style={{
              backdropFilter: 'blur(40px)',
            }}
          >
            {/* Toggle entre Login/Registro */}
            <div className="flex mb-8 p-1 bg-white/5 rounded-2xl backdrop-blur-sm">
              <motion.button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                  isLogin 
                    ? 'bg-white/10 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                Entrar
              </motion.button>
              <motion.button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                  !isLogin 
                    ? 'bg-white/10 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                Cadastrar
              </motion.button>
            </div>

            {/* Formulário */}
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                    <NativeInput
                      label="Email"
                      type="email"
                      {...loginForm.register("email")}
                      placeholder="Digite seu email"
                      error={loginForm.formState.errors.email?.message}
                    />

                    <NativeInput
                      label="Senha"
                      type={showPassword ? "text" : "password"}
                      {...loginForm.register("senha")}
                      placeholder="Digite sua senha"
                      error={loginForm.formState.errors.senha?.message}
                      rightIcon={
                        <motion.button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-white transition-colors"
                          whileTap={{ scale: 0.95 }}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </motion.button>
                      }
                    />

                    <div className="pt-4">
                      <NativeButton 
                        type="submit" 
                        loading={isLoading}
                        disabled={isLoading}
                      >
                        Entrar na Routina
                      </NativeButton>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-6">
                    <NativeInput
                      label="Nome"
                      {...registerForm.register("nome")}
                      placeholder="Digite seu nome"
                      error={registerForm.formState.errors.nome?.message}
                    />

                    <NativeInput
                      label="Email"
                      type="email"
                      {...registerForm.register("email")}
                      placeholder="Digite seu email"
                      error={registerForm.formState.errors.email?.message}
                    />

                    <NativeInput
                      label="Senha"
                      type={showPassword ? "text" : "password"}
                      {...registerForm.register("senha")}
                      placeholder="Digite sua senha"
                      error={registerForm.formState.errors.senha?.message}
                      rightIcon={
                        <motion.button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-white transition-colors"
                          whileTap={{ scale: 0.95 }}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </motion.button>
                      }
                    />

                    <NativeInput
                      label="Confirmar Senha"
                      type="password"
                      {...registerForm.register("confirmarSenha")}
                      placeholder="Confirme sua senha"
                      error={registerForm.formState.errors.confirmarSenha?.message}
                    />

                    <div className="pt-4">
                      <NativeButton 
                        type="submit" 
                        loading={isLoading}
                        disabled={isLoading}
                      >
                        Começar Jornada
                      </NativeButton>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 pt-6 border-t border-white/10"
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-2">
                  <div className="w-8 h-8 mx-auto bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-purple-300" />
                  </div>
                  <p className="text-xs text-gray-300">Metas</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 mx-auto bg-pink-500/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-pink-300" />
                  </div>
                  <p className="text-xs text-gray-300">Gamificação</p>
                </div>
                <div className="space-y-2">
                  <div className="w-8 h-8 mx-auto bg-amber-500/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <p className="text-xs text-gray-300">Conquistas</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-gray-400 text-sm mt-8"
        >
          Transforme hábitos em conquistas épicas
        </motion.p>
      </div>
    </div>
  );
}