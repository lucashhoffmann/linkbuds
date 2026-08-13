import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Informe um email valido.'),
  password: z.string().min(1, 'Informe sua senha.'),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
