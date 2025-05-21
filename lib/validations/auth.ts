import * as z from 'zod';

// Schema de validação para o formulário de login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email é obrigatório' })
    .email({ message: 'Email inválido' }),
  senha: z
    .string()
    .min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
});

// Schema de validação para o formulário de registro
export const registerSchema = z.object({
  nome: z
    .string()
    .min(3, { message: 'Nome deve ter pelo menos 3 caracteres' })
    .max(100, { message: 'Nome deve ter no máximo 100 caracteres' }),
  email: z
    .string()
    .min(1, { message: 'Email é obrigatório' })
    .email({ message: 'Email inválido' }),
  senha: z
    .string()
    .min(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
    .max(100, { message: 'A senha deve ter no máximo 100 caracteres' }),
  confirmarSenha: z
    .string()
    .min(1, { message: 'Confirme sua senha' }),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

// Tipo derivado do schema de login
export type LoginFormValues = z.infer<typeof loginSchema>;

// Tipo derivado do schema de registro
export type RegisterFormValues = z.infer<typeof registerSchema>;