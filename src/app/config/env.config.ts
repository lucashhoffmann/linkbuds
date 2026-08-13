import type { IEnv } from '@/shared/types/config.types';

export const env: IEnv = {
  ENV: import.meta.env.VITE_ENV,
  VITE_APP_URL_ROOT:
    import.meta.env.VITE_APP_URL_ROOT || 'http://localhost:3030',
  COOKIE_DOMAIN: import.meta.env.VITE_COOKIE_DOMAIN,
  COOKIE_LOCAL: import.meta.env.VITE_COOKIE_LOCAL || 'localhost',
};
