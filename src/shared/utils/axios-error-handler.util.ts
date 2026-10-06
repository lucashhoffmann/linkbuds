import { AxiosError } from 'axios';
import { toast } from 'sonner';

type ApiErrorPayload = {
  message?: string;
  errorCode?: string;
  /** better-auth error code (its messages are in English). */
  code?: string;
};

const BETTER_AUTH_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'Email ou senha inválidos.',
  INVALID_PASSWORD: 'Senha atual incorreta.',
  INVALID_TOKEN: 'Link inválido ou expirado. Peça um novo.',
  PASSWORD_TOO_SHORT: 'A senha deve ter pelo menos 6 caracteres.',
  CREDENTIAL_ACCOUNT_NOT_FOUND:
    'Sua conta entra com Google e ainda não tem senha. Use "Esqueci minha senha" no login para criar uma.',
};

export function axiosErrorHandler(error: unknown) {
  if (!(error instanceof AxiosError)) {
    console.error('Erro nao esperado:', error);
    toast.error(error instanceof Error ? error.message : 'Erro nao esperado');
    return;
  }

  const payload = error.response?.data as ApiErrorPayload | undefined;
  const message =
    (payload?.code && BETTER_AUTH_MESSAGES[payload.code]) ||
    payload?.message ||
    payload?.errorCode ||
    'Ocorreu um erro inesperado';

  toast.error(message);
}
