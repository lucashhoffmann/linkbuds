export interface IEnv {
  ENV?: string;
  VITE_APP_URL_ROOT?: string;
  GOOGLE_AUTH_ENABLED?: string;
  /** App hostname (e.g. linkbuds.com.br). Any other host = customer domain. */
  APP_HOST?: string;
}
