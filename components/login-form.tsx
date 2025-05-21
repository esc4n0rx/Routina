'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { loginSchema, registerSchema, LoginFormValues, RegisterFormValues } from '@/lib/validations/auth';
import { useAuth } from '@/context/auth-context';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export function LoginForm() {
  const { login, register: registerUser, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('login');

  // Formulário de login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  // Formulário de registro
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
    },
  });

  // Manipuladores de submissão
  const handleLogin = async (data: LoginFormValues) => {
    await login(data.email, data.senha);
  };

  const handleRegister = async (data: RegisterFormValues) => {
    await registerUser(data.nome, data.email, data.senha);
    // Após registrar com sucesso, muda para a aba de login
    setActiveTab('login');
    // Reseta o formulário de registro
    registerForm.reset();
  };

  // Verifica se há algum formulário sendo enviado
  const isSubmitting = loginForm.formState.isSubmitting || registerForm.formState.isSubmitting || isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="flex flex-col items-center mb-6">
        <img src="/logo.png" alt="Routina Logo" className="w-24 h-24 mb-2" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
          Routina
        </h1>
      </div>

      <Card className="relative border-routina-purple/30 bg-routina-dark/80 backdrop-blur-sm shadow-2xl overflow-hidden">
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              "radial-gradient(circle at 0% 0%, rgba(138, 43, 226, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 100% 0%, rgba(138, 43, 226, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 100% 100%, rgba(138, 43, 226, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 0% 100%, rgba(138, 43, 226, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 0% 0%, rgba(138, 43, 226, 0.15) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          }}
        />
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Bem-vindo</CardTitle>
          <CardDescription className="text-center">Gerencie sua rotina e aumente sua produtividade</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Registro</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="seu@email.com"
                            autoComplete="email"
                            disabled={isSubmitting}
                            className="bg-background/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="senha"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <div className="flex items-center justify-between">
                          <FormLabel>Senha</FormLabel>
                          <Button variant="link" size="sm" className="px-0 text-xs h-auto" type="button">
                            Esqueceu a senha?
                          </Button>
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            autoComplete="current-password"
                            disabled={isSubmitting}
                            className="bg-background/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-routina-purple to-routina-blue hover:from-routina-purple/90 hover:to-routina-blue/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Seu nome"
                            autoComplete="name"
                            disabled={isSubmitting}
                            className="bg-background/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="seu@email.com"
                            autoComplete="email"
                            disabled={isSubmitting}
                            className="bg-background/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="senha"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            autoComplete="new-password"
                            disabled={isSubmitting}
                            className="bg-background/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmarSenha"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>Confirmar Senha</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            autoComplete="new-password"
                            disabled={isSubmitting}
                            className="bg-background/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-routina-purple to-routina-blue hover:from-routina-purple/90 hover:to-routina-blue/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrando...
                      </>
                    ) : (
                      "Registrar"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}