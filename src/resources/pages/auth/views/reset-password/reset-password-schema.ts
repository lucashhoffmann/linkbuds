import { z } from 'zod';

/** New password + confirmation. Reused by the settings password form. */
export const newPasswordSchema = z
  .object({
    newPassword: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não conferem.',
    path: ['confirmPassword'],
  });

export type NewPasswordSchemaType = z.infer<typeof newPasswordSchema>;
