import { createAuthClient } from 'better-auth/react';
import { env } from '@/app/config/env.config';

export const authClient = createAuthClient({
  baseURL: env.VITE_APP_URL_ROOT,
});

export function isGoogleAuthEnabled() {
  return ['1', 'true', 'yes', 'on'].includes(
    (env.GOOGLE_AUTH_ENABLED ?? '').trim().toLowerCase(),
  );
}
