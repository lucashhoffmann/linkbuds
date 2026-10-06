import { useQueryClient } from '@tanstack/react-query';
import { useMutationCache } from '@/app/cache/use-mutation-cache';
import { useQueryCache } from '@/app/cache/use-query-cache';
import { axiosErrorHandler } from '@/shared/utils/axios-error-handler.util';
import { TeamQueryKeys } from '../keys/team.keys';
import teamService from '../service/team.service';

export function useTeamUseCase() {
  return useQueryCache({
    queryKey: [TeamQueryKeys.TEAM],
    queryFn: () => teamService.get(),
  });
}

export function useTeamMutations() {
  const queryClient = useQueryClient();
  const onSuccess = () =>
    queryClient.invalidateQueries({ queryKey: [TeamQueryKeys.TEAM] });
  const onError = axiosErrorHandler;

  return {
    invite: useMutationCache({
      mutationFn: (email: string) => teamService.invite(email),
      onSuccess,
      onError,
    }),
    renewInvite: useMutationCache({
      mutationFn: (id: string) => teamService.renewInvite(id),
      onSuccess,
      onError,
    }),
    revokeInvite: useMutationCache({
      mutationFn: (id: string) => teamService.revokeInvite(id),
      onSuccess,
      onError,
    }),
    removeMember: useMutationCache({
      mutationFn: (userId: string) => teamService.removeMember(userId),
      onSuccess,
      onError,
    }),
  };
}

export function useInvitePreviewUseCase(token: string) {
  return useQueryCache({
    queryKey: [TeamQueryKeys.INVITE_PREVIEW, token],
    queryFn: () => teamService.previewInvite(token),
    retry: false,
  });
}
