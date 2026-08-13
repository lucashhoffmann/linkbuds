import { useMutationCache } from '@/app/cache/use-mutation-cache';
import { AuthMutationKeys } from '../keys/auth.keys';
import authService from '../service/auth.service';
import type { IRegisterPayload } from '../types/auth.types';

export function useRegisterUseCase() {
  const { mutateAsync, isPending, isError } = useMutationCache({
    mutationKey: [AuthMutationKeys.REGISTER],
    mutationFn: (data: IRegisterPayload) => authService.registerService(data),
  });

  return {
    mutateRegister: mutateAsync,
    isPendingRegister: isPending,
    isErrorRegister: isError,
  };
}
