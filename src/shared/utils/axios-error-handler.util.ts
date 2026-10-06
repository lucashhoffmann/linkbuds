import { AxiosError } from 'axios';
import { toast } from 'sonner';

type ApiErrorPayload = {
  message?: string;
  errorCode?: string;
};

export function axiosErrorHandler(error: unknown) {
  if (!(error instanceof AxiosError)) {
    console.error('Erro nao esperado:', error);
    toast.error(error instanceof Error ? error.message : 'Erro nao esperado');
    return;
  }

  const payload = error.response?.data as ApiErrorPayload | undefined;
  const message =
    payload?.message || payload?.errorCode || 'Ocorreu um erro inesperado';

  toast.error(message);
}
