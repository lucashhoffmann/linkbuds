import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import Cookies from 'js-cookie';
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

type ApiErrorResponse = {
  errorCode?: string;
};

function attachPrimaryToken(config: InternalAxiosRequestConfig) {
  const token = Cookies.get('access-token');

  if (token) {
    config.headers.authorization = token;
  } else if (config.headers.authorization) {
    delete config.headers.authorization;
  }

  return config;
}

function shouldClearSession(error: AxiosError<ApiErrorResponse>) {
  if (error.response?.status !== 401) {
    return false;
  }

  const errorCode = error.response.data?.errorCode;

  if (!Cookies.get('access-token')) {
    return true;
  }

  return (
    errorCode === 'AUTH_TOKEN_INVALID' ||
    errorCode === 'AUTH_UNAUTHORIZED' ||
    errorCode === 'AUTH_TOKEN_MISSING'
  );
}

function handleResponseError(error: AxiosError<ApiErrorResponse>) {
  if (error.response && shouldClearSession(error)) {
    useAuthStore.getState().handleClearSession();
  }

  if (
    error.response?.status &&
    error.response.status >= 500 &&
    window.location.pathname !== routes.errors.internal
  ) {
    window.location.assign(routes.errors.internal);
  }

  return Promise.reject(error);
}

HttpAuth.interceptors.request.use(attachPrimaryToken);
HttpAuth.interceptors.response.use((res) => res, handleResponseError);
