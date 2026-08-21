import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email({ error: 'Email inválido' }),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type SignInFormData = z.infer<typeof signInSchema>;

export type SignInFieldErrors = {
  email: string | null;
  password: string | null;
};

export const emptySignInFieldErrors: SignInFieldErrors = {
  email: null,
  password: null,
};
