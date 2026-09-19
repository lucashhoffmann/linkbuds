import type { IEnv } from '@/shared/types/config.types';

export const env: IEnv = {
  ENV: import.meta.env.VITE_ENV,
  VITE_APP_URL_ROOT:
    import.meta.env.VITE_APP_URL_ROOT || 'http://localhost:3030',
  GOOGLE_AUTH_ENABLED: import.meta.env.VITE_GOOGLE_AUTH_ENABLED,
};
