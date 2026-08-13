import { useMutationCache } from '@/app/cache/use-mutation-cache';
import { AuthMutationKeys } from '../keys/auth.keys';
import authService from '../service/auth.service';
import type { IAuthPayload } from '../types/auth.types';

export function useLoginUseCase() {
  const { mutateAsync, isPending, isError } = useMutationCache({
    mutationKey: [AuthMutationKeys.LOGIN],
    mutationFn: (data: IAuthPayload) => authService.loginService(data),
  });

  return {
    mutateAuth: mutateAsync,
    isPendingMutateAuth: isPending,
    isErrorAuth: isError,
  };
}
