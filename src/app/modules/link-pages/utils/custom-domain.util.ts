import { env } from '@/app/config/env.config';

/**
 * A customer domain is any host other than the app's (`VITE_APP_HOST`).
 * Unset app host (dev) = never a customer domain.
 */
export function isCustomDomain(
  hostname = window.location.hostname,
  appHost = env.APP_HOST,
) {
  return Boolean(appHost) && hostname.toLowerCase() !== appHost?.toLowerCase();
}
