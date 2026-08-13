import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Informe seu nome.'),
  email: z.email('Informe um email valido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
  companyName: z.string().optional(),
});

export type RegisterSchemaType = z.infer<typeof registerSchema>;
