import { useQueryCache } from '@/app/cache/use-query-cache';
import { AuthQueryKeys } from '../keys/auth.keys';
import authService from '../service/auth.service';
import type { IUseGetSessionAuthProps } from '../types/auth.types';

export function useGetSessionAuthUseCase({ enabled }: IUseGetSessionAuthProps) {
  const { data, isLoading, error, refetch } = useQueryCache({
    queryKey: [AuthQueryKeys.GET_SESSION_AUTH],
    queryFn: () => authService.getSessionAuthService(),
    enabled,
  });

  return {
    cachedUserLogged: data,
    isLoadingUserLogged: isLoading,
    errorUserLogged: error,
    refetchUserLogged: refetch,
  };
}
