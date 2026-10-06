import axios, { type AxiosError } from 'axios';
import { env } from '../config/env.config';
import { useAuthStore } from '../store/auth-store/use-auth-store';
import { routes } from '@/shared/constants/router.constants';

export const Http = axios.create({
  baseURL: env.VITE_APP_URL_ROOT,
  withCredentials: true,
});

export const HttpAuth = axios.create({
  baseURL: env.VITE_APP_URL_ROOT,
  withCredentials: true,
});

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Show the 5xx inline (e.g. payment form) instead of the error page. */
    keepPageOnServerError?: boolean;
  }
}

type ApiErrorResponse = {
  errorCode?: string;
};

function shouldClearSession(error: AxiosError<ApiErrorResponse>) {
  if (error.response?.status !== 401) {
    return false;
  }

  const errorCode = error.response.data?.errorCode;

  return errorCode === 'AUTH_UNAUTHORIZED';
}

function handleResponseError(error: AxiosError<ApiErrorResponse>) {
  if (error.response && shouldClearSession(error)) {
    useAuthStore.getState().handleClearSession();
  }

  if (
    error.response?.status &&
    error.response.status >= 500 &&
    !error.config?.keepPageOnServerError &&
    window.location.pathname !== routes.errors.internal
  ) {
    window.location.assign(routes.errors.internal);
  }

  return Promise.reject(error);
}

HttpAuth.interceptors.response.use((res) => res, handleResponseError);
